'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  UserPlus, 
  ShieldCheck,
  Zap,
  Smartphone,
  MapPin,
  Tag,
  Users,
  Lock,
  Gamepad2,
  AlertOctagon
} from 'lucide-react';
import RiskGauge from '@/components/RiskGauge';
import InterventionModal from '@/components/InterventionModal';
import { RiskLevel, ActionTaken } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SendMoneyPage() {
  const [activeUserType, setActiveUserType] = useState<'adult' | 'minor'>('adult');

  const userId = activeUserType === 'adult' ? 'usr_alex_rivera' : 'usr_jordan_minor';
  const { data: benData } = useSWR(`/api/beneficiaries?userId=${userId}`, fetcher);
  const beneficiaries = benData?.beneficiaries || [];

  // Form State
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPayeeAccount, setNewPayeeAccount] = useState('');
  const [amount, setAmount] = useState<string>('450');
  const [category, setCategory] = useState<string>('personal');
  const [deviceId, setDeviceId] = useState<string>('dev_macbook_pro');
  const [location, setLocation] = useState<string>('New York, US');
  const [selfReportedUrgent, setSelfReportedUrgent] = useState<boolean>(false);
  const [simulatedHour, setSimulatedHour] = useState<number>(14);

  // Live Server Preview State
  const [evalLoading, setEvalLoading] = useState(false);
  const [previewScore, setPreviewScore] = useState<number>(0);
  const [previewLevel, setPreviewLevel] = useState<RiskLevel>('LOW');
  const [previewAction, setPreviewAction] = useState<ActionTaken>('PROCEED');
  const [previewFactors, setPreviewFactors] = useState<any[]>([]);
  const [requiresGuardianApproval, setRequiresGuardianApproval] = useState(false);

  // Submission & Intervention State
  const [submitting, setSubmitting] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState<any | null>(null);
  const [guardianSuccess, setGuardianSuccess] = useState<any | null>(null);
  const [interventionTx, setInterventionTx] = useState<any | null>(null);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);

  // Listen to Navbar profile switch events
  useEffect(() => {
    const handleSwitch = (e: any) => {
      setActiveUserType(e.detail);
      setApprovedSuccess(null);
      setGuardianSuccess(null);
      if (e.detail === 'minor') {
        setAmount('19.99');
        setDeviceId('dev_ipad_mini_kid');
        setCategory('gaming');
      } else {
        setAmount('450');
        setDeviceId('dev_macbook_pro');
        setCategory('personal');
      }
    };

    window.addEventListener('fraudguard_user_switched', handleSwitch);
    return () => window.removeEventListener('fraudguard_user_switched', handleSwitch);
  }, []);

  useEffect(() => {
    if (beneficiaries.length > 0) {
      const first = beneficiaries[0];
      setSelectedBeneficiaryId(first.id);
      if (first.category) setCategory(first.category);
    }
  }, [beneficiaries]);

  // Debounced live evaluation against real backend API
  useEffect(() => {
    const timer = setTimeout(async () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return;

      setEvalLoading(true);
      try {
        const payload: any = {
          userId,
          amount: numAmount,
          category,
          deviceId,
          location,
          selfReportedUrgent,
          simulatedHour,
          previewMode: true,
        };

        if (isAddingNew) {
          payload.newBeneficiaryName = newPayeeName || 'Unregistered Payee';
          payload.accountNumber = newPayeeAccount || 'US-TEMP-999';
        } else {
          payload.beneficiaryId = selectedBeneficiaryId;
        }

        const res = await fetch('/api/transactions/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          setPreviewScore(data.riskScore);
          setPreviewLevel(data.riskLevel);
          setPreviewAction(data.actionTaken);
          setPreviewFactors(data.riskFactors || []);
          setRequiresGuardianApproval(data.requiresGuardianApproval || false);
        }
      } catch (error) {
        console.error('Error fetching risk preview:', error);
      } finally {
        setEvalLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [userId, selectedBeneficiaryId, isAddingNew, newPayeeName, newPayeeAccount, amount, category, deviceId, location, selfReportedUrgent, simulatedHour]);

  // Demo Presets
  const applyPreset1 = () => {
    setActiveUserType('adult');
    setApprovedSuccess(null);
    setGuardianSuccess(null);
    setIsAddingNew(false);
    const sarah = beneficiaries.find((b: any) => b.name.includes('Sarah')) || beneficiaries[0];
    if (sarah) setSelectedBeneficiaryId(sarah.id);
    setAmount('450');
    setCategory('personal');
    setDeviceId('dev_macbook_pro');
    setLocation('New York, US');
    setSelfReportedUrgent(false);
    setSimulatedHour(14);
  };

  const applyPreset2 = () => {
    setActiveUserType('adult');
    setApprovedSuccess(null);
    setGuardianSuccess(null);
    setIsAddingNew(false);
    const apex = beneficiaries.find((b: any) => b.name.includes('Apex')) || { id: 'ben_apex_global' };
    setSelectedBeneficiaryId(apex.id);
    setAmount('28000');
    setCategory('crypto');
    setDeviceId('dev_macbook_pro');
    setLocation('New York, US');
    setSelfReportedUrgent(false);
    setSimulatedHour(14);
  };

  const applyPreset3 = () => {
    setActiveUserType('adult');
    setApprovedSuccess(null);
    setGuardianSuccess(null);
    setIsAddingNew(true);
    setNewPayeeName('Offshore Alpha Vault (Unregistered)');
    setNewPayeeAccount('CY892019482019');
    setAmount('500000');
    setCategory('crypto');
    setDeviceId('dev_macbook_pro');
    setLocation('New York, US');
    setSelfReportedUrgent(true);
    setSimulatedHour(23);
  };

  // NEW PRESET 4: Unrecognized Device + Anomaly Location + High Risk Category
  const applyPreset4 = () => {
    setActiveUserType('adult');
    setApprovedSuccess(null);
    setGuardianSuccess(null);
    setIsAddingNew(false);
    const betVault = beneficiaries.find((b: any) => b.name.includes('BetVault')) || beneficiaries[0];
    if (betVault) setSelectedBeneficiaryId(betVault.id);
    setAmount('180');
    setCategory('gambling');
    setDeviceId('dev_unrecognized_android_x');
    setLocation('Berlin, DE'); // Anomaly location!
    setSelfReportedUrgent(false);
    setSimulatedHour(14);
  };

  // NEW PRESET 5: Guardian Mode — Minor Account Threshold Breach
  const applyPreset5 = () => {
    setActiveUserType('minor');
    setApprovedSuccess(null);
    setGuardianSuccess(null);
    setIsAddingNew(false);
    const roblox = beneficiaries.find((b: any) => b.name.includes('Roblox')) || beneficiaries[0];
    if (roblox) setSelectedBeneficiaryId(roblox.id);
    setAmount('120.00'); // Exceeds minor limit $50
    setCategory('gaming');
    setDeviceId('dev_ipad_mini_kid');
    setLocation('New York, US');
    setSelfReportedUrgent(false);
    setSimulatedHour(15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApprovedSuccess(null);
    setGuardianSuccess(null);
    setSubmitting(true);

    try {
      const payload: any = {
        userId,
        amount: parseFloat(amount),
        category,
        deviceId,
        location,
        selfReportedUrgent,
        simulatedHour,
        previewMode: false,
      };

      if (isAddingNew) {
        payload.newBeneficiaryName = newPayeeName || 'Unregistered Payee';
        payload.accountNumber = newPayeeAccount || 'US-TEMP-999';
      } else {
        payload.beneficiaryId = selectedBeneficiaryId;
      }

      const res = await fetch('/api/transactions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Evaluation failed');
        setSubmitting(false);
        return;
      }

      if (data.requiresGuardianApproval) {
        setGuardianSuccess(data);
      } else if (data.riskLevel === 'LOW' || data.riskLevel === 'MEDIUM') {
        setApprovedSuccess(data);
      } else {
        setInterventionTx({
          id: data.transactionId,
          beneficiaryName: data.beneficiaryName,
          amount: data.amount,
          baseRiskScore: data.riskScore,
          riskLevel: data.riskLevel,
          riskFactors: data.riskFactors,
        });
        setIsInterventionOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0" />
            <span>Real-Time Transfer & Threat Interception</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live server-side risk scoring. Accounts exceeding safety thresholds trigger immediate adaptive isolation.
          </p>
        </div>

        {activeUserType === 'minor' && (
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-mono flex items-center gap-2 flex-shrink-0">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Guardian Mode: Jordan Rivera (Age 12) Active</span>
          </div>
        )}
      </div>

      {/* 5 Calibrated Demo Scenario Presets */}
      <div className="p-5 rounded-2xl bg-[#121620] border border-cyan-500/30 shadow-glow-cyan space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span>Judge Demo Presets — 5 Calibrated Scenarios</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Includes Device ID, Location, Category, & Guardian Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Preset 1 */}
          <button
            type="button"
            onClick={applyPreset1}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-emerald-400 font-mono">1. STANDARD</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  LOW
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">$450 Sarah Jenkins</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Known payee, trusted device, active hours.</p>
            </div>
            <span className="text-[9px] font-mono text-emerald-400/90 pt-1 border-t border-slate-800 block">
              Instant Approved →
            </span>
          </button>

          {/* Preset 2 */}
          <button
            type="button"
            onClick={applyPreset2}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-orange-500/30 hover:border-orange-500/60 text-left transition-all group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-orange-400 font-mono">2. NEW PAYEE</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-800">
                  HIGH
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">$28,000 Apex Global</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">&gt;10x multiplier + crypto category + unverified payee.</p>
            </div>
            <span className="text-[9px] font-mono text-orange-400/90 pt-1 border-t border-slate-800 block">
              Intervention Modal →
            </span>
          </button>

          {/* Preset 3 */}
          <button
            type="button"
            onClick={applyPreset3}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-red-500/40 hover:border-red-500/70 text-left transition-all group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-red-400 font-mono truncate">3. CRITICAL SCAM</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 animate-pulse">
                  CRITICAL
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">$500,000 Offshore</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Off-hours 23:00 + urgent flag + round sum.</p>
            </div>
            <span className="text-[9px] font-mono text-red-400/90 pt-1 border-t border-slate-800 block">
              Quarantine & Hold →
            </span>
          </button>

          {/* Preset 4: New Device + Location Anomaly + Gambling */}
          <button
            type="button"
            onClick={applyPreset4}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/40 hover:border-cyan-500/70 text-left transition-all group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-cyan-400 font-mono">4. DEVICE/LOCATION</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  NEW
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">$180 BetVault (Berlin)</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Unknown device (+20) + Berlin anomaly (+15) + gambling (+20).</p>
            </div>
            <span className="text-[9px] font-mono text-cyan-400/90 pt-1 border-t border-slate-800 block">
              Heuristic Flags (~55) →
            </span>
          </button>

          {/* Preset 5: Guardian Mode Minor Breach */}
          <button
            type="button"
            onClick={applyPreset5}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-purple-500/40 hover:border-purple-500/70 text-left transition-all group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-purple-400 font-mono">5. GUARDIAN BREACH</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  FAMILY
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">$120 Roblox Coins</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Minor account exceeds $50 threshold. Routes to Parent.</p>
            </div>
            <span className="text-[9px] font-mono text-purple-400/90 pt-1 border-t border-slate-800 block">
              Guardian Approval →
            </span>
          </button>

        </div>
      </div>

      {/* Main Grid: Form & Live Risk Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: 7 Cols */}
        <div className="lg:col-span-7 bg-[#121620] border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Payment Dispatch Configuration
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Sender: {activeUserType === 'adult' ? 'Alex Rivera (Adult)' : 'Jordan Rivera (Minor)'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Beneficiary Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Select Beneficiary</label>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{isAddingNew ? 'Choose Existing' : '+ Add New Payee'}</span>
                </button>
              </div>

              {!isAddingNew ? (
                <select
                  value={selectedBeneficiaryId}
                  onChange={(e) => {
                    setSelectedBeneficiaryId(e.target.value);
                    const b = beneficiaries.find((x: any) => x.id === e.target.value);
                    if (b?.category) setCategory(b.category);
                  }}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  {beneficiaries.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} [{b.category?.toUpperCase() || 'GENERAL'}] {b.isKnown ? '• Verified' : '• Unverified'}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">New Payee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Global Corp"
                      value={newPayeeName}
                      onChange={(e) => setNewPayeeName(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. US9012841029"
                      value={newPayeeAccount}
                      onChange={(e) => setNewPayeeAccount(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Amount & Category Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Transfer Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base">$</span>
                  <input
                    type="number"
                    min="0.5"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Merchant Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="personal">personal (standard)</option>
                  <option value="corporate">corporate (standard)</option>
                  <option value="utilities">utilities (standard)</option>
                  <option value="gaming">gaming (high-risk flag)</option>
                  <option value="gambling">gambling (high-risk flag)</option>
                  <option value="crypto">crypto (high-risk flag)</option>
                  <option value="gift_cards">gift_cards (high-risk flag)</option>
                </select>
              </div>
            </div>

            {/* Device ID & Location Telemetry Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hardware Device ID</span>
                </label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="dev_macbook_pro">dev_macbook_pro [Known Trusted]</option>
                  <option value="dev_iphone_15">dev_iphone_15 [Known Trusted]</option>
                  <option value="dev_ipad_mini_kid">dev_ipad_mini_kid [Minor iPad]</option>
                  <option value="dev_unrecognized_android_x">dev_unrecognized_android_x [ANOMALY +20]</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Transaction Geolocation</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="New York, US">New York, US [Usual City]</option>
                  <option value="Jersey City, US">Jersey City, US [Usual City]</option>
                  <option value="Berlin, DE">Berlin, DE [ANOMALY +15]</option>
                  <option value="Moscow, RU">Moscow, RU [ANOMALY +15]</option>
                </select>
              </div>
            </div>

            {/* Urgency & Hour Simulation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-white block">Urgent Override Flag</span>
                  <span className="text-[10px] text-slate-400">Claims emergency priority</span>
                </div>
                <input
                  type="checkbox"
                  checked={selfReportedUrgent}
                  onChange={(e) => setSelfReportedUrgent(e.target.checked)}
                  className="w-4 h-4 accent-red-500 cursor-pointer flex-shrink-0"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-semibold">Simulated Hour</span>
                  <span className="font-mono text-cyan-400">{String(simulatedHour).padStart(2, '0')}:00 hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={simulatedHour}
                  onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || evalLoading}
              className={`w-full py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                requiresGuardianApproval
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/60'
                  : previewLevel === 'CRITICAL' || previewLevel === 'HIGH'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
                  : previewLevel === 'MEDIUM'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
              }`}
            >
              {submitting ? (
                <span>Evaluating Engine Rules...</span>
              ) : requiresGuardianApproval ? (
                <>
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>Dispatch Minor Purchase (Routes to Guardian Approval)</span>
                </>
              ) : previewLevel === 'CRITICAL' || previewLevel === 'HIGH' ? (
                <>
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Initiate Transfer (Adaptive Intervention Trigger)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 flex-shrink-0" />
                  <span>Send ${parseFloat(amount || '0').toFixed(2)} Now</span>
                </>
              )}
            </button>

          </form>

          {/* Success Banner: Standard Approval */}
          {approvedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-400 text-sm">Transfer Approved & Settled</h4>
                <p className="mt-0.5 leading-relaxed">
                  Transaction <strong>{approvedSuccess.transactionId}</strong> (${approvedSuccess.amount?.toFixed(2)} to {approvedSuccess.beneficiaryName}) evaluated cleanly on backend and marked <strong>APPROVED</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Success Banner: Guardian Interception Triggered */}
          {guardianSuccess && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 text-purple-200 text-xs flex items-start gap-3 animate-in fade-in duration-300">
              <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-300 text-sm">Guardian Protection Activated</h4>
                <p className="mt-0.5 leading-relaxed">
                  Transfer of <strong>${guardianSuccess.amount?.toFixed(2)}</strong> for <strong>{guardianSuccess.beneficiaryName}</strong> is held pending parent authorization. An undeletable alert has been mirrored to Alex Rivera's <a href="/guardian" className="underline font-bold text-purple-300">Guardian Dashboard</a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Column: 5 Cols */}
        <div className="lg:col-span-5 bg-[#121620] border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Live Backend Evaluation
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              Real API Debounced
            </span>
          </div>

          <div className="py-2">
            <RiskGauge
              score={previewScore}
              riskLevel={previewLevel}
              actionTaken={previewAction}
              loading={evalLoading}
              size={170}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                Detected Threat Factors ({previewFactors.length})
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Server Rules</span>
            </div>

            {previewFactors.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero anomalous triggers. Safe baseline parameters.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {previewFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-semibold text-cyan-400 block truncate">
                        [{factor.code}]
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-snug">{factor.text}</p>
                    </div>
                    {factor.points && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 whitespace-nowrap flex-shrink-0 ml-2">
                        +{factor.points}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Intervention Modal */}
      {interventionTx && (
        <InterventionModal
          isOpen={isInterventionOpen}
          onClose={() => setIsInterventionOpen(false)}
          onFinished={() => {
            setIsInterventionOpen(false);
            setApprovedSuccess({
              transactionId: interventionTx.id,
              amount: interventionTx.amount,
              beneficiaryName: interventionTx.beneficiaryName,
            });
          }}
          transactionData={interventionTx}
        />
      )}

    </div>
  );
}
