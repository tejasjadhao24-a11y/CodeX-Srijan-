'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Code, ListFilter, Copy, Check } from 'lucide-react';
import RiskGauge from './RiskGauge';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export default function TransactionDrawer({
  isOpen,
  onClose,
  transaction,
}: TransactionDrawerProps) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'json'>('breakdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskFactors = Array.isArray(transaction.riskFactors)
    ? transaction.riskFactors
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-[#111622] border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between text-white animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0B0E14]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">TRANSACTION AUDIT TRACE</h3>
              <p className="text-xs font-mono text-slate-400">ID: {transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-[#0E121B]">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`py-3 px-4 text-xs font-mono font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'breakdown'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Risk Factors & Intelligence
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-mono font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'json'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Stored Database JSON
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'breakdown' ? (
            <>
              {/* Top Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <RiskGauge
                  score={transaction.riskScore}
                  riskLevel={transaction.riskLevel}
                  actionTaken={transaction.actionTaken}
                  size={140}
                />

                <div className="space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Beneficiary Target</span>
                    <span className="text-sm font-semibold text-white">{transaction.beneficiaryName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transaction Amount</span>
                    <span className="text-base font-bold text-cyan-400">
                      ${transaction.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      transaction.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      transaction.status === 'HELD' ? 'bg-red-950 text-red-400 border border-red-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recorded Timestamp</span>
                    <span className="text-slate-300 text-[11px]">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Risk Factors Breakdown List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Server-Evaluated Risk Factors ({riskFactors.length})
                </h4>

                {riskFactors.length === 0 ? (
                  <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Clean heuristic profile. Zero risk anomalies detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {riskFactors.map((factor: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-semibold text-cyan-400 block">
                            [{factor.code}]
                          </span>
                          <p className="text-slate-200">{factor.text}</p>
                        </div>
                        {factor.points && (
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-400 whitespace-nowrap font-bold">
                            +{factor.points} pts
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Threat Modules (Social Engineering & Deepfake) */}
              {(transaction.socialEngineeringScore !== null || transaction.deepfakeScore !== null) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Adaptive Screening Results
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block">Social Threat Score</span>
                      <span className="text-sm font-bold text-red-400 font-mono">
                        {transaction.socialEngineeringScore !== null ? `+${transaction.socialEngineeringScore} pts` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-1">
                        Answer: {transaction.socialEngineeringAnswer || 'Unanswered'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block">Deepfake Confidence</span>
                      <span className="text-sm font-bold text-red-400 font-mono">
                        {transaction.deepfakeScore !== null ? `${transaction.deepfakeScore}% Synthetic` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-1">
                        Status: Simulated Model Analyzed
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Live Pretty-Printed Stored DB JSON */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Exact Database Record</span>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#090C12] border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
                {JSON.stringify(transaction, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0E14]/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
          >
            Close Audit Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
