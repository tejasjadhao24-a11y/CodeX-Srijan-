'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  ShieldCheck, 
  Activity, 
  Lock, 
  RotateCw, 
  ArrowUpRight, 
  TrendingUp, 
  Cpu, 
  Flame, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import TransactionDrawer from '@/components/TransactionDrawer';
import RiskBadge from '@/components/RiskBadge';
import AnimatedCount from '@/components/AnimatedCount';
import { TableRowSkeleton } from '@/components/SkeletonLoader';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Short polling via SWR every 3 seconds for real-time reactivity
  const { data, isLoading, mutate } = useSWR('/api/dashboard/stats', fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const handleOpenDrawer = (tx: any) => {
    setSelectedTx(tx);
    setIsDrawerOpen(true);
  };

  const stats = data || {
    totalMonitored: 0,
    highCriticalCount: 0,
    heldCount: 0,
    approvedCount: 0,
    protectionScore: 100,
    totalValueProtected: 0,
    avgProcessingTimeMs: 18,
    recentTransactions: [],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="text-emerald-400 flex items-center gap-1 font-mono text-xs"><CheckCircle2 className="w-3 h-3 flex-shrink-0" /> Approved</span>;
      case 'HELD':
        return <span className="text-red-400 flex items-center gap-1 font-mono text-xs font-semibold"><Lock className="w-3 h-3 flex-shrink-0" /> Held in Quarantine</span>;
      case 'PENDING':
        return <span className="text-amber-400 flex items-center gap-1 font-mono text-xs"><Clock className="w-3 h-3 flex-shrink-0" /> In Review</span>;
      default:
        return <span className="text-slate-400 font-mono text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Telemetry Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Real-Time Telemetry & Threat Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction scoring against baseline behavior, velocity, and deepfake signals.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>Live Polling: 3s</span>
          </div>
          <button
            onClick={() => mutate()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 flex-shrink-0"
            title="Force refresh telemetry"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards with Animated Count-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Monitored */}
        <div className="p-5 rounded-xl bg-[#121620] border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 shadow-sm flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase font-semibold truncate">Total Monitored</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white truncate">
              <AnimatedCount value={stats.totalMonitored} />
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center flex-shrink-0">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% DB
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Transactions ingested & scored</p>
        </div>

        {/* Card 2: High & Critical Cases */}
        <div className="p-5 rounded-xl bg-[#121620] border border-red-500/30 hover:border-red-500/50 transition-all duration-200 shadow-sm flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono tracking-wider text-red-400 uppercase font-semibold truncate">Flagged Threats</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-red-400 truncate">
              <AnimatedCount value={stats.highCriticalCount} />
            </span>
            <span className="text-xs font-mono text-red-300 flex-shrink-0">
              ({stats.heldCount} held)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Triggered adaptive intervention</p>
        </div>

        {/* Card 3: Protection Score */}
        <div className="p-5 rounded-xl bg-[#121620] border border-slate-800 hover:border-emerald-500/30 transition-all duration-200 shadow-sm flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase font-semibold truncate">Protection Index</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 truncate">
              <AnimatedCount value={stats.protectionScore} decimals={1} suffix="%" />
            </span>
            <span className="text-xs text-slate-400 font-mono flex-shrink-0">ratio clean/all</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Zero undetected leakage</p>
        </div>

        {/* Card 4: Avg Latency */}
        <div className="p-5 rounded-xl bg-[#121620] border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 shadow-sm flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase font-semibold truncate">Response Latency</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 truncate">
              <AnimatedCount value={stats.avgProcessingTimeMs} decimals={1} suffix="ms" />
            </span>
            <span className="text-xs text-slate-400 font-mono flex-shrink-0">DB roundtrip</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Inline rule computation speed</p>
        </div>

      </div>

      {/* Value Protected Highlight Bar */}
      {stats.totalValueProtected > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-red-300 font-semibold uppercase tracking-wider block">
                Total Fraud Value Intercepted & Quarantined
              </span>
              <p className="text-xs text-slate-400">
                Suspected social engineering and impersonation funds prevented from leaving user account.
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">
              ${stats.totalValueProtected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Recent Activity Stream Table */}
      <div className="p-5 lg:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Recent Monitored Transactions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time feed streaming from SQLite database. Click any row to inspect full stored risk factors.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 flex-shrink-0">
            Showing last {stats.recentTransactions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 tracking-wider bg-[#0E121B]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <>
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                </>
              ) : stats.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recentTransactions.map((tx: any) => (
                  <tr
                    key={tx.id}
                    onClick={() => handleOpenDrawer(tx)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-[200px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{tx.beneficiaryName}</span>
                        {tx.isMinorTransaction && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 flex-shrink-0">
                            MINOR
                          </span>
                        )}
                        {tx.socialEngineeringScore && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 flex-shrink-0">
                            SOC-FLAG
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      ${tx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RiskBadge level={tx.riskLevel} />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-300 whitespace-nowrap">
                      <span className={tx.riskScore > 55 ? 'text-red-400' : 'text-slate-300'}>
                        {tx.riskScore}
                      </span>
                      <span className="text-slate-500 text-[10px]">/100</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(tx);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 border border-slate-700 group-hover:border-cyan-500/40 transition-all"
                      >
                        <span>Audit</span>
                        <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Transaction Detail Drawer */}
      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={selectedTx}
      />

    </div>
  );
}
