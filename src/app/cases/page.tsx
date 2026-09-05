'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  FileWarning, 
  ChevronDown, 
  ChevronRight, 
  Unlock, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  UserX,
  Mic,
  Tag,
  Smartphone,
  MapPin
} from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import { TableRowSkeleton } from '@/components/SkeletonLoader';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CasesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const url = statusFilter === 'all' ? '/api/cases' : `/api/cases?status=${statusFilter}`;
  const { data, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 4000,
  });

  const cases = data?.cases || [];

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actionTaken: newStatus === 'APPROVED' ? 'PROCEED' : 'HOLD_ESCALATE',
        }),
      });
      await mutate();
    } catch (err) {
      console.error('Error updating case:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Incidents' },
    { id: 'HELD', label: 'Held in Quarantine' },
    { id: 'PENDING', label: 'Pending Review' },
    { id: 'APPROVED', label: 'Approved Overrides' },
    { id: 'CANCELLED', label: 'Cancelled / Fraud' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileWarning className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
            <span>Case Incident Review & Forensic Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit high-risk flagged transactions and execute manual release or fraud cancellation.
          </p>
        </div>

        <button
          onClick={() => mutate()}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 border border-slate-700 transition-colors flex-shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              statusFilter === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 tracking-wider bg-[#0E121B]">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Case ID & Timestamp</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <>
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                </>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center font-mono text-slate-400">
                    No cases match status filter "{statusFilter}".
                  </td>
                </tr>
              ) : (
                cases.map((c: any) => {
                  const isExpanded = expandedRowId === c.id;

                  return (
                    <React.Fragment key={c.id}>
                      <tr
                        onClick={() => toggleRow(c.id)}
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-500">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          <span className="text-white font-semibold block">{c.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-white max-w-[200px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">{c.beneficiaryName}</span>
                            {c.category && (
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700 uppercase flex-shrink-0">
                                {c.category}
                              </span>
                            )}
                          </div>
                          {c.beneficiary?.accountNumber && (
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              Acc: {c.beneficiary.accountNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                          ${c.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <RiskBadge level={c.riskLevel} />
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-red-400 whitespace-nowrap">
                          {c.riskScore} / 100
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            c.status === 'HELD'
                              ? 'bg-red-950/80 text-red-400 border border-red-700'
                              : c.status === 'APPROVED'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {c.status === 'HELD' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                                  disabled={actionLoading === c.id}
                                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                                  title="Release hold and approve funds transfer"
                                >
                                  <Unlock className="w-3 h-3 flex-shrink-0" />
                                  <span>Release</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(c.id, 'CANCELLED')}
                                  disabled={actionLoading === c.id}
                                  className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-600/40 text-red-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                                  title="Confirm fraudulent attempt and cancel transaction"
                                >
                                  <XCircle className="w-3 h-3 flex-shrink-0" />
                                  <span>Cancel</span>
                                </button>
                              </>
                            )}
                            {c.status !== 'HELD' && (
                              <span className="text-[11px] font-mono text-slate-500">
                                Case Settled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Forensic Row */}
                      {isExpanded && (
                        <tr className="bg-[#0B0E14]/90 border-b border-slate-800">
                          <td colSpan={8} className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                              
                              {/* Heuristics List */}
                              <div className="xl:col-span-2 space-y-3">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                  <span>Evaluated Heuristic Triggers</span>
                                </h4>
                                <div className="space-y-2">
                                  {c.riskFactors?.map((rf: any, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                                    >
                                      <div className="min-w-0">
                                        <span className="font-mono text-[10px] text-cyan-400 font-semibold block truncate">
                                          [{rf.code}]
                                        </span>
                                        <span className="text-slate-300 leading-snug">{rf.text}</span>
                                      </div>
                                      {rf.points && (
                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 whitespace-nowrap flex-shrink-0 ml-2">
                                          +{rf.points} pts
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Forensic Telemetry Card */}
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                                    Forensic Screening Telemetry
                                  </h4>
                                  
                                  <div className="text-xs space-y-2.5">
                                    <div className="flex items-start gap-2.5">
                                      <UserX className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <span className="text-slate-400 text-[10px] block">Social Impersonation:</span>
                                        <span className="text-white font-mono font-semibold truncate block">
                                          {c.socialEngineeringAnswer || 'Not screened / Unanswered'}
                                        </span>
                                        {c.socialEngineeringScore && (
                                          <span className="text-[10px] text-red-400 block font-mono mt-0.5">
                                            Score: +{c.socialEngineeringScore} pts
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800">
                                      <Mic className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <span className="text-slate-400 text-[10px] block">Synthetic Audio Biomarker:</span>
                                        <span className="text-white font-mono font-semibold truncate block">
                                          {c.deepfakeScore ? `${c.deepfakeScore}% Synthetic Pattern` : 'No audio sample submitted'}
                                        </span>
                                      </div>
                                    </div>

                                    {(c.deviceId || c.location) && (
                                      <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] font-mono">
                                        {c.deviceId && (
                                          <div className="text-slate-400 flex items-center gap-1.5 truncate">
                                            <Smartphone className="w-3 h-3 text-cyan-400" />
                                            <span>Device: {c.deviceId}</span>
                                          </div>
                                        )}
                                        {c.location && (
                                          <div className="text-slate-400 flex items-center gap-1.5 truncate">
                                            <MapPin className="w-3 h-3 text-cyan-400" />
                                            <span>Location: {c.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="text-[11px] font-mono text-slate-500">
                                  <span>User Baseline Avg: ${c.user?.avgTransactionAmount?.toLocaleString()}</span>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
