'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  Gamepad2, 
  RotateCw, 
  Lock, 
  TrendingUp,
  Clock,
  Eye,
  Check
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GuardianDashboardPage() {
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<string>('50');
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitSavedMsg, setLimitSavedMsg] = useState(false);

  // Poll guardian alerts and stats every 3 seconds
  const { data, isLoading, mutate } = useSWR('/api/guardian/stats', fetcher, {
    refreshInterval: 3000,
  });

  const minors = data?.minors || [];
  const alerts = data?.alerts || [];
  const categorySpend = data?.categorySpend || {};
  const merchantSpend = data?.merchantSpend || {};
  const activeMinor = minors[0] || null;

  const handleAlertAction = async (alertId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingAlertId(alertId);
    try {
      await fetch(`/api/guardian/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, acknowledged: true }),
      });
      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAlertId(null);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    setUpdatingAlertId(alertId);
    try {
      await fetch(`/api/guardian/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true }),
      });
      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAlertId(null);
    }
  };

  const handleSaveSpendLimit = async (minorId: string) => {
    setSavingLimit(true);
    try {
      await fetch('/api/guardian/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minorId, minorSpendLimit: parseFloat(newLimit) }),
      });
      await mutate();
      setLimitSavedMsg(true);
      setTimeout(() => setLimitSavedMsg(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLimit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Guardian Mode — Child & Minor Protection
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/40 text-purple-300 font-semibold uppercase">
              FOR FAMILIES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervised spend limits, un-deletable transaction mirroring, and instant approval triggers for linked minor accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span>Live Monitor: Active</span>
          </div>
          <button
            onClick={() => mutate()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Refresh Guardian Telemetry"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Linked Minor Accounts Overview & Spend Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Minor Profile Summary */}
        <div className="p-5 rounded-2xl bg-[#121620] border border-purple-500/30 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                Linked Minor Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Age: 12
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-bold text-white">
                {activeMinor ? activeMinor.name : 'Jordan Rivera'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Baseline Avg: ${activeMinor?.avgTransactionAmount || 25.00} • Device: iPad Mini
              </p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Past 7 Days Spend:</span>
                <span className="font-mono font-bold text-white">
                  ${activeMinor?.totalSpendThisWeek || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pending Approvals:</span>
                <span className={`font-mono font-bold ${activeMinor?.pendingAlertsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {activeMinor?.pendingAlertsCount || 0} alerts
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>Mirroring: Child cannot delete logs</span>
          </div>
        </div>

        {/* Card 2: Configurable Spend Threshold */}
        <div className="p-5 rounded-2xl bg-[#121620] border border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Approval Threshold</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Current: ${activeMinor?.minorSpendLimit || 50}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Any transfer or in-app purchase above this amount automatically requires parent confirmation before clearing.
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">
                Per-Transaction Approval Limit ($ USD)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  defaultValue={activeMinor?.minorSpendLimit || 50}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => activeMinor && handleSaveSpendLimit(activeMinor.id)}
                  disabled={savingLimit}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider transition-colors flex-shrink-0"
                >
                  {savingLimit ? 'Saving...' : 'Update'}
                </button>
              </div>
              {limitSavedMsg && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" /> New threshold activated!
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Enforces Adaptive Intervention on threshold breach
          </span>
        </div>

        {/* Card 3: Weekly Spend Breakdown by Category */}
        <div className="p-5 rounded-2xl bg-[#121620] border border-slate-800 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Spend by Category</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">7-Day Window</span>
          </div>

          <div className="space-y-2.5 flex-1 pt-1">
            {Object.keys(categorySpend).length === 0 ? (
              <span className="text-xs font-mono text-slate-400">No category spend recorded this week.</span>
            ) : (
              Object.entries(categorySpend).map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 uppercase">[{cat}]</span>
                  <span className="font-mono font-bold text-white">${Number(val).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Primary Merchant:</span>
            <span className="text-cyan-400 font-semibold truncate max-w-[140px]">
              {Object.keys(merchantSpend)[0] || 'Roblox'}
            </span>
          </div>
        </div>

      </div>

      {/* Real-Time Guardian Alerts & Transaction Activity Stream */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Minor Account Live Guardian Alerts & Interceptions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live feed of minor transactions automatically mirrored to your guardian dashboard. Cannot be cleared by child.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {alerts.length} mirrored events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 tracking-wider bg-[#0E121B]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Minor Account</th>
                <th className="py-3 px-4">Merchant / App</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Alert Status</th>
                <th className="py-3 px-4 text-right">Guardian Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    Loading Guardian mirrored transactions...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No minor transactions recorded yet. Switch to Jordan in Send Money to test.
                  </td>
                </tr>
              ) : (
                alerts.map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-purple-300 whitespace-nowrap">
                      {alert.transaction?.user?.name || 'Jordan Rivera'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {alert.transaction?.beneficiaryName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-700/50 uppercase">
                        {alert.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      ${alert.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        alert.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          : alert.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {alert.status === 'PENDING' ? 'PENDING APPROVAL' : alert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {alert.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleAlertAction(alert.id, 'APPROVED')}
                              disabled={updatingAlertId === alert.id}
                              className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleAlertAction(alert.id, 'REJECTED')}
                              disabled={updatingAlertId === alert.id}
                              className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-600/40 text-red-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Block</span>
                            </button>
                          </>
                        ) : !alert.acknowledged ? (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={updatingAlertId === alert.id}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Mark Seen</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
