import React from 'react';

export default function PrintablePlan({ surveyData, routeData }) {
  const pins = surveyData?.pins || [];
  const start = surveyData?.start || { x: 40, y: 40 };
  const naiveM = routeData?.naive_length_m || 3030.6;
  const optM = routeData?.optimized_length_m || 0;
  const savedPct = routeData?.saved_pct || 0;
  const order = routeData?.order || pins.map(p => p.id);

  return (
    <div id="printable-plan" className="hidden print:block p-8 bg-white text-black font-sans">
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AquaTriage Cleanup Mission Plan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Autonomous Underwater Debris Triage & Bathymetric Routing
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 font-mono">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Model: MBARI YOLOv8x | Grid: 700×460 units</p>
        </div>
      </div>

      {/* Mission Key Metrics */}
      <div className="grid grid-cols-4 gap-4 p-4 mb-6 bg-gray-100 rounded border border-gray-300">
        <div>
          <span className="text-xs text-gray-600 block uppercase font-mono">Debris Targets</span>
          <span className="text-xl font-bold">{pins.length} items</span>
        </div>
        <div>
          <span className="text-xs text-gray-600 block uppercase font-mono">Optimized Path</span>
          <span className="text-xl font-bold text-green-700">{optM.toFixed(1)} m</span>
        </div>
        <div>
          <span className="text-xs text-gray-600 block uppercase font-mono">Blind Sweep Path</span>
          <span className="text-xl font-bold text-red-700">{naiveM.toFixed(1)} m</span>
        </div>
        <div>
          <span className="text-xs text-gray-600 block uppercase font-mono">Distance Saved</span>
          <span className="text-xl font-bold text-blue-700">{savedPct}%</span>
        </div>
      </div>

      {/* Dive Sequence Line */}
      <div className="mb-6 p-3 border border-gray-400 bg-gray-50 rounded">
        <span className="text-xs font-bold uppercase font-mono mr-2">Optimized Dive Order:</span>
        <span className="font-mono text-sm font-bold">
          Buoy Start ({start.x}, {start.y}) →{' '}
          {order.map((id, i) => {
            const p = pins.find(pin => pin.id === id);
            return p ? `${p.item || id} [Pin #${i + 1}]` : id;
          }).join(' → ')}
        </span>
      </div>

      {/* Waypoint Coordinate Manifest */}
      <h2 className="text-base font-bold mb-2">Waypoint Target Coordinates</h2>
      <table className="w-full text-left text-xs border border-gray-300 mb-8">
        <thead className="bg-gray-200 border-b border-gray-300">
          <tr>
            <th className="p-2 font-mono">Waypoint</th>
            <th className="p-2">Item Description</th>
            <th className="p-2 font-mono">Seafloor X</th>
            <th className="p-2 font-mono">Seafloor Y</th>
            <th className="p-2">Priority</th>
            <th className="p-2 font-mono">Detection Conf</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="bg-gray-50 font-bold">
            <td className="p-2 font-mono">START</td>
            <td className="p-2">Surface Entry Buoy</td>
            <td className="p-2 font-mono">{start.x}</td>
            <td className="p-2 font-mono">{start.y}</td>
            <td className="p-2">-</td>
            <td className="p-2 font-mono">1.00</td>
          </tr>
          {pins.map((pin, idx) => (
            <tr key={pin.id}>
              <td className="p-2 font-mono">PIN #{idx + 1}</td>
              <td className="p-2 font-medium">{pin.item || `Debris item #${idx + 1}`}</td>
              <td className="p-2 font-mono">{pin.x.toFixed(1)}</td>
              <td className="p-2 font-mono">{pin.y.toFixed(1)}</td>
              <td className="p-2">
                <span className="font-semibold">{pin.priority}</span>
              </td>
              <td className="p-2 font-mono">{(pin.confidence * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Notes */}
      <div className="border-t border-gray-300 pt-4 text-xs text-gray-500 flex justify-between">
        <span>Positions simulated from ROV frame spatial trajectory. 1 unit = 0.5 m.</span>
        <span>Sample frames: TrashCan 1.0 (UMN). Model: FathomNet/trash-detector (MBARI).</span>
      </div>
    </div>
  );
}
