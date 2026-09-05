import { prisma } from './prisma';
import { RiskFactor, RiskLevel, ActionTaken } from './types';

export interface EvaluateParams {
  userId?: string;
  beneficiaryId?: string;
  newBeneficiaryName?: string;
  accountNumber?: string;
  amount: number;
  category?: string;
  deviceId?: string;
  location?: string;
  selfReportedUrgent?: boolean;
  simulatedHour?: number;
}

export async function computeRiskScore(params: EvaluateParams) {
  const {
    userId = 'usr_alex_rivera',
    beneficiaryId,
    newBeneficiaryName,
    amount,
    category: inputCategory,
    deviceId = 'dev_macbook_pro',
    location = 'New York, US',
    selfReportedUrgent = false,
    simulatedHour,
  } = params;

  // Fetch user details including guardian relations
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { guardian: true },
  });

  const avgAmount = user ? user.avgTransactionAmount : 2000.0;
  const activeStart = user ? user.normalActiveHoursStart : 8;
  const activeEnd = user ? user.normalActiveHoursEnd : 22;
  const isMinor = user ? user.isMinor : false;
  const minorSpendLimit = user?.minorSpendLimit || 50.0;

  let score = 0;
  const factors: RiskFactor[] = [];

  // Parse known devices and usual locations
  let knownDevices: string[] = ['dev_macbook_pro', 'dev_iphone_15'];
  let usualLocations: string[] = ['New York, US', 'Jersey City, US'];
  try {
    if (user?.knownDevices) knownDevices = JSON.parse(user.knownDevices);
    if (user?.usualLocations) usualLocations = JSON.parse(user.usualLocations);
  } catch {
    // fallback
  }

  // 1. Amount Scoring — Truly mutually exclusive
  if (amount > 10 * avgAmount) {
    score += 40;
    factors.push({
      code: 'EXTREME_MULTIPLIER',
      text: `Transfer amount (${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) is >10x baseline average ($${avgAmount.toLocaleString()})`,
      points: 40,
      severity: 'critical',
    });
  } else if (amount > 3 * avgAmount) {
    score += 25;
    factors.push({
      code: 'HIGH_MULTIPLIER',
      text: `Transfer amount (${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) is >3x baseline average ($${avgAmount.toLocaleString()})`,
      points: 25,
      severity: 'warning',
    });
  }

  // 2. Beneficiary Check & Age Check
  let isKnownBeneficiary = false;
  let beneficiaryObj = null;
  let resolvedCategory = inputCategory || 'general';

  if (beneficiaryId) {
    beneficiaryObj = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
    });
    if (beneficiaryObj?.category) {
      resolvedCategory = beneficiaryObj.category;
    }
  }

  if (beneficiaryObj) {
    isKnownBeneficiary = beneficiaryObj.isKnown;
    if (!isKnownBeneficiary) {
      score += 20;
      factors.push({
        code: 'UNKNOWN_BENEFICIARY',
        text: `Beneficiary "${beneficiaryObj.name}" is not in verified trusted payee directory`,
        points: 20,
        severity: 'critical',
      });
    }

    // Check beneficiary creation age (<24h)
    const hoursSinceAdded = (Date.now() - new Date(beneficiaryObj.addedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceAdded < 24) {
      score += 15;
      factors.push({
        code: 'RECENT_BENEFICIARY',
        text: `Beneficiary record created within the last 24 hours (${Math.round(hoursSinceAdded)}h ago)`,
        points: 15,
        severity: 'warning',
      });
    }
  } else {
    // New unsaved payee
    score += 20;
    factors.push({
      code: 'NEW_UNSAVED_PAYEE',
      text: `Payee "${newBeneficiaryName || 'Unsaved Payee'}" is a new, unverified destination`,
      points: 20,
      severity: 'critical',
    });
    score += 15;
    factors.push({
      code: 'RECENT_BENEFICIARY',
      text: 'New payee created on-the-fly (age <24 hours)',
      points: 15,
      severity: 'warning',
    });
  }

  // 3. Off-Hours Check (simulatedHour or default 14:00)
  const hourToCheck = simulatedHour !== undefined ? simulatedHour : 14;
  if (hourToCheck < activeStart || hourToCheck >= activeEnd) {
    score += 10;
    factors.push({
      code: 'OFF_HOURS_ACTIVITY',
      text: `Initiated during off-hours (${String(hourToCheck).padStart(2, '0')}:00, active window ${activeStart}:00–${activeEnd}:00)`,
      points: 10,
      severity: 'warning',
    });
  }

  // 4. Velocity Check — Past 10 minutes count across all beneficiaries
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentTxCount = await prisma.transaction.count({
    where: {
      userId,
      timestamp: { gte: tenMinsAgo },
    },
  });

  if (recentTxCount > 2) {
    score += 15;
    factors.push({
      code: 'HIGH_VELOCITY',
      text: `High frequency activity detected (${recentTxCount} transfers in past 10 minutes)`,
      points: 15,
      severity: 'critical',
    });
  }

  // 5. NEW FACTOR: rapidRepeatSameMerchant (+15 if 3+ txs to the SAME beneficiary in past 10 min)
  if (beneficiaryId) {
    const sameMerchantCount = await prisma.transaction.count({
      where: {
        userId,
        beneficiaryId,
        timestamp: { gte: tenMinsAgo },
      },
    });

    if (sameMerchantCount >= 3) {
      score += 15;
      factors.push({
        code: 'RAPID_REPEAT_SAME_MERCHANT',
        text: `Rapid repeat bursts: ${sameMerchantCount} transactions to "${beneficiaryObj?.name || 'this merchant'}" in last 10 minutes`,
        points: 15,
        severity: 'critical',
      });
    }
  }

  // 6. NEW FACTOR: deviceRecognized (+20 if unrecognized/new device)
  const isDeviceKnown = knownDevices.includes(deviceId);
  if (!isDeviceKnown) {
    score += 20;
    factors.push({
      code: 'UNRECOGNIZED_DEVICE',
      text: `Transaction initiated from unrecognized hardware ID "${deviceId}" (known: ${knownDevices.join(', ')})`,
      points: 20,
      severity: 'critical',
    });
  }

  // 7. NEW FACTOR: locationAnomaly (+15 if location differs from usual locations)
  const isLocationUsual = usualLocations.some((loc) => loc.toLowerCase() === location.toLowerCase());
  if (!isLocationUsual) {
    score += 15;
    factors.push({
      code: 'LOCATION_ANOMALY',
      text: `Geographic anomaly: transfer dispatched from "${location}" (usual footprint: ${usualLocations.join(', ')})`,
      points: 15,
      severity: 'warning',
    });
  }

  // 8. NEW FACTOR: merchantCategoryRisk (+20 if category in high-risk set)
  const highRiskCategories = ['gaming', 'gambling', 'crypto', 'gift_cards'];
  const isHighRiskCategory = highRiskCategories.includes(resolvedCategory.toLowerCase());
  if (isHighRiskCategory) {
    score += 20;
    factors.push({
      code: 'MERCHANT_CATEGORY_RISK',
      text: `High-risk merchant industry vertical: [${resolvedCategory.toUpperCase()}]`,
      points: 20,
      severity: 'warning',
    });
  }

  // 9. NEW FACTOR: accountAgeVsAmount (+15 if paying account is <7 days old AND amount > 5x average)
  if (user) {
    const daysSinceUserCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUserCreation < 7 && amount > 5 * avgAmount) {
      score += 15;
      factors.push({
        code: 'NEW_ACCOUNT_HIGH_AMOUNT',
        text: `Account created under 7 days ago (${Math.round(daysSinceUserCreation)}d) with transfer >5x baseline`,
        points: 15,
        severity: 'critical',
      });
    }
  }

  // 10. NEW FACTOR: behavioralShift (+10 if category doesn't match historical category mix)
  const userPastTxs = await prisma.transaction.findMany({
    where: { userId },
    select: { category: true },
    take: 20,
  });

  if (userPastTxs.length >= 3) {
    const hasPastCategoryMatch = userPastTxs.some((t) => t.category?.toLowerCase() === resolvedCategory.toLowerCase());
    if (!hasPastCategoryMatch) {
      score += 10;
      factors.push({
        code: 'BEHAVIORAL_CATEGORY_SHIFT',
        text: `Novel merchant category [${resolvedCategory}]: user has never transacted in this sector before`,
        points: 10,
        severity: 'info',
      });
    }
  }

  // 11. Urgent Round Figure Check (+5)
  if (amount >= 50000 && (amount % 50000 === 0 || amount % 100000 === 0 || amount % 500000 === 0)) {
    score += 5;
    factors.push({
      code: 'ROUND_URGENT_AMOUNT',
      text: `Urgent round-figure transfer detected (multiple of $50k/$100k/$500k)`,
      points: 5,
      severity: 'warning',
    });
  }

  // 12. Self-Reported Urgency (+10)
  if (selfReportedUrgent) {
    score += 10;
    factors.push({
      code: 'USER_REPORTED_URGENT',
      text: `User toggled emergency priority override`,
      points: 10,
      severity: 'warning',
    });
  }

  // 13. GUARDIAN MODE — Minor Account Rule Set
  let requiresGuardianApproval = false;
  if (isMinor) {
    // Flagged category (gaming/in-app) or repeat -> automatically at least MEDIUM (min 35)
    if (resolvedCategory === 'gaming' || resolvedCategory === 'gambling' || recentTxCount >= 2) {
      score = Math.max(score, 35);
      factors.push({
        code: 'MINOR_CATEGORY_FLAG',
        text: `Guardian Rule: Minor account activity in restricted vertical [${resolvedCategory.toUpperCase()}] enforced at minimum MEDIUM risk`,
        severity: 'warning',
      });
    }

    // If transfer exceeds configured minor spend threshold OR rapid repeat -> Escalate to Guardian Approval
    if (amount > minorSpendLimit || recentTxCount >= 3) {
      score = Math.max(score, 65); // escalate to HIGH
      requiresGuardianApproval = true;
      factors.push({
        code: 'GUARDIAN_APPROVAL_REQUIRED',
        text: `Guardian Spend Threshold Exceeded: Amount ($${amount.toFixed(2)}) > $${minorSpendLimit.toFixed(2)} limit. Requires Guardian Approval.`,
        points: 25,
        severity: 'critical',
      });
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Level Band
  let riskLevel: RiskLevel = 'LOW';
  let actionTaken: ActionTaken = 'PROCEED';

  if (finalScore <= 30) {
    riskLevel = 'LOW';
    actionTaken = 'PROCEED';
  } else if (finalScore <= 55) {
    riskLevel = 'MEDIUM';
    actionTaken = 'PROCEED';
  } else if (finalScore <= 80) {
    riskLevel = 'HIGH';
    actionTaken = 'PAUSE_VERIFY';
  } else {
    riskLevel = 'CRITICAL';
    actionTaken = 'HOLD_ESCALATE';
  }

  // If requiresGuardianApproval, enforce at least PAUSE_VERIFY
  if (requiresGuardianApproval && actionTaken === 'PROCEED') {
    actionTaken = 'PAUSE_VERIFY';
  }

  return {
    userId,
    userName: user?.name || 'Alex Rivera',
    isMinor,
    guardianUserId: user?.guardianUserId || null,
    requiresGuardianApproval,
    userAvgAmount: avgAmount,
    riskScore: finalScore,
    riskLevel,
    riskFactors: factors,
    actionTaken,
    isKnownBeneficiary,
    beneficiaryName: beneficiaryObj ? beneficiaryObj.name : newBeneficiaryName || 'Unsaved Beneficiary',
    category: resolvedCategory,
    deviceId,
    location,
    deviceRecognized: isDeviceKnown,
    locationAnomaly: !isLocationUsual,
  };
}
