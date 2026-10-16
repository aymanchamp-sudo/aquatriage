import React from 'react';
import { Download, Printer, Route, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ResultsPanel({
  surveyData,
  routeData,
  hoveredPinId,
  setHoveredPinId,
  selectedPinId,
  setSelectedPinId,
  onPlanRoute,
  isRouting,
  onJumpToFrame,
}) {
  const pins = surveyData?.pins || [];
  const framesChecked = surveyData?.frames_checked || 0;
  const marineLifeCount = surveyData?.marine_life_count || 0;
  const itemsFound = pins.length;
  const highPriorityCount = pins.filter(p => p.priority === 'High').length;

  const naiveM = routeData?.naive_length_m || 3030.6;
  const optM = routeData?.optimized_length_m || 0;
  const savedPct = routeData?.saved_pct !== undefined ? routeData.saved_pct : 0;
  const diveOrder = routeData?.order || pins.map(p => p.id);

  // Map pin ID to index 1-based
  const pinIndexMap = new Map();
  pins.forEach((p, idx) => {
    pinIndexMap.set(p.id, idx + 1);
  });

  const downloadPlanJSON = () => {
    const plan = {
      timestamp: new Date().toISOString(),
      survey_summary: {
        items_found: itemsFound,
        high_priority: highPriorityCount,
        frames_checked: framesChecked,
        marine_life_ignored: marineLifeCount,
      },
      route_metrics: {
        naive_sweep_m: naiveM,
        optimized_route_m: optM,
        saved_percentage: savedPct,
        algorithm: routeData?.algorithm || 'nearest-neighbour + 2-opt',
      },
      dive_order_ids: diveOrder,
      dive_order_pins: diveOrder.map(id => pins.find(p => p.id === id) || id),
      pins: pins,
      start_coordinates: surveyData?.start || { x: 40, y: 40 },
    };

    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquatriage_cleanup_plan_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <aside className="w-[28%] min-w-[320px] h-full flex flex-col gap-3 select-none">
      <div className="panel-box rounded-xl p-3.5 flex flex-col gap-3 flex-1 overflow-hidden">
        {/* Header Pill */}
        <div className="flex items-center justify-between shrink-0">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 font-display font-bold text-xs tracking-wider text-[#00F0FF]">
            3 • RESULTS
          </span>
          <span className="text-slate-400 text-xs">Summary & Path</span>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-4 gap-1.5 shrink-0">
          <div className="bg-[#070B14]/70 border border-[rgba(103,232,249,0.15)] rounded-lg p-2 flex flex-col">
            <span className="text-slate-400 text-[10px] leading-tight truncate">Items found</span>
            <span className="font-mono text-lg font-bold text-[#E2E8F0] mt-0.5">
              {itemsFound}
            </span>
          </div>

          <div className="bg-[#070B14]/70 border border-[#F43F5E]/30 rounded-lg p-2 flex flex-col">
            <span className="text-slate-400 text-[10px] leading-tight truncate">High priority</span>
            <span className="font-mono text-lg font-bold text-[#F43F5E] mt-0.5">
              {highPriorityCount}
            </span>
          </div>

          <div className="bg-[#070B14]/70 border border-[rgba(103,232,249,0.15)] rounded-lg p-2 flex flex-col">
            <span className="text-slate-400 text-[10px] leading-tight truncate">Frames</span>
            <span className="font-mono text-lg font-bold text-[#E2E8F0] mt-0.5">
              {framesChecked}
            </span>
          </div>

          <div className="bg-[#070B14]/70 border border-slate-700/60 rounded-lg p-2 flex flex-col">
            <span className="text-slate-400 text-[10px] leading-tight truncate">Marine life</span>
            <span className="font-mono text-lg font-bold text-slate-400 mt-0.5">
              {marineLifeCount}
            </span>
          </div>
        </div>

        {/* Hero Comparison Card */}
        <div className="bg-[#070B14]/80 border border-[rgba(103,232,249,0.2)] rounded-lg p-3 flex flex-col gap-2 shrink-0">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-300 font-semibold text-xs">Route efficiency</span>
            <span className="font-display text-base font-extrabold text-[#10B981]">
              {savedPct}% shorter
            </span>
          </div>

          {/* Comparative Horizontal Bars */}
          <div className="flex flex-col gap-2">
            {/* Blind Sweep Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Blind sweep (lawnmower)</span>
                <span className="font-mono text-[#F43F5E] font-semibold">{naiveM.toFixed(1)} m</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#F43F5E]/80 rounded-full"></div>
              </div>
            </div>

            {/* Optimized Route Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Optimized cleanup route</span>
                <span className="font-mono text-[#10B981] font-semibold">{optM.toFixed(1)} m</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981] transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(5, (optM / naiveM) * 100))}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detected Items Table */}
        <div className="flex-1 flex flex-col min-h-0 border border-[rgba(103,232,249,0.15)] rounded-lg overflow-hidden bg-[#070B14]/60">
          <div className="px-2.5 py-1.5 bg-[#0F172A] border-b border-slate-800 flex justify-between items-center shrink-0">
            <span className="font-display font-semibold text-xs text-slate-200">
              Detected Debris Items
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              {itemsFound} targets
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pins.length === 0 ? (
              <div className="h-full flex items-center justify-center p-4 text-center text-slate-500 text-xs">
                No routable debris detected in this survey.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#0F172A] text-slate-400 text-[11px] border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-1 px-2 font-mono">#</th>
                    <th className="py-1 px-2">Item</th>
                    <th className="py-1 px-2 font-mono">Confidence</th>
                    <th className="py-1 px-2">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {pins.map((pin, idx) => {
                    const isHovered = hoveredPinId === pin.id;
                    const isSelected = selectedPinId === pin.id;
                    return (
                      <tr
                        key={pin.id}
                        onMouseEnter={() => setHoveredPinId(pin.id)}
                        onMouseLeave={() => setHoveredPinId(null)}
                        onClick={() => {
                          setSelectedPinId(pin.id);
                          if (pin.frame !== undefined) {
                            onJumpToFrame(pin.frame);
                          }
                        }}
                        className={`cursor-pointer transition-colors ${
                          isHovered || isSelected
                            ? 'bg-cyan-500/20 text-white font-medium'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-1.5 px-2 font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 font-medium truncate max-w-[100px]">
                          {pin.item || `Debris #${idx + 1}`}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-300">
                          {(pin.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-1.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              pin.priority === 'High'
                                ? 'bg-[#F43F5E]/20 text-[#F43F5E]'
                                : pin.priority === 'Medium'
                                ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                                : 'bg-cyan-500/20 text-[#00F0FF]'
                            }`}
                          >
                            {pin.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dive order & Action Buttons */}
        <div className="flex flex-col gap-2 pt-1 shrink-0">
          {/* Dive Order Sequence */}
          <div className="bg-[#070B14] border border-[rgba(103,232,249,0.15)] rounded-md px-2.5 py-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] font-medium shrink-0">
              Dive order:
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#10B981] truncate ml-2">
              {pins.length === 0
                ? 'None'
                : diveOrder
                    .map(id => pinIndexMap.get(id) || id.replace('pin', ''))
                    .join(' → ')}
            </span>
          </div>

          {/* Plan Route Button */}
          <button
            type="button"
            disabled={isRouting || pins.length === 0}
            onClick={onPlanRoute}
            className={`w-full py-1.5 px-3 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isRouting || pins.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plan Shortest Route (2-opt)</span>
          </button>

          {/* Download & Print */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadPlanJSON}
              className="py-1.5 px-2 rounded bg-[#0F172A] border border-[rgba(103,232,249,0.2)] hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-2 rounded bg-[#0F172A] border border-[rgba(103,232,249,0.2)] hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
