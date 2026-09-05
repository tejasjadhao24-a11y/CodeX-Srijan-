'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Flame } from 'lucide-react';
import { RiskLevel } from '@/lib/types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function RiskBadge({
  level,
  size = 'md',
  showIcon = true,
}: RiskBadgeProps) {
  const normalized = (level || 'LOW').toUpperCase();

  const getDetails = () => {
    switch (normalized) {
      case 'LOW':
        return {
          icon: ShieldCheck,
          label: 'LOW',
          classes: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
        };
      case 'MEDIUM':
        return {
          icon: AlertTriangle,
          label: 'MED',
          classes: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
        };
      case 'HIGH':
        return {
          icon: ShieldAlert,
          label: 'HIGH',
          classes: 'bg-orange-950/80 text-orange-400 border-orange-500/50 animate-pulse',
        };
      case 'CRITICAL':
      default:
        return {
          icon: Flame,
          label: 'CRITICAL',
          classes: 'bg-red-950/90 text-red-400 border-red-500/60 animate-pulse',
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-bold rounded-full border whitespace-nowrap ${sizeClasses} ${details.classes}`}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{details.label}</span>
    </span>
  );
}
