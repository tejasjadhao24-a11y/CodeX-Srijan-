'use client';

import React from 'react';
import { RiskLevel, ActionTaken } from '@/lib/types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  actionTaken?: ActionTaken;
  size?: number;
  loading?: boolean;
}

export default function RiskGauge({
  score,
  riskLevel,
  actionTaken,
  size = 180,
  loading = false,
}: RiskGaugeProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const getTheme = () => {
    switch (riskLevel) {
      case 'LOW':
        return {
          stroke: '#10B981',
          glow: 'rgba(16, 185, 129, 0.3)',
          badgeBg: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-400',
          icon: ShieldCheck,
          label: 'LOW RISK',
          actionText: 'PROCEED IMMEDIATELY',
        };
      case 'MEDIUM':
        return {
          stroke: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.3)',
          badgeBg: 'bg-amber-950/60 border-amber-600/40 text-amber-400',
          icon: AlertTriangle,
          label: 'MEDIUM RISK',
          actionText: 'INLINE CAUTION',
        };
      case 'HIGH':
        return {
          stroke: '#F97316',
          glow: 'rgba(249, 115, 22, 0.35)',
          badgeBg: 'bg-orange-950/70 border-orange-500/50 text-orange-400',
          icon: ShieldAlert,
          label: 'HIGH RISK',
          actionText: 'PAUSE & VERIFY',
        };
      case 'CRITICAL':
      default:
        return {
          stroke: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.45)',
          badgeBg: 'bg-red-950/80 border-red-500/60 text-red-400',
          icon: Flame,
          label: 'CRITICAL THREAT',
          actionText: 'HOLD & ESCALATE',
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Dynamic Animated Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E2638"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active Risk Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 10px ${theme.glow})`,
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center Score & Info */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight flex items-baseline">
            {loading ? (
              <span className="animate-pulse text-cyan-400 text-2xl">CALC...</span>
            ) : (
              <>
                <span>{score}</span>
                <span className="text-xs text-slate-400 font-normal ml-0.5">/100</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">
            Risk Score
          </span>
        </div>
      </div>

      {/* Risk Badge with Glow */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wider font-mono flex items-center gap-1.5 ${theme.badgeBg} ${
          (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') ? 'animate-pulse-glow' : ''
        }`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span>{theme.label}</span>
        </div>

        {actionTaken && (
          <span className="text-[11px] font-mono text-slate-400 tracking-wide">
            ACTION: <span className="font-semibold text-slate-200">{actionTaken}</span>
          </span>
        )}
      </div>
    </div>
  );
}
