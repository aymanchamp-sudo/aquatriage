import React, { useState, useEffect } from 'react';
import { Eye, Navigation, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function CenterPanel({
  activeTab,
  setActiveTab,
  surveyData,
  routeData,
  currentFrameIdx,
  setCurrentFrameIdx,
  compareBlindSearch,
  setCompareBlindSearch,
  isLoading,
  hoveredPinId,
  setHoveredPinId,
  selectedPinId,
  setSelectedPinId,
  onSelectSample,
}) {
  const [visualMode, setVisualMode] = useState('corrected'); // 'raw' | 'corrected'
  const [tooltipPin, setTooltipPin] = useState(null);

  const frames = surveyData?.frames || [];
  const pins = surveyData?.pins || [];
  const currentFrame = frames[currentFrameIdx] || frames[0] || null;
  const currentDetections = currentFrame?.detections || [];
  const debrisOnScreen = currentDetections.filter(d => d.label === 'Debris').length;
  const marineLifeOnScreen = currentDetections.filter(d => d.label === 'Marine life').length;

  // Determine frames that contain debris detections for scrubber dots
  const framesWithDebris = new Set();
  frames.forEach((f, idx) => {
    if (f.detections && f.detections.some(d => d.label === 'Debris')) {
      framesWithDebris.add(idx);
    }
  });

  // Calculate SVG route paths
  const start = surveyData?.start || { x: 40, y: 40 };

  const buildPathD = (points) => {
    if (!points || points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  };

  const optimizedPathD = routeData?.path ? buildPathD(routeData.path) : '';
  const naivePathD = routeData?.naive_path
    ? buildPathD(routeData.naive_path)
    : 'M 80,70 L 620,70 L 620,130 L 80,130 L 80,190 L 620,190 L 620,250 L 80,250 L 80,310 L 620,310 L 620,370 L 80,370';

  // Get active image src
  const activeImageSrc = currentFrame
    ? visualMode === 'raw' && currentFrame.raw_image
      ? currentFrame.raw_image
      : currentFrame.image || currentFrame.raw_image
    : null;

  return (
    <section className="flex-1 h-full flex flex-col gap-2.5 min-w-[420px] select-none overflow-hidden">
      {/* Top Tab Switcher */}
      <div className="panel-box rounded-xl p-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('detect')}
            className={`px-3.5 py-1.5 rounded-lg font-display font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'detect'
                ? 'bg-[#00F0FF] text-[#070B14] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#070B14]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2 • Detect</span>
            {surveyData && (
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[11px] font-bold ${
                  activeTab === 'detect'
                    ? 'bg-[#070B14]/20 text-[#070B14]'
                    : 'bg-cyan-500/15 text-cyan-300'
                }`}
              >
                {debrisOnScreen} on screen
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`px-3.5 py-1.5 rounded-lg font-display font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'route'
                ? 'bg-[#00F0FF] text-[#070B14] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#070B14]'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>3 • Route</span>
            {routeData?.saved_pct !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[11px] font-bold ${
                  activeTab === 'route'
                    ? 'bg-[#070B14]/20 text-[#070B14]'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-[#10B981]'
                }`}
              >
                {routeData.saved_pct}% shorter
              </span>
            )}
          </button>
        </div>

        {/* Route comparison checkbox toggle (visible on Route tab) */}
        {activeTab === 'route' && (
          <div className="pr-2 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={compareBlindSearch}
                onChange={(e) => setCompareBlindSearch(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-[#F43F5E] focus:ring-0 accent-[#F43F5E]"
              />
              <span className="text-[11px] text-slate-300 font-medium">
                Compare with blind sweep
              </span>
            </label>
          </div>
        )}
      </div>

      {/* VIEW 1: DETECT VIEWPORT */}
      {activeTab === 'detect' && (
        <div className="panel-box rounded-xl flex-1 flex flex-col overflow-hidden relative">
          {/* Main Image Area */}
          <div className="relative flex-1 w-full bg-[#05080F] overflow-hidden flex items-center justify-center">
            {activeImageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img
                  src={activeImageSrc}
                  alt={`Underwater survey frame ${currentFrameIdx + 1}`}
                  className="max-h-full max-w-full object-contain rounded border border-cyan-500/20 shadow-lg"
                />

                {/* Marine life notice if present */}
                {marineLifeOnScreen > 0 && (
                  <div className="absolute top-4 right-4 bg-slate-900/85 border border-slate-700/80 rounded-md px-2.5 py-1 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span>{marineLifeOnScreen} marine life (ignored)</span>
                  </div>
                )}
              </div>
            ) : !isLoading ? (
              /* Empty State Overlay */
              <div className="absolute inset-0 bg-[#070B14]/95 flex flex-col items-center justify-center p-6 text-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-[#0F172A] border border-cyan-500/20 flex items-center justify-center text-slate-400">
                  <Eye className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="font-display text-base font-bold text-slate-200">
                  Pick a survey or upload an image
                </h4>
                <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                  Select Survey 1, 2, or 3 from the left panel, or drag & drop an ROV frame to detect underwater debris and plan the optimal cleanup route.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectSample('survey1')}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#00F0FF] text-[#070B14] font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:brightness-110 transition-all"
                >
                  Load Survey 1 Benchmark
                </button>
              </div>
            ) : null}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-[#070B14]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 gap-3 z-30">
                <div className="w-9 h-9 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-mono text-sm text-[#00F0FF] font-semibold">
                  Analyzing frame {frames.length > 0 ? `${currentFrameIdx + 1} of ${frames.length}` : '...'}
                </span>
                <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div className="w-[60%] h-full bg-[#00F0FF] animate-pulse"></div>
                </div>
                <span className="text-slate-400 text-xs font-mono">
                  MBARI YOLOv8x inference & optical correction
                </span>
              </div>
            )}
          </div>

          {/* Clean Bar Beneath Image */}
          <div className="h-12 bg-[#070B14] border-t border-[rgba(103,232,249,0.2)] px-4 flex items-center justify-between gap-4 shrink-0">
            {/* Raw | Corrected Toggle Button */}
            <div className="flex items-center bg-[#0F172A] border border-[rgba(103,232,249,0.2)] rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setVisualMode('raw')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  visualMode === 'raw'
                    ? 'bg-cyan-500/20 text-[#00F0FF] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('corrected')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  visualMode === 'corrected'
                    ? 'bg-cyan-500/20 text-[#00F0FF] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Corrected
              </button>
            </div>

            {/* Frame Scrubber with Debris Dots */}
            {frames.length > 0 && (
              <div className="flex-1 flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentFrameIdx === 0}
                  onClick={() => setCurrentFrameIdx(Math.max(0, currentFrameIdx - 1))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
                  Frame {currentFrameIdx + 1} / {frames.length}
                </span>

                <div className="relative flex-1 h-3 bg-slate-800 rounded-full cursor-pointer flex items-center px-1">
                  {/* Background bar */}
                  <div
                    className="h-1.5 bg-cyan-500/30 rounded-full"
                    style={{
                      width: `${((currentFrameIdx + 1) / frames.length) * 100}%`,
                    }}
                  />

                  {/* Clickable scrubber step indicators with dots */}
                  {frames.map((_, idx) => {
                    const posPct = ((idx + 0.5) / frames.length) * 100;
                    const hasDebris = framesWithDebris.has(idx);
                    const isCurrent = idx === currentFrameIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setCurrentFrameIdx(idx)}
                        className="absolute -top-1 bottom-0 w-3 -translate-x-1/2 flex items-center justify-center cursor-pointer group"
                        style={{ left: `${posPct}%` }}
                        title={`Frame ${idx + 1}${hasDebris ? ' (Debris found)' : ''}`}
                      >
                        {isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] ring-2 ring-cyan-900" />
                        ) : hasDebris ? (
                          <div className="w-2 h-2 rounded-full bg-[#F43F5E] group-hover:scale-125 transition-transform shadow-[0_0_5px_#F43F5E]" />
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-slate-400" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentFrameIdx === frames.length - 1}
                  onClick={() => setCurrentFrameIdx(Math.min(frames.length - 1, currentFrameIdx + 1))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ROUTE BATHYMETRY VIEWPORT */}
      {activeTab === 'route' && (
        <div className="panel-box rounded-xl flex-1 flex flex-col overflow-hidden relative">
          <div className="relative flex-1 w-full bg-[#05080F] flex items-center justify-center p-2">
            <svg
              className="w-full h-full max-h-[600px] border border-cyan-500/20 rounded-lg bg-[#070B14]"
              viewBox="0 0 700 460"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Subtle Isobath Depth Contours */}
              <g fill="none" opacity="0.7" stroke="#16253B" strokeWidth="1.2">
                <path d="M 0,60 C 180,80 320,30 480,70 S 620,110 700,90" />
                <path d="M 0,150 C 160,180 310,130 490,170 S 640,210 700,180" />
                <path d="M 0,240 C 140,270 300,220 480,260 S 610,290 700,270" />
                <path d="M 0,330 C 180,360 340,310 520,350 S 630,380 700,360" />
                <path d="M 0,420 C 190,440 360,400 540,430 S 660,450 700,440" />
              </g>

              {/* Coordinate Grid Lines */}
              <g stroke="#0F172A" strokeDasharray="2 4" strokeWidth="0.8">
                <line x1="140" y1="0" x2="140" y2="460" />
                <line x1="280" y1="0" x2="280" y2="460" />
                <line x1="420" y1="0" x2="420" y2="460" />
                <line x1="560" y1="0" x2="560" y2="460" />
                <line x1="0" y1="115" x2="700" y2="115" />
                <line x1="0" y1="230" x2="700" y2="230" />
                <line x1="0" y1="345" x2="700" y2="345" />
              </g>

              {/* Blind Search Lawnmower Sweep (dashed coral line) */}
              {compareBlindSearch && (
                <g
                  fill="none"
                  stroke="#F43F5E"
                  strokeDasharray="5 5"
                  strokeWidth="1.6"
                  opacity="0.45"
                  className="transition-opacity duration-300"
                >
                  <path d={naivePathD} />
                </g>
              )}

              {/* Glowing Emerald Optimized Route */}
              {optimizedPathD && (
                <g>
                  <path
                    d={optimizedPathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#routeGlow)"
                    className="transition-all duration-500"
                  />
                </g>
              )}

              {/* Cyan Entry Buoy Marker (START) */}
              <g transform={`translate(${start.x}, ${start.y})`} className="cursor-pointer">
                <circle cx="0" cy="0" r="12" fill="#00F0FF" opacity="0.25" className="animate-ping" />
                <circle cx="0" cy="0" r="6" fill="#00F0FF" />
                <text
                  x="14"
                  y="4"
                  fill="#00F0FF"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="11"
                  fontWeight="700"
                >
                  START ({start.x}, {start.y})
                </text>
              </g>

              {/* Numbered Pins */}
              {pins.map((pin, idx) => {
                const isHovered = hoveredPinId === pin.id;
                const isSelected = selectedPinId === pin.id;
                const pinNum = idx + 1;
                const pinColor =
                  pin.priority === 'High'
                    ? '#F43F5E'
                    : pin.priority === 'Medium'
                    ? '#F59E0B'
                    : '#00F0FF';

                return (
                  <g
                    key={pin.id}
                    transform={`translate(${pin.x}, ${pin.y})`}
                    className="cursor-pointer group"
                    onMouseEnter={() => {
                      setHoveredPinId(pin.id);
                      setTooltipPin(pin);
                    }}
                    onMouseLeave={() => {
                      setHoveredPinId(null);
                      setTooltipPin(null);
                    }}
                    onClick={() => {
                      setSelectedPinId(pin.id);
                      if (pin.frame !== undefined) {
                        setCurrentFrameIdx(pin.frame);
                        setActiveTab('detect');
                      }
                    }}
                  >
                    {/* Glowing highlight ring */}
                    {(isHovered || isSelected) && (
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="none"
                        stroke="#00F0FF"
                        strokeWidth="2.5"
                        filter="url(#routeGlow)"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx="0"
                      cy="0"
                      r={isHovered || isSelected ? '11' : '9'}
                      fill={pinColor}
                      stroke="#070B14"
                      strokeWidth="1.5"
                      className="transition-transform group-hover:scale-110"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize="9"
                      fontWeight="700"
                    >
                      {pinNum}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {tooltipPin && (
              <div
                className="absolute z-20 pointer-events-none bg-[#0F172A]/95 border border-cyan-400/50 rounded-lg p-2.5 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-sm text-xs font-mono"
                style={{
                  left: `${(tooltipPin.x / 700) * 85 + 5}%`,
                  top: `${(tooltipPin.y / 460) * 75 + 10}%`,
                }}
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      tooltipPin.priority === 'High'
                        ? 'bg-[#F43F5E]'
                        : tooltipPin.priority === 'Medium'
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#00F0FF]'
                    }`}
                  />
                  <span>{tooltipPin.item || tooltipPin.id}</span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Pos: ({tooltipPin.x.toFixed(0)}, {tooltipPin.y.toFixed(0)}) • Conf: {(tooltipPin.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-cyan-400 text-[10px] mt-1 font-sans">
                  Click to view frame {tooltipPin.frame + 1}
                </div>
              </div>
            )}
          </div>

          {/* Seafloor telemetry bottom readout */}
          <div className="h-10 bg-[#070B14] border-t border-[rgba(103,232,249,0.2)] px-4 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
            <div className="flex items-center gap-3">
              <span>Grid: 700×460 units (350×230 m)</span>
              <span className="text-slate-600">|</span>
              <span>1 unit = 0.5 m</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="text-emerald-400 font-semibold">2-opt optimized</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
