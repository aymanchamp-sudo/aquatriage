import React from 'react';
import { Radar, ArrowLeft, Play, WifiOff } from 'lucide-react';

export default function TopBar({ view, setView, isOffline }) {
  return (
    <header className="h-14 shrink-0 bg-[#070B14]/90 border-b border-[rgba(103,232,249,0.2)] px-4 flex items-center justify-between z-20 select-none">
      {/* Left: Brand */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => setView('landing')}
        title="AquaTriage Home"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <Radar className="w-5 h-5 text-[#00F0FF]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-base tracking-wider text-[#00F0FF] leading-tight">
            AQUATRIAGE
          </span>
          <span className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">
            Marine Bathymetry & Debris Routing
          </span>
        </div>
      </div>

      {/* Center: Demo Data badge & Offline badge */}
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-[#0F172A] border border-[rgba(103,232,249,0.25)] flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
          <span className="font-mono text-xs text-[#E2E8F0] tracking-wide">
            Demo data: simulated positions
          </span>
        </div>

        {isOffline && (
          <div className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center gap-1.5 text-amber-300">
            <WifiOff className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-[10px] tracking-wide">Offline Fallback</span>
          </div>
        )}
      </div>

      {/* Right: View Toggle */}
      <div>
        {view === 'dashboard' ? (
          <button
            onClick={() => setView('landing')}
            className="px-3.5 py-1.5 rounded-md border border-[rgba(103,232,249,0.25)] hover:bg-[#0F172A] hover:border-cyan-400/50 text-[#E2E8F0] text-xs font-medium transition-all flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Story</span>
          </button>
        ) : (
          <button
            onClick={() => setView('dashboard')}
            className="px-3.5 py-1.5 rounded-md bg-[#00F0FF] text-[#070B14] font-display font-bold text-xs hover:brightness-110 shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Command Center</span>
          </button>
        )}
      </div>
    </header>
  );
}
