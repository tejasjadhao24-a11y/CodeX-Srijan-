'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Send, 
  FileWarning, 
  Layers, 
  Activity,
  Cpu,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const mainNavItems = [
    {
      name: 'Telemetry Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'LIVE',
    },
    {
      name: 'Send Money & Intercept',
      href: '/send-money',
      icon: Send,
      badge: 'TEST',
    },
    {
      name: 'Case Incident Review',
      href: '/cases',
      icon: FileWarning,
      badge: 'SEC',
    },
    {
      name: 'Enterprise Threat Spec',
      href: '/enterprise',
      icon: Layers,
      badge: 'API',
    },
  ];

  const familyNavItem = {
    name: 'Guardian Mode',
    href: '/guardian',
    icon: Users,
    badge: 'FAMILY',
  };

  return (
    <aside className="w-[260px] flex-shrink-0 bg-[#10141D] border-r border-slate-800/80 flex flex-col justify-between h-full select-none z-20">
      {/* Brand Header */}
      <div className="h-16 flex-shrink-0 flex items-center px-5 border-b border-slate-800/80 gap-3 bg-[#0B0E14]/80">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="font-bold tracking-wider text-sm text-white flex items-center gap-1 truncate">
            FRAUD<span className="text-cyan-400">GUARD</span>
          </h1>
          <p className="text-[9px] tracking-widest text-slate-400 font-mono truncate">AI RISK ENGINE</p>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        
        {/* Section 1: Operations */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
            Operational Console
          </div>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/80 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Section 2: Family Protection (Guardian Mode) */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-purple-400 uppercase font-semibold flex items-center justify-between">
            <span>Family Protection</span>
            <span className="text-[8px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
              NEW
            </span>
          </div>

          <Link
            href={familyNavItem.href}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              pathname === familyNavItem.href
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users className={`w-4 h-4 flex-shrink-0 transition-colors ${
                pathname === familyNavItem.href ? 'text-purple-400' : 'text-purple-400/80 group-hover:text-purple-300'
              }`} />
              <span className="truncate">{familyNavItem.name}</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
              pathname === familyNavItem.href ? 'bg-purple-500/20 text-purple-200' : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
            }`}>
              {familyNavItem.badge}
            </span>
          </Link>
        </div>

      </div>

      {/* Engine Status & System Info Footer */}
      <div className="p-4 pb-6 border-t border-slate-800/80 bg-[#0B0E14]/70 flex-shrink-0 space-y-3">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Model Engine</span>
            </span>
            <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50 flex-shrink-0">
              v2.5 ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Latency Avg</span>
            <span className="text-slate-200">~18ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Storage Layer</span>
            <span className="text-slate-200">SQLite + Prisma</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
          <span className="truncate">SWR Polling: Active (3s)</span>
        </div>
      </div>
    </aside>
  );
}
