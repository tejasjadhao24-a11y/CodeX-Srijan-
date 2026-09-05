'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  Smartphone, 
  MapPin, 
  Coins, 
  Zap, 
  Clock, 
  UserCheck, 
  Sparkles,
  Mic,
  UserX
} from 'lucide-react';

export interface EvaluationStep {
  id: string;
  name: string;
  category: string;
  triggered: boolean;
  points: number;
  explanation: string;
  icon: React.ReactNode;
}

interface SequentialRiskBreakdownProps {
  baseScore: number;
  riskFactors: Array<{ code: string; text: string; points?: number }>;
  socialScore?: number | null;
  voiceScore?: number | null;
  transcript?: string | null;
  deepfakeScore?: number | null;
  autoAnimate?: boolean;
  onAnimationComplete?: () => void;
}

export default function SequentialRiskBreakdown({
  baseScore,
  riskFactors,
  socialScore = null,
  voiceScore = null,
  transcript = null,
  deepfakeScore = null,
  autoAnimate = true,
  onAnimationComplete,
}: SequentialRiskBreakdownProps) {
  const [visibleStepIndex, setVisibleStepIndex] = useState<number>(autoAnimate ? 0 : 999);
  const [runningScore, setRunningScore] = useState<number>(0);

  // Helper to test if a code triggered
  const factorMap = new Map<string, { text: string; points: number }>();
  riskFactors.forEach((f) => {
    factorMap.set(f.code, { text: f.text, points: f.points ?? 15 });
  });

  const allSteps: EvaluationStep[] = [
    {
      id: 'amount',
      name: 'Amount vs. Baseline',
      category: 'Financial Heuristics',
      triggered: factorMap.has('HIGH_MULTIPLIER') || factorMap.has('MODERATE_MULTIPLIER'),
      points: factorMap.get('HIGH_MULTIPLIER')?.points || factorMap.get('MODERATE_MULTIPLIER')?.points || 0,
      explanation: factorMap.get('HIGH_MULTIPLIER')?.text || factorMap.get('MODERATE_MULTIPLIER')?.text || 'Transfer amount is within normal historical baseline limits',
      icon: <Coins className="w-3.5 h-3.5" />,
    },
    {
      id: 'beneficiary',
      name: 'Beneficiary Trust & Age',
      category: 'Provenance',
      triggered: factorMap.has('UNKNOWN_BENEFICIARY') || factorMap.has('RECENT_BENEFICIARY'),
      points: (factorMap.get('UNKNOWN_BENEFICIARY')?.points || 0) + (factorMap.get('RECENT_BENEFICIARY')?.points || 0),
      explanation: factorMap.get('UNKNOWN_BENEFICIARY')?.text || factorMap.get('RECENT_BENEFICIARY')?.text || 'Verified trusted payee with established account history',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'device',
      name: 'Device Identification',
      category: 'Hardware Telemetry',
      triggered: factorMap.has('UNRECOGNIZED_DEVICE'),
      points: factorMap.get('UNRECOGNIZED_DEVICE')?.points || 0,
      explanation: factorMap.get('UNRECOGNIZED_DEVICE')?.text || 'Device signature matches authorized hardware profile',
      icon: <Smartphone className="w-3.5 h-3.5" />,
    },
    {
      id: 'location',
      name: 'Geolocation Anomaly',
      category: 'Geographic Context',
      triggered: factorMap.has('LOCATION_ANOMALY'),
      points: factorMap.get('LOCATION_ANOMALY')?.points || 0,
      explanation: factorMap.get('LOCATION_ANOMALY')?.text || 'Originating IP & city within customary operating zone',
      icon: <MapPin className="w-3.5 h-3.5" />,
    },
    {
      id: 'category',
      name: 'Merchant Category Risk',
      category: 'Counterparty Risk',
      triggered: factorMap.has('MERCHANT_CATEGORY_RISK'),
      points: factorMap.get('MERCHANT_CATEGORY_RISK')?.points || 0,
      explanation: factorMap.get('MERCHANT_CATEGORY_RISK')?.text || 'Standard low-risk commercial or personal beneficiary',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      id: 'velocity',
      name: 'Transaction Velocity & Repeat',
      category: 'Behavioral Velocity',
      triggered: factorMap.has('HIGH_VELOCITY') || factorMap.has('RAPID_REPEAT_SAME_MERCHANT'),
      points: (factorMap.get('HIGH_VELOCITY')?.points || 0) + (factorMap.get('RAPID_REPEAT_SAME_MERCHANT')?.points || 0),
      explanation: factorMap.get('RAPID_REPEAT_SAME_MERCHANT')?.text || factorMap.get('HIGH_VELOCITY')?.text || 'Normal frequency pacing across recent 10-minute window',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      id: 'account_age',
      name: 'Account Age vs. Volume',
      category: 'Tenure Ratio',
      triggered: factorMap.has('NEW_ACCOUNT_HIGH_AMOUNT'),
      points: factorMap.get('NEW_ACCOUNT_HIGH_AMOUNT')?.points || 0,
      explanation: factorMap.get('NEW_ACCOUNT_HIGH_AMOUNT')?.text || 'Account age satisfies maturity ratio for this transfer volume',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: 'behavioral_shift',
      name: 'Behavioral Category Shift',
      category: 'Pattern Anomaly',
      triggered: factorMap.has('BEHAVIORAL_CATEGORY_SHIFT'),
      points: factorMap.get('BEHAVIORAL_CATEGORY_SHIFT')?.points || 0,
      explanation: factorMap.get('BEHAVIORAL_CATEGORY_SHIFT')?.text || 'Category aligns with sender historical spending distribution',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'timing_urgency',
      name: 'Timing & Urgency Overrides',
      category: 'Signature Audit',
      triggered: factorMap.has('OFF_HOURS') || factorMap.has('URGENCY_OVERRIDE') || factorMap.has('ROUND_FIGURE'),
      points: (factorMap.get('OFF_HOURS')?.points || 0) + (factorMap.get('URGENCY_OVERRIDE')?.points || 0) + (factorMap.get('ROUND_FIGURE')?.points || 0),
      explanation: factorMap.get('URGENCY_OVERRIDE')?.text || factorMap.get('OFF_HOURS')?.text || 'Standard operating hours with organic non-pressured amount',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  // If social screening was performed
  if (socialScore !== null && socialScore !== undefined) {
    allSteps.push({
      id: 'social_engineering',
      name: 'Impersonation Screening',
      category: 'Adaptive Context',
      triggered: socialScore > 0,
      points: socialScore,
      explanation: socialScore > 0 ? `Coercive pressure detected (+${socialScore} pts)` : 'Self-directed legitimate transfer (+0 pts)',
      icon: <UserX className="w-3.5 h-3.5" />,
    });
  }

  // If real Vosk voice analysis was performed
  if (voiceScore !== null && voiceScore !== undefined) {
    allSteps.push({
      id: 'voice_vosk',
      name: 'Speech & Threat Phrase Analysis (Vosk)',
      category: 'Real Audio Forensics',
      triggered: voiceScore > 0,
      points: voiceScore,
      explanation: voiceScore > 0 
        ? `Coercion/authority phrases detected (+${voiceScore} pts in transcript)` 
        : 'Spoken transcript cleared without coercion phrases',
      icon: <Mic className="w-3.5 h-3.5" />,
    });
  }

  // Staggered sequential reveal animation
  useEffect(() => {
    if (!autoAnimate) {
      setVisibleStepIndex(allSteps.length);
      const targetScore = allSteps.reduce((sum, s) => sum + (s.triggered ? s.points : 0), 0);
      setRunningScore(Math.min(100, targetScore));
      return;
    }

    let currentIndex = 0;
    let accumulated = 0;
    setVisibleStepIndex(0);
    setRunningScore(0);

    const interval = setInterval(() => {
      currentIndex += 1;
      if (currentIndex <= allSteps.length) {
        setVisibleStepIndex(currentIndex);
        const currentStep = allSteps[currentIndex - 1];
        if (currentStep && currentStep.triggered) {
          accumulated += currentStep.points;
          setRunningScore(Math.min(100, accumulated));
        }
      } else {
        clearInterval(interval);
        if (onAnimationComplete) onAnimationComplete();
      }
    }, 120);

    return () => clearInterval(interval);
  }, [baseScore, riskFactors.length, socialScore, voiceScore]);

  return (
    <div className="space-y-4">
      {/* Header bar with live sequential tally */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Sequential Risk Engine Reasoning ({Math.min(visibleStepIndex, allSteps.length)}/{allSteps.length} Checks)
          </h4>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Running Tally:</span>
          <span className={`px-2 py-0.5 rounded font-bold transition-all duration-300 ${
            runningScore >= 80 ? 'bg-red-950/80 text-red-400 border border-red-500/50' :
            runningScore >= 56 ? 'bg-orange-950/80 text-orange-400 border border-orange-500/50' :
            runningScore >= 31 ? 'bg-amber-950/80 text-amber-400 border border-amber-500/50' :
            'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
          }`}>
            {runningScore} / 100
          </span>
        </div>
      </div>

      {/* Ordered Step List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {allSteps.map((step, idx) => {
          const isRevealed = idx < visibleStepIndex;
          if (!isRevealed) return null;

          return (
            <div
              key={step.id}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                step.triggered
                  ? 'bg-red-950/20 border-red-500/40 text-white shadow-sm shadow-red-950/30'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  step.triggered
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {step.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                      Step {idx + 1} • {step.category}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {step.name}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                    {step.explanation}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                {step.triggered ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-600/40 px-2 py-0.5 rounded shadow-sm">
                    +{step.points} pts
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/80 bg-emerald-950/30 border border-emerald-800/30 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Clean
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
