import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeRiskScore } from '@/lib/riskEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = 'usr_alex_rivera',
      beneficiaryId,
      newBeneficiaryName,
      accountNumber,
      amount,
      category,
      deviceId,
      location,
      selfReportedUrgent = false,
      simulatedHour,
      previewMode = false,
    } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid transaction amount is required' }, { status: 400 });
    }

    // Run real server-side risk evaluation engine
    const evalResult = await computeRiskScore({
      userId,
      beneficiaryId,
      newBeneficiaryName,
      accountNumber,
      amount: parsedAmount,
      category,
      deviceId,
      location,
      selfReportedUrgent,
      simulatedHour,
    });

    // If previewMode is requested (for debounced live UI feedback on Send Money page)
    if (previewMode) {
      return NextResponse.json({
        preview: true,
        riskScore: evalResult.riskScore,
        riskLevel: evalResult.riskLevel,
        riskFactors: evalResult.riskFactors,
        actionTaken: evalResult.actionTaken,
        isKnownBeneficiary: evalResult.isKnownBeneficiary,
        beneficiaryName: evalResult.beneficiaryName,
        category: evalResult.category,
        isMinor: evalResult.isMinor,
        requiresGuardianApproval: evalResult.requiresGuardianApproval,
        deviceRecognized: evalResult.deviceRecognized,
        locationAnomaly: evalResult.locationAnomaly,
      });
    }

    // Determine initial status based on risk band and minor requirements
    let initialStatus = (evalResult.riskLevel === 'LOW' || evalResult.riskLevel === 'MEDIUM') 
      ? 'APPROVED' 
      : 'PENDING';

    if (evalResult.requiresGuardianApproval) {
      initialStatus = 'HELD';
    }

    // Persist real transaction row in SQLite
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        beneficiaryId: beneficiaryId || null,
        beneficiaryName: evalResult.beneficiaryName,
        amount: parsedAmount,
        riskScore: evalResult.riskScore,
        riskLevel: evalResult.riskLevel,
        riskFactors: JSON.stringify(evalResult.riskFactors),
        actionTaken: evalResult.actionTaken,
        status: initialStatus,
        deviceId: evalResult.deviceId,
        location: evalResult.location,
        category: evalResult.category,
        deviceRecognized: evalResult.deviceRecognized,
        locationAnomaly: evalResult.locationAnomaly,
        isMinorTransaction: evalResult.isMinor,
      },
    });

    let guardianAlertId: string | undefined = undefined;

    // CORE GUARDIAN REQUIREMENT:
    // When initiated by a minor, ALWAYS write a GuardianAlert row linked to their guardianUserId
    if (evalResult.isMinor && evalResult.guardianUserId) {
      const alert = await prisma.guardianAlert.create({
        data: {
          transactionId: transaction.id,
          guardianUserId: evalResult.guardianUserId,
          amount: transaction.amount,
          category: evalResult.category || 'general',
          createdAt: transaction.timestamp,
          acknowledged: false,
          status: evalResult.requiresGuardianApproval ? 'PENDING' : 'APPROVED',
        },
      });
      guardianAlertId = alert.id;
    }

    return NextResponse.json({
      transactionId: transaction.id,
      riskScore: transaction.riskScore,
      riskLevel: transaction.riskLevel,
      riskFactors: evalResult.riskFactors,
      actionTaken: transaction.actionTaken,
      status: transaction.status,
      beneficiaryName: transaction.beneficiaryName,
      amount: transaction.amount,
      category: transaction.category,
      isMinor: evalResult.isMinor,
      requiresGuardianApproval: evalResult.requiresGuardianApproval,
      guardianAlertId,
      timestamp: transaction.timestamp,
    }, { status: 201 });
  } catch (error) {
    console.error('Error evaluating transaction:', error);
    return NextResponse.json({ error: 'Evaluation failed on server' }, { status: 500 });
  }
}
