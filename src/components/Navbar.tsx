'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Baby, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<'adult' | 'minor'>('adult');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fraudguard_active_user');
    if (saved === 'minor') setCurrentUser('minor');
  }, []);

  const handleSelectUser = (userType: 'adult' | 'minor') => {
    setCurrentUser(userType);
    localStorage.setItem('fraudguard_active_user', userType);
    setDropdownOpen(false);
    // Dispatch event so SendMoney and pages can react immediately
    window.dispatchEvent(new CustomEvent('fraudguard_user_switched', { detail: userType }));
  };

  return (
    <header className="h-16 flex-shrink-0 border-b border-slate-800/80 bg-[#10141D]/90 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-10">
      {/* Live System Indicator */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex-shrink-0">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide truncate">Protection Status: ACTIVE</span>
          <span className="text-emerald-500/60 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">Real-Time Ingestion</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-800 flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>Active Window: 08:00 – 22:00</span>
        </div>
      </div>

      {/* User Session Profile Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors text-left"
        >
          <div className="hidden sm:flex flex-col text-right">
            <div className="text-xs font-semibold text-white flex items-center justify-end gap-1.5">
              {currentUser === 'adult' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Alex Rivera (Guardian)</span>
                </>
              ) : (
                <>
                  <Baby className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>Jordan (Minor, age 12)</span>
                </>
              )}
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80">
              {currentUser === 'adult' ? 'Baseline: $2,000.00' : 'Limit: $50.00 / tx'}
            </div>
          </div>

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
            currentUser === 'adult'
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300'
              : 'bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/40 text-purple-300'
          }`}>
            {currentUser === 'adult' ? 'AR' : 'JR'}
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121620] border border-slate-700 shadow-2xl p-2 space-y-1 z-30 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Switch Demo Perspective
            </div>
            
            <button
              onClick={() => handleSelectUser('adult')}
              className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                currentUser === 'adult' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div>
                <span className="font-bold block">Alex Rivera (Adult)</span>
                <span className="text-[10px] text-slate-400">Baseline $2,000 • Full Admin</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">PARENT</span>
            </button>

            <button
              onClick={() => handleSelectUser('minor')}
              className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                currentUser === 'minor' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div>
                <span className="font-bold block text-purple-300">Jordan Rivera (Minor)</span>
                <span className="text-[10px] text-slate-400">Age 12 • Guardian Monitored</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">CHILD</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
