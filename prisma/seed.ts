import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting expanded database seed (with Guardian Mode & Category Telemetry)...');

  // Clean existing database records
  await prisma.guardianAlert.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.beneficiary.deleteMany({});
  await prisma.user.deleteMany({});

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // 1. Create Adult / Guardian User
  const guardianUser = await prisma.user.create({
    data: {
      id: 'usr_alex_rivera',
      name: 'Alex Rivera (Parent / Guardian)',
      avgTransactionAmount: 2000.0,
      normalActiveHoursStart: 8,
      normalActiveHoursEnd: 22,
      isMinor: false,
      knownDevices: JSON.stringify(['dev_macbook_pro', 'dev_iphone_15']),
      usualLocations: JSON.stringify(['New York, US', 'Jersey City, US']),
      minorSpendLimit: 50.0,
      createdAt: sixtyDaysAgo,
    },
  });

  // 2. Create Linked Minor Account
  const minorUser = await prisma.user.create({
    data: {
      id: 'usr_jordan_minor',
      name: 'Jordan Rivera (Minor, age 12)',
      avgTransactionAmount: 25.0,
      normalActiveHoursStart: 9,
      normalActiveHoursEnd: 20,
      isMinor: true,
      guardianUserId: guardianUser.id,
      knownDevices: JSON.stringify(['dev_ipad_mini_kid']),
      usualLocations: JSON.stringify(['New York, US']),
      minorSpendLimit: 50.0,
      createdAt: thirtyDaysAgo,
    },
  });

  console.log(`👤 Guardian created: ${guardianUser.name}`);
  console.log(`🧒 Minor Account linked: ${minorUser.name}`);

  // 3. Create Categorized Beneficiaries
  const sarah = await prisma.beneficiary.create({
    data: {
      id: 'ben_sarah_j',
      userId: guardianUser.id,
      name: 'Sarah Jenkins',
      accountNumber: 'US8930129481',
      category: 'personal',
      isKnown: true,
      addedAt: thirtyDaysAgo,
    },
  });

  const wireCorp = await prisma.beneficiary.create({
    data: {
      id: 'ben_wire_corp',
      userId: guardianUser.id,
      name: 'Wire Corp Tech',
      accountNumber: 'US7104928104',
      category: 'corporate',
      isKnown: true,
      addedAt: sixtyDaysAgo,
    },
  });

  const apexGlobal = await prisma.beneficiary.create({
    data: {
      id: 'ben_apex_global',
      userId: guardianUser.id,
      name: 'Apex Global Ltd',
      accountNumber: 'US9012481029',
      category: 'crypto', // High-risk category
      isKnown: false,
      addedAt: twoHoursAgo,
    },
  });

  const metroElectric = await prisma.beneficiary.create({
    data: {
      id: 'ben_metro_electric',
      userId: guardianUser.id,
      name: 'Metro Electric Co',
      accountNumber: 'US4019284102',
      category: 'utilities',
      isKnown: true,
      addedAt: sixtyDaysAgo,
    },
  });

  const roblox = await prisma.beneficiary.create({
    data: {
      id: 'ben_roblox_gaming',
      userId: minorUser.id,
      name: 'Roblox Digital Marketplace',
      accountNumber: 'RBLX-STORE-8819',
      category: 'gaming', // High-risk category for minors
      isKnown: true,
      addedAt: thirtyDaysAgo,
    },
  });

  const steam = await prisma.beneficiary.create({
    data: {
      id: 'ben_steam_gaming',
      userId: minorUser.id,
      name: 'Steam Game Key Vault',
      accountNumber: 'STM-VALVE-0041',
      category: 'gaming',
      isKnown: true,
      addedAt: thirtyDaysAgo,
    },
  });

  const betVault = await prisma.beneficiary.create({
    data: {
      id: 'ben_betvault_gambling',
      userId: guardianUser.id,
      name: 'BetVault Sportsbook',
      accountNumber: 'BET-CRYPTO-992',
      category: 'gambling', // High-risk category
      isKnown: false,
      addedAt: twoHoursAgo,
    },
  });

  console.log(`🏦 Created categorized beneficiaries (personal, corporate, crypto, utilities, gaming, gambling)`);

  // 4. Create Historical Transactions for Adult / Guardian
  const adultTransactions = [
    {
      userId: guardianUser.id,
      beneficiaryId: sarah.id,
      beneficiaryName: sarah.name,
      amount: 450.0,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      riskScore: 0,
      riskLevel: 'LOW',
      riskFactors: JSON.stringify([{ code: 'KNOWN_PAYEE', text: 'Verified recurring beneficiary', severity: 'info' }]),
      category: 'personal',
      deviceId: 'dev_macbook_pro',
      location: 'New York, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: false,
      status: 'APPROVED',
      actionTaken: 'PROCEED',
    },
    {
      userId: guardianUser.id,
      beneficiaryId: wireCorp.id,
      beneficiaryName: wireCorp.name,
      amount: 1200.0,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      riskScore: 0,
      riskLevel: 'LOW',
      riskFactors: JSON.stringify([{ code: 'KNOWN_PAYEE', text: 'Verified corporate beneficiary', severity: 'info' }]),
      category: 'corporate',
      deviceId: 'dev_macbook_pro',
      location: 'New York, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: false,
      status: 'APPROVED',
      actionTaken: 'PROCEED',
    },
    {
      userId: guardianUser.id,
      beneficiaryId: metroElectric.id,
      beneficiaryName: metroElectric.name,
      amount: 350.0,
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      riskScore: 0,
      riskLevel: 'LOW',
      riskFactors: JSON.stringify([{ code: 'NORMAL_UTILITY', text: 'Utility payment within expected bounds', severity: 'info' }]),
      category: 'utilities',
      deviceId: 'dev_iphone_15',
      location: 'Jersey City, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: false,
      status: 'APPROVED',
      actionTaken: 'PROCEED',
    },
    {
      userId: guardianUser.id,
      beneficiaryId: apexGlobal.id,
      beneficiaryName: apexGlobal.name,
      amount: 28000.0,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      riskScore: 75,
      riskLevel: 'HIGH',
      riskFactors: JSON.stringify([
        { code: 'EXTREME_MULTIPLIER', text: 'Transfer amount exceeds 10x baseline ($2,000)', points: 40 },
        { code: 'UNKNOWN_BENEFICIARY', text: 'Payee is not in verified directory', points: 20 },
        { code: 'RECENT_BENEFICIARY', text: 'Beneficiary record created <24h ago', points: 15 },
        { code: 'MERCHANT_CATEGORY_RISK', text: 'High-risk crypto merchant category', points: 20 },
      ]),
      category: 'crypto',
      deviceId: 'dev_macbook_pro',
      location: 'New York, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: false,
      socialEngineeringAnswer: 'employer_impersonation',
      socialEngineeringScore: 35,
      deepfakeScore: 78,
      finalRiskLevel: 'HIGH',
      actionTaken: 'PAUSE_VERIFY',
      status: 'HELD',
    },
  ];

  for (const tx of adultTransactions) {
    await prisma.transaction.create({ data: tx });
  }

  // 5. Create Seed Minor Transactions & Guardian Alerts
  const minorTx1 = await prisma.transaction.create({
    data: {
      userId: minorUser.id,
      beneficiaryId: roblox.id,
      beneficiaryName: roblox.name,
      amount: 19.99,
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
      riskScore: 35,
      riskLevel: 'MEDIUM',
      riskFactors: JSON.stringify([
        { code: 'MINOR_GAMING_ALERT', text: 'Minor account initiated digital in-app purchase', severity: 'warning' },
        { code: 'MERCHANT_CATEGORY_RISK', text: 'High-risk gaming merchant category', points: 20 },
      ]),
      category: 'gaming',
      deviceId: 'dev_ipad_mini_kid',
      location: 'New York, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: true,
      status: 'APPROVED',
      actionTaken: 'PROCEED',
    },
  });

  await prisma.guardianAlert.create({
    data: {
      transactionId: minorTx1.id,
      guardianUserId: guardianUser.id,
      amount: minorTx1.amount,
      category: minorTx1.category || 'gaming',
      createdAt: minorTx1.timestamp,
      acknowledged: true,
      status: 'APPROVED',
    },
  });

  const minorTx2 = await prisma.transaction.create({
    data: {
      userId: minorUser.id,
      beneficiaryId: steam.id,
      beneficiaryName: steam.name,
      amount: 49.99,
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
      riskScore: 40,
      riskLevel: 'MEDIUM',
      riskFactors: JSON.stringify([
        { code: 'MINOR_GAMING_ALERT', text: 'Minor account digital store transaction', severity: 'warning' },
        { code: 'MERCHANT_CATEGORY_RISK', text: 'Gaming merchant category', points: 20 },
      ]),
      category: 'gaming',
      deviceId: 'dev_ipad_mini_kid',
      location: 'New York, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: true,
      status: 'APPROVED',
      actionTaken: 'PROCEED',
    },
  });

  await prisma.guardianAlert.create({
    data: {
      transactionId: minorTx2.id,
      guardianUserId: guardianUser.id,
      amount: minorTx2.amount,
      category: minorTx2.category || 'gaming',
      createdAt: minorTx2.timestamp,
      acknowledged: false, // Unacknowledged alert for demo!
      status: 'PENDING',
    },
  });

  const minorTx3 = await prisma.transaction.create({
    data: {
      userId: minorUser.id,
      beneficiaryId: roblox.id,
      beneficiaryName: roblox.name,
      amount: 120.00, // Exceeds minor spend limit ($50)!
      timestamp: new Date(now.getTime() - 5 * 60 * 1000),
      riskScore: 65,
      riskLevel: 'HIGH',
      riskFactors: JSON.stringify([
        { code: 'MINOR_THRESHOLD_EXCEEDED', text: 'Minor transfer ($120.00) exceeds guardian spend threshold ($50.00)', points: 25 },
        { code: 'MERCHANT_CATEGORY_RISK', text: 'Gaming merchant category', points: 20 },
        { code: 'HIGH_MULTIPLIER', text: 'Amount is 4.8x minor baseline ($25.00)', points: 25 },
      ]),
      category: 'gaming',
      deviceId: 'dev_ipad_mini_kid',
      location: 'New York, US',
      deviceRecognized: true,
      locationAnomaly: false,
      isMinorTransaction: true,
      status: 'HELD',
      actionTaken: 'PAUSE_VERIFY',
    },
  });

  await prisma.guardianAlert.create({
    data: {
      transactionId: minorTx3.id,
      guardianUserId: guardianUser.id,
      amount: minorTx3.amount,
      category: minorTx3.category || 'gaming',
      createdAt: minorTx3.timestamp,
      acknowledged: false,
      status: 'PENDING',
    },
  });

  console.log(`🛡️ Seeded Minor transactions and Guardian Alerts for Alex Rivera`);
  console.log('✅ Expanded seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
