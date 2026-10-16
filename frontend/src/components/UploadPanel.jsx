import React, { useRef } from 'react';
import { UploadCloud, Play, Loader2, Sparkles, Sliders } from 'lucide-react';

export default function UploadPanel({
  surveys,
  activeSurvey,
  setActiveSurvey,
  uploadedFile,
  setUploadedFile,
  conf,
  setConf,
  correct,
  setCorrect,
  isLoading,
  onRunDetection,
}) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setActiveSurvey(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setActiveSurvey(null);
    }
  };

  return (
    <aside className="w-[23%] min-w-[280px] h-full flex flex-col gap-3 select-none">
      <div className="panel-box rounded-xl p-3.5 flex flex-col gap-3.5 flex-1 overflow-y-auto">
        {/* Header Pill */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 font-display font-bold text-xs tracking-wider text-[#00F0FF]">
            1 • UPLOAD
          </span>
          <span className="text-slate-400 text-xs">Target Feed</span>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-3.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
            uploadedFile
              ? 'border-cyan-400 bg-cyan-950/20'
              : 'border-cyan-400/30 bg-[#070B14]/60 hover:border-cyan-400/70 hover:bg-[#070B14]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-[#00F0FF] mb-1.5 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5 text-[#00F0FF]" />
          </div>
          {uploadedFile ? (
            <div>
              <p className="font-semibold text-cyan-300 text-xs truncate max-w-[200px]">
                {uploadedFile.name}
              </p>
              <span className="text-[11px] text-slate-400">
                {(uploadedFile.size / 1024).toFixed(1)} KB • Ready to analyze
              </span>
            </div>
          ) : (
            <div>
              <p className="font-medium text-slate-200 text-xs leading-tight">
                Drop an underwater photo or video
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                JPG, PNG, WebP (TrashCan dataset)
              </span>
            </div>
          )}
          <button
            type="button"
            className="mt-2.5 px-3 py-1 rounded bg-[#0F172A] border border-[rgba(103,232,249,0.25)] text-slate-200 hover:text-white hover:border-cyan-400 text-xs font-medium transition-colors"
          >
            {uploadedFile ? 'Change file' : 'Browse files'}
          </button>
        </div>

        {/* Sample presets */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">
              Or select benchmark survey
            </span>
            <span className="text-slate-500 text-[10px] font-mono">MBARI frames</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {surveys.map((s) => {
              const isSelected = activeSurvey === s.id && !uploadedFile;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveSurvey(s.id);
                    setUploadedFile(null);
                  }}
                  className={`py-2 px-2 rounded text-xs font-mono transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                      : 'bg-[#070B14] hover:bg-slate-800 border-slate-700/80 hover:border-cyan-400/60 text-slate-300'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {s.frames} frames
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-[#070B14]/80 border border-[rgba(103,232,249,0.15)] rounded-lg p-3 flex flex-col gap-3">
          {/* Sensitivity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Detection sensitivity
              </span>
              <span className="font-mono text-[#00F0FF] font-semibold text-xs">
                {conf.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={conf}
              onChange={(e) => setConf(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.10 (High Recall)</span>
              <span>0.90 (High Precision)</span>
            </div>
          </div>

          {/* Colour correction toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Optical correction
              </span>
              <span className="text-[10px] text-slate-500">
                Red-channel attenuator & CLAHE
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={correct}
                onChange={(e) => setCorrect(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00F0FF]"></div>
            </label>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onRunDetection}
          className={`w-full py-2.5 px-4 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-[#00F0FF] text-[#070B14] shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_22px_rgba(0,240,255,0.65)] hover:brightness-110 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span>Analyzing Survey...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Detection</span>
            </>
          )}
        </button>

        {/* Informational citation note in sidebar */}
        <div className="mt-auto pt-3 border-t border-slate-800/70 text-[11px] text-slate-500 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Model:</span>
            <span className="font-mono text-slate-400">MBARI YOLOv8x</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Dataset:</span>
            <span className="font-mono text-slate-400">TrashCan 1.0 (UMN)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
