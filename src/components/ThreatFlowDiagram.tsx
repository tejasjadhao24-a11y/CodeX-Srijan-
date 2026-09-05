'use client';

import React from 'react';
import { ArrowRight, Cpu, ShieldCheck, Database, Radio, UserX, Lock } from 'lucide-react';

export default function ThreatFlowDiagram() {
  const steps = [
    {
      step: 'STEP 01',
      title: 'Real-Time Ingestion',
      icon: Database,
      desc: 'Intercepts payment payload: amount, beneficiary metadata, timing signature.',
      color: 'border-cyan-500/40 text-cyan-400 bg-[#121824]',
      badge: 'INGEST',
    },
    {
      step: 'STEP 02',
      title: 'Baseline Multipliers',
      icon: Cpu,
      desc: 'Compares against 10x/3x user historical average, off-hours, and 10-min velocity.',
      color: 'border-blue-500/40 text-blue-400 bg-[#121624]',
      badge: 'HEURISTIC',
    },
    {
      step: 'STEP 03',
      title: 'Impersonation Screening',
      icon: UserX,
      desc: 'Triggers dynamic questionnaire detecting CEO, police, or emergency coercion scripts.',
      color: 'border-amber-500/40 text-amber-400 bg-[#1a1714]',
      badge: 'CONTEXT',
    },
    {
      step: 'STEP 04',
      title: 'Deepfake Audio Biomarkers',
      icon: Radio,
      desc: 'Simulated neural acoustic scanner checks audio harmonics for synthetic cloning.',
      color: 'border-orange-500/40 text-orange-400 bg-[#1c1614]',
      badge: 'SPECTRAL',
    },
    {
      step: 'STEP 05',
      title: 'Automated Decision Gate',
      icon: Lock,
      desc: 'Applies instant hold, quarantine, or approval with audit trail into SQLite database.',
      color: 'border-red-500/40 text-red-400 bg-[#1c1216]',
      badge: 'GATE',
    },
  ];

  return (
    <div className="w-full p-5 lg:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4">
      {/* Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-mono font-bold tracking-wider text-cyan-400 uppercase">
            Multi-Layered Detection Architecture Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential evaluation stages protecting against zero-day social engineering and deepfake scams
          </p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 self-start sm:self-auto flex-shrink-0">
          Latency Budget: &lt;25ms
        </span>
      </div>

      {/* Grid of Steps: Responsive, cleanly bounded, no clipping, icons beside text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-200 hover:border-cyan-500/60 ${item.color}`}
            >
              {/* Card Header: Icon beside title/badge with flex items-center */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase truncate">
                    {item.step}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700 flex-shrink-0">
                  {item.badge}
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Sequence Status Tag */}
              <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Phase {idx + 1} of 5</span>
                {idx < steps.length - 1 ? (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    Pass <ArrowRight className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">Ledger Final</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
