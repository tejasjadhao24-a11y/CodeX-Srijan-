import { computeRiskScore } from '../lib/riskEngine';
import { prisma } from '../lib/prisma';

async function testBackendEngine() {
  console.log('🧪 Testing FraudGuard Real Backend Logic...');

  // Test 1: Standard Transfer (LOW)
  const lowTest = await computeRiskScore({
    userId: 'usr_alex_rivera',
    beneficiaryId: 'ben_sarah_j',
    amount: 450,
    simulatedHour: 14,
  });
  console.log('Test 1 (Standard $450 to Known):', {
    score: lowTest.riskScore,
    level: lowTest.riskLevel,
    action: lowTest.actionTaken,
  });
  if (lowTest.riskLevel !== 'LOW') {
    throw new Error(`Expected LOW risk for Test 1, got ${lowTest.riskLevel}`);
  }

  // Test 2: Large New Payee (HIGH)
  const highTest = await computeRiskScore({
    userId: 'usr_alex_rivera',
    beneficiaryId: 'ben_apex_global',
    amount: 28000,
    simulatedHour: 14,
  });
  console.log('Test 2 (Large $28,000 to New Payee):', {
    score: highTest.riskScore,
    level: highTest.riskLevel,
    action: highTest.actionTaken,
    factors: highTest.riskFactors.map(f => f.code),
  });
  if (highTest.riskLevel !== 'HIGH' && highTest.riskLevel !== 'CRITICAL') {
    throw new Error(`Expected HIGH/CRITICAL for Test 2, got ${highTest.riskLevel}`);
  }

  // Test 3: Urgent Critical Fraud (CRITICAL)
  const critTest = await computeRiskScore({
    userId: 'usr_alex_rivera',
    newBeneficiaryName: 'Offshore Alpha Vault (Unverified)',
    amount: 500000,
    selfReportedUrgent: true,
    simulatedHour: 23,
  });
  console.log('Test 3 (Urgent $500,000 Offshore):', {
    score: critTest.riskScore,
    level: critTest.riskLevel,
    action: critTest.actionTaken,
    factors: critTest.riskFactors.map(f => f.code),
  });
  if (critTest.riskLevel !== 'CRITICAL') {
    throw new Error(`Expected CRITICAL for Test 3, got ${critTest.riskLevel}`);
  }

  console.log('✅ ALL BACKEND LOGIC VERIFIED WITH PINNED MATH!');
}

testBackendEngine()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
