import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RiskLevel, ActionTaken } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { overrideApproved = false } = body;

    const tx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const baseScore = tx.riskScore || 0;
    const socialScore = tx.socialEngineeringScore || 0;
    const deepfakeScore = tx.deepfakeScore || 0;
    const voiceScore = tx.voiceSignalScore || 0;

    // Calculate composite final risk score
    // Higher of base score or additive escalation from threat indicators
    const additionalThreats = Math.round((socialScore * 0.4) + (voiceScore * 0.4) + (deepfakeScore * 0.2));
    const finalScore = Math.min(100, Math.max(baseScore, Math.round(baseScore * 0.6 + additionalThreats)));

    let finalRiskLevel: RiskLevel = 'LOW';
    let actionTaken: ActionTaken = 'PROCEED';
    let status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'HELD' = 'APPROVED';

    if (finalScore <= 30) {
      finalRiskLevel = 'LOW';
      actionTaken = 'PROCEED';
      status = 'APPROVED';
    } else if (finalScore <= 55) {
      finalRiskLevel = 'MEDIUM';
      actionTaken = 'PROCEED';
      status = 'APPROVED';
    } else if (finalScore <= 80) {
      finalRiskLevel = 'HIGH';
      actionTaken = 'PAUSE_VERIFY';
      status = overrideApproved ? 'APPROVED' : 'HELD';
    } else {
      finalRiskLevel = 'CRITICAL';
      actionTaken = 'HOLD_ESCALATE';
      status = overrideApproved ? 'APPROVED' : 'HELD';
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        riskScore: finalScore,
        finalRiskLevel,
        actionTaken,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: updated.id,
        amount: updated.amount,
        beneficiaryName: updated.beneficiaryName,
        baseScore,
        socialEngineeringScore: updated.socialEngineeringScore,
        voiceSignalScore: updated.voiceSignalScore,
        transcript: updated.transcript,
        deepfakeScore: updated.deepfakeScore,
        finalScore: updated.riskScore,
        finalRiskLevel: updated.finalRiskLevel,
        actionTaken: updated.actionTaken,
        status: updated.status,
        timestamp: updated.timestamp,
      },
    });
  } catch (error) {
    console.error('Error finalizing transaction:', error);
    return NextResponse.json({ error: 'Finalization failed' }, { status: 500 });
  }
}
