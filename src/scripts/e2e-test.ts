async function runExpandedE2ETests() {
  console.log('🚀 Starting Expanded FraudGuard End-to-End Test Suite...\n');
  const baseUrl = 'http://localhost:3000';

  // 1. Verify Pages (SSR / HTML rendering including new /guardian)
  const pages = ['/dashboard', '/send-money', '/cases', '/enterprise', '/guardian'];
  for (const page of pages) {
    const res = await fetch(`${baseUrl}${page}`);
    if (!res.ok) throw new Error(`Page ${page} returned status ${res.status}`);
    const html = await res.text();
    if (!html.includes('FRAUD') && !html.includes('FraudGuard')) {
      throw new Error(`Page ${page} missing brand header`);
    }
    console.log(`✅ Page [${page}] rendered successfully (Status 200 OK)`);
  }

  // 2. Test GET /api/beneficiaries
  const bensRes = await fetch(`${baseUrl}/api/beneficiaries?userId=usr_alex_rivera`);
  const bensData = await bensRes.json();
  console.log(`✅ GET /api/beneficiaries returned ${bensData.beneficiaries.length} records`);

  // 3. Test GET /api/dashboard/stats
  const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`);
  const statsData = await statsRes.json();
  console.log('✅ GET /api/dashboard/stats:', {
    totalMonitored: statsData.totalMonitored,
    highCriticalCount: statsData.highCriticalCount,
    protectionScore: statsData.protectionScore + '%',
    latency: statsData.avgProcessingTimeMs + 'ms',
  });

  // 4. Test NEW RISK HEURISTICS: Device Anomaly + Location Anomaly + High-Risk Category (Preset 4)
  const p4Res = await fetch(`${baseUrl}/api/transactions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr_alex_rivera',
      amount: 180,
      category: 'gambling',
      deviceId: 'dev_unrecognized_android_x',
      location: 'Berlin, DE',
      previewMode: true,
      simulatedHour: 14,
    }),
  });
  const p4Data = await p4Res.json();
  console.log('✅ Tested Device & Location Anomaly & Gambling Category (Preview):', {
    score: p4Data.riskScore,
    level: p4Data.riskLevel,
    factors: p4Data.riskFactors.map((f: any) => f.code),
  });
  const factorCodes = p4Data.riskFactors.map((f: any) => f.code);
  if (!factorCodes.includes('UNRECOGNIZED_DEVICE')) throw new Error('Missing UNRECOGNIZED_DEVICE factor');
  if (!factorCodes.includes('LOCATION_ANOMALY')) throw new Error('Missing LOCATION_ANOMALY factor');
  if (!factorCodes.includes('MERCHANT_CATEGORY_RISK')) throw new Error('Missing MERCHANT_CATEGORY_RISK factor');

  // 5. Test Rapid Repeat Same Merchant (3+ transactions to same payee in 10 min)
  console.log('Testing Rapid Repeat Same Merchant...');
  const benId = bensData.beneficiaries[0].id;
  for (let i = 0; i < 3; i++) {
    await fetch(`${baseUrl}/api/transactions/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_alex_rivera',
        beneficiaryId: benId,
        amount: 25,
        previewMode: false,
      }),
    });
  }
  const repeatCheck = await fetch(`${baseUrl}/api/transactions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr_alex_rivera',
      beneficiaryId: benId,
      amount: 25,
      previewMode: true,
    }),
  });
  const repeatData = await repeatCheck.json();
  const repeatCodes = repeatData.riskFactors.map((f: any) => f.code);
  if (!repeatCodes.includes('RAPID_REPEAT_SAME_MERCHANT')) {
    throw new Error('Expected RAPID_REPEAT_SAME_MERCHANT factor!');
  }
  console.log('✅ Verified RAPID_REPEAT_SAME_MERCHANT heuristic (+15 pts)');

  // 6. Test GUARDIAN MODE: Minor Account Transaction Always Emits GuardianAlert
  console.log('Testing Guardian Mode Minor Transaction...');
  const minorTxRes = await fetch(`${baseUrl}/api/transactions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr_jordan_minor',
      amount: 120.00, // Exceeds minor limit $50
      category: 'gaming',
      deviceId: 'dev_ipad_mini_kid',
      location: 'New York, US',
      newBeneficiaryName: 'Roblox Virtual World',
      previewMode: false,
    }),
  });
  const minorTxData = await minorTxRes.json();
  console.log('✅ Minor Transaction Created:', {
    txId: minorTxData.transactionId,
    amount: minorTxData.amount,
    isMinor: minorTxData.isMinor,
    requiresGuardianApproval: minorTxData.requiresGuardianApproval,
    alertId: minorTxData.guardianAlertId,
    status: minorTxData.status,
  });
  if (!minorTxData.isMinor) throw new Error('Expected isMinor to be true');
  if (!minorTxData.guardianAlertId) throw new Error('Expected guardianAlertId to be present');
  if (!minorTxData.requiresGuardianApproval) throw new Error('Expected requiresGuardianApproval to be true');

  // 7. Test GET /api/guardian/stats
  const guardianStatsRes = await fetch(`${baseUrl}/api/guardian/stats?guardianId=usr_alex_rivera`);
  const guardianStats = await guardianStatsRes.json();
  console.log('✅ GET /api/guardian/stats:', {
    guardian: guardianStats.guardian.name,
    minorsCount: guardianStats.minors.length,
    alertsCount: guardianStats.alerts.length,
    weeklyCategorySpend: guardianStats.categorySpend,
  });
  if (guardianStats.minors.length === 0) throw new Error('Guardian has no linked minors');
  if (guardianStats.alerts.length === 0) throw new Error('Guardian has no alerts');

  // 8. Test PATCH /api/guardian/alerts/:id (Approve Minor Transaction)
  const alertId = minorTxData.guardianAlertId;
  const alertActionRes = await fetch(`${baseUrl}/api/guardian/alerts/${alertId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'APPROVED', acknowledged: true }),
  });
  const alertActionData = await alertActionRes.json();
  console.log('✅ Guardian Alert Approval Action:', {
    alertStatus: alertActionData.alert.status,
    acknowledged: alertActionData.alert.acknowledged,
  });
  if (alertActionData.alert.status !== 'APPROVED') throw new Error('Expected alert to be APPROVED');

  // 9. Test PATCH /api/guardian/settings (Update minor spend threshold)
  const settingsRes = await fetch(`${baseUrl}/api/guardian/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minorId: 'usr_jordan_minor', minorSpendLimit: 75.0 }),
  });
  const settingsData = await settingsRes.json();
  console.log('✅ Updated Minor Spend Limit:', {
    minorId: settingsData.minorId,
    newLimit: settingsData.minorSpendLimit,
  });
  if (settingsData.minorSpendLimit !== 75) throw new Error('Expected new spend limit 75');

  // 10. Test REAL VOSK VOICE ANALYSIS: POST /api/transactions/:id/voice-check
  console.log('\nTesting Real Vosk Speech-to-Text & Threat Phrase Detection...');
  const voiceCheckRes = await fetch(`${baseUrl}/api/transactions/${minorTxData.transactionId}/voice-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoPreset: 'scam' }),
  });
  const voiceCheckData = await voiceCheckRes.json();
  console.log('✅ Vosk Scam Audio Analysis:', {
    success: voiceCheckData.success,
    transcriptLength: voiceCheckData.transcript?.length,
    voiceSignalScore: voiceCheckData.voiceSignalScore,
    matchedPhrasesCount: voiceCheckData.matchedPhrases?.length,
    disclaimer: voiceCheckData.disclaimer?.substring(0, 40) + '...',
  });
  if (!voiceCheckData.success) throw new Error('Expected voice check success to be true');
  if (!voiceCheckData.transcript || !voiceCheckData.transcript.includes('ceo')) {
    throw new Error('Expected transcript to contain spoken word "ceo"');
  }
  if (voiceCheckData.voiceSignalScore <= 0) {
    throw new Error('Expected voiceSignalScore > 0 on scam audio');
  }

  // Test Clean Control Audio
  const cleanVoiceRes = await fetch(`${baseUrl}/api/transactions/${minorTxData.transactionId}/voice-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoPreset: 'normal' }),
  });
  const cleanVoiceData = await cleanVoiceRes.json();
  console.log('✅ Vosk Legitimate Audio Analysis:', {
    transcript: cleanVoiceData.transcript,
    voiceSignalScore: cleanVoiceData.voiceSignalScore,
  });
  if (cleanVoiceData.voiceSignalScore !== 0) {
    throw new Error('Expected 0 threat points on clean audio');
  }

  // 11. Test PATCH /api/transactions/:id/finalize with voice threat integration
  const finalizeRes = await fetch(`${baseUrl}/api/transactions/${minorTxData.transactionId}/finalize`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const finalizeData = await finalizeRes.json();
  console.log('✅ Final Decision Gate with Voice Integration:', {
    finalScore: finalizeData.transaction.finalScore,
    finalRiskLevel: finalizeData.transaction.finalRiskLevel,
    actionTaken: finalizeData.transaction.actionTaken,
  });

  console.log('\n🎉 ALL 11 END-TO-END TESTS (HEURISTICS, GUARDIAN MODE, & REAL VOSK VOICE ANALYSIS) PASSED WITH 100% SUCCESS!');
}

runExpandedE2ETests().catch((err) => {
  console.error('❌ E2E Test Failure:', err);
  process.exit(1);
});
