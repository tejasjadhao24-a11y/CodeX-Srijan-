'use client';

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  UserX, 
  Mic, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  AlertTriangle,
  FileAudio,
  Activity,
  Unlock
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import { RiskLevel, ActionTaken } from '@/lib/types';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished: () => void;
  transactionData: {
    id: string;
    beneficiaryName: string;
    amount: number;
    baseRiskScore: number;
    riskLevel: RiskLevel;
    riskFactors: Array<{ code: string; text: string; points?: number }>;
  };
}

export default function InterventionModal({
  isOpen,
  onClose,
  onFinished,
  transactionData,
}: InterventionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [socialAnswer, setSocialAnswer] = useState<string>('bank_police_impersonation');
  const [socialScore, setSocialScore] = useState<number | null>(null);

  const [deepfakeResult, setDeepfakeResult] = useState<{
    score: number;
    note: string;
    analyzed: boolean;
  } | null>(null);

  const [finalResult, setFinalResult] = useState<{
    finalScore: number;
    finalRiskLevel: RiskLevel;
    actionTaken: ActionTaken;
    status: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSocialSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionData.id}/social-check`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: socialAnswer }),
      });
      const data = await res.json();
      setSocialScore(data.socialEngineeringScore);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepfakeRun = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionData.id}/deepfake-check`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'urgent_call_recording_094.wav' }),
      });
      const data = await res.json();
      setDeepfakeResult({
        score: data.deepfakeScore,
        note: data.note,
        analyzed: true,
      });
      
      const finalizeRes = await fetch(`/api/transactions/${transactionData.id}/finalize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const finalizeData = await finalizeRes.json();
      setFinalResult({
        finalScore: finalizeData.transaction.finalScore,
        finalRiskLevel: finalizeData.transaction.finalRiskLevel,
        actionTaken: finalizeData.transaction.actionTaken,
        status: finalizeData.transaction.status,
      });

      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeAction = async (override: boolean) => {
    setLoading(true);
    try {
      if (override) {
        await fetch(`/api/transactions/${transactionData.id}/finalize`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrideApproved: true }),
        });
      }
      onFinished();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/40 p-6 sm:p-8 text-white my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold tracking-wide">ADAPTIVE SECURITY INTERVENTION</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/70 border border-red-600/40 text-red-300 font-semibold uppercase flex-shrink-0">
                  Level {transactionData.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                Target: ${transactionData.amount.toLocaleString()} to {transactionData.beneficiaryName}
              </p>
            </div>
          </div>
          
          {/* Step Progress Tracker */}
          <div className="flex items-center gap-1.5 text-xs font-mono self-start sm:self-auto flex-shrink-0">
            <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800 text-slate-400'}`}>1. Context</span>
            <span className="text-slate-600">→</span>
            <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800 text-slate-400'}`}>2. Voice</span>
            <span className="text-slate-600">→</span>
            <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800 text-slate-400'}`}>3. Gate</span>
          </div>
        </div>

        {/* STEP 1: Social Engineering Screening */}
        {step === 1 && (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs sm:text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <UserX className="w-4 h-4 flex-shrink-0" />
                <span>Contextual Impersonation Screening</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                This transaction exceeded baseline risk limits. Who instructed or pressured you to initiate this transfer?
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'bank_police_impersonation', label: 'Bank Security, Police, or Tax Authority Official', points: '+40 pts', desc: 'Urgent compliance, safety account, or court seizure claim' },
                { id: 'employer_impersonation', label: 'Company CEO, CFO, or Executive Director', points: '+35 pts', desc: 'Confidential corporate acquisition or emergency vendor invoice' },
                { id: 'secrecy_demanded', label: 'Instructed to NOT speak with bank or family (Strict Secrecy)', points: '+50 pts', desc: 'Active isolation tactic characteristic of coercion scams' },
                { id: 'whatsapp_call', label: 'Unverified WhatsApp / Telegram / Voice Call Request', points: '+30 pts', desc: 'Unknown channel outside established banking relationships' },
                { id: 'self', label: 'Self-Directed (Regular Planned Personal Transaction)', points: '+0 pts', desc: 'Personal transfer with zero external guidance or pressure' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSocialAnswer(opt.id)}
                  className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                    socialAnswer === opt.id
                      ? 'bg-red-950/20 border-red-500/50 text-white shadow-glow-red'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="socialAnswer"
                    checked={socialAnswer === opt.id}
                    onChange={() => setSocialAnswer(opt.id)}
                    className="mt-1 accent-red-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-medium text-white">{opt.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap flex-shrink-0 ml-2">
                        {opt.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Abort Transfer
              </button>
              <button
                type="button"
                onClick={handleSocialSubmit}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold tracking-wider flex items-center gap-2 shadow-lg shadow-red-900/50 transition-all flex-shrink-0"
              >
                <span>{loading ? 'Evaluating...' : 'Proceed to Voice Check'}</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Deepfake Voice Check */}
        {step === 2 && (
          <div className="py-5 space-y-5">
            {/* Clear UI notice per user requirement */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span className="leading-relaxed">
                <strong>Notice:</strong> Simulated neural voice analysis (prototype demo — not a live ML model).
              </span>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan flex-shrink-0">
                <Mic className="w-7 h-7 animate-pulse text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">Voice & Audio Biometric Authentication</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                  Scanning caller audio harmonics for synthetic clone artifacts and acoustic frequency anomalies.
                </p>
              </div>

              {/* Spectral Waveform */}
              <div className="flex items-center justify-center gap-1.5 h-12 my-2 px-8 py-2 rounded-xl bg-[#0B0E14] border border-cyan-500/20 w-full max-w-xs">
                <div className="w-1.5 bg-cyan-400 rounded-full animate-wave-1"></div>
                <div className="w-1.5 bg-cyan-300 rounded-full animate-wave-2"></div>
                <div className="w-1.5 bg-blue-500 rounded-full animate-wave-3"></div>
                <div className="w-1.5 bg-cyan-400 rounded-full animate-wave-4"></div>
                <div className="w-1.5 bg-indigo-400 rounded-full animate-wave-5"></div>
                <div className="w-1.5 bg-cyan-400 rounded-full animate-wave-2"></div>
                <div className="w-1.5 bg-cyan-300 rounded-full animate-wave-1"></div>
                <div className="w-1.5 bg-blue-400 rounded-full animate-wave-4"></div>
                <div className="w-1.5 bg-cyan-400 rounded-full animate-wave-3"></div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <FileAudio className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">Sample: urgent_telecom_trace_rec.wav</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDeepfakeRun}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider flex items-center gap-2 shadow-glow-cyan transition-all flex-shrink-0"
              >
                {loading ? 'Running Analysis...' : 'Execute Deepfake Voice Analysis'}
                <Activity className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Final Security Decision */}
        {step === 3 && finalResult && (
          <div className="py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div className="flex justify-center">
                <RiskGauge
                  score={finalResult.finalScore}
                  riskLevel={finalResult.finalRiskLevel}
                  actionTaken={finalResult.actionTaken}
                  size={170}
                />
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Base Multiplier Score</span>
                  <span className="text-sm font-bold text-white">{transactionData.baseRiskScore} / 100</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-red-500/30">
                  <span className="text-slate-400 block text-[10px]">Social Threat Score</span>
                  <span className="text-sm font-bold text-red-400">+{socialScore ?? 35} pts (Impersonation)</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-red-500/30">
                  <span className="text-slate-400 block text-[10px]">Deepfake Synthetic Score</span>
                  <span className="text-sm font-bold text-red-400">{deepfakeResult?.score || 81}% Synthetic Pattern</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug font-sans">
                    {deepfakeResult?.note}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Advisory */}
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>Automated Interceptor Action: {finalResult.actionTaken}</span>
              </div>
              <p className="leading-relaxed">
                This transfer has been held in quarantine. High probability of social engineering or executive impersonation scam. The record is persisted in <strong>Case Incident Review</strong> for investigation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleFinalizeAction(true)}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Override & Approve (Logged)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinalizeAction(false)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Confirm Hold & View Cases</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
