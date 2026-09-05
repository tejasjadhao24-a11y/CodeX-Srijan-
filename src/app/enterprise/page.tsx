'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Layers, 
  Code, 
  Copy, 
  Check, 
  Terminal, 
  AlertOctagon, 
  Radio
} from 'lucide-react';
import ThreatFlowDiagram from '@/components/ThreatFlowDiagram';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EnterprisePage() {
  const [copied, setCopied] = useState(false);

  // Fetch real latest High/Critical cases directly from backend
  const { data, isLoading } = useSWR('/api/cases', fetcher, {
    refreshInterval: 5000,
  });

  const latestThreatTx = data?.cases?.[0] || null;

  const handleCopy = () => {
    if (latestThreatTx) {
      navigator.clipboard.writeText(JSON.stringify(latestThreatTx, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0" />
          <span>Enterprise Threat Specification & Real-Time API Inspector</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Technical architecture, threat intelligence model, and live API JSON telemetry from active database queries.
        </p>
      </div>

      {/* 1. Threat Flow Architecture Diagram */}
      <ThreatFlowDiagram />

      {/* 2. Live API Response Inspector */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider">
                Live API Response — Most Recent Flagged Threat
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dynamically fetched from <code className="text-cyan-300 font-mono">GET /api/cases</code> via SQLite Prisma query.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex-shrink-0">
              STATUS 200 OK
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-slate-400">
            Fetching latest threat payload from database...
          </div>
        ) : latestThreatTx ? (
          <div className="relative">
            <pre className="p-4 sm:p-5 rounded-xl bg-[#090C12] border border-slate-800/90 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
              {JSON.stringify(latestThreatTx, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="p-8 text-center font-mono text-xs text-slate-400">
            No High/Critical cases found in DB. Submit Preset 2 or 3 on Send Money to see live JSON here.
          </div>
        )}
      </div>

      {/* 3. Boss Scam & Deepfake Explainer Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card A: Anatomy */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">The Anatomy of the "CEO / Boss Scam"</h3>
              <p className="text-xs text-slate-400">Business Email Compromise (BEC) & Voice Cloning</p>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              Attackers synthesize voice deepfakes combined with urgent executive authority. An employee receives instructions supposedly from their CEO mandating an immediate, confidential wire to secure an acquisition or avert regulatory penalties.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 text-xs font-mono uppercase">Key Vectors Exploited:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-slate-200">Artificial Urgency:</strong> Demanding wire completion within hours.</li>
                <li><strong className="text-slate-200">Isolation / Strict Secrecy:</strong> Ordering victim not to disclose to internal teams.</li>
                <li><strong className="text-slate-200">Acoustic Synthetic Match:</strong> Using short public samples to generate voice clone instructions.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card B: Solution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Radio className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">FraudGuard's Multi-Layered Defense</h3>
              <p className="text-xs text-slate-400">Heuristic Multipliers + Adaptive Interception</p>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              FraudGuard eliminates delayed batch auditing by halting suspicious transactions inline before the wire ledger commits:
            </p>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-cyan-300 truncate">1. Heuristic Multiplier Check</span>
                <span className="text-slate-400 flex-shrink-0">&gt;3x (+25) or &gt;10x (+40)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-cyan-300 truncate">2. Payee Verification & Age</span>
                <span className="text-slate-400 flex-shrink-0">Unsaved (+20) & &lt;24h (+15)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-cyan-300 truncate">3. Contextual Isolation Screening</span>
                <span className="text-slate-400 flex-shrink-0">Secrecy demand (+50)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-cyan-300 truncate">4. Acoustic Harmonic Analysis</span>
                <span className="text-slate-400 flex-shrink-0">Voice clone (+60-90)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. API Specification Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4 overflow-hidden">
        <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>FraudGuard API Surface Specification</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase bg-[#0E121B]">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Payload / Params</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-3 text-cyan-400 font-bold">POST</td>
                <td className="py-2.5 px-3 text-white">/api/transactions/evaluate</td>
                <td className="py-2.5 px-3 text-slate-300">Server-side baseline calculation</td>
                <td className="py-2.5 px-3 text-slate-400">amount, beneficiaryId, urgent, simulatedHour</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-amber-400 font-bold">PATCH</td>
                <td className="py-2.5 px-3 text-white">/api/transactions/:id/social-check</td>
                <td className="py-2.5 px-3 text-slate-300">Evaluates impersonation questionnaire</td>
                <td className="py-2.5 px-3 text-slate-400">answer: self | bank | employer | secrecy</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-amber-400 font-bold">PATCH</td>
                <td className="py-2.5 px-3 text-white">/api/transactions/:id/deepfake-check</td>
                <td className="py-2.5 px-3 text-slate-300">Simulated neural voice analysis</td>
                <td className="py-2.5 px-3 text-slate-400">audioFileName, metadata</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-amber-400 font-bold">PATCH</td>
                <td className="py-2.5 px-3 text-white">/api/transactions/:id/finalize</td>
                <td className="py-2.5 px-3 text-slate-300">Combines composite scores into decision</td>
                <td className="py-2.5 px-3 text-slate-400">overrideApproved (optional boolean)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-white">/api/dashboard/stats</td>
                <td className="py-2.5 px-3 text-slate-300">Aggregates telemetry and counts</td>
                <td className="py-2.5 px-3 text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-white">/api/cases</td>
                <td className="py-2.5 px-3 text-slate-300">Lists High & Critical security cases</td>
                <td className="py-2.5 px-3 text-slate-400">?status=all | HELD | PENDING | APPROVED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
