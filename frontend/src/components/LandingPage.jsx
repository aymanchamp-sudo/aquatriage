import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Radar, ArrowRight, ShieldCheck, Compass, Sliders, Play, Layers, Sparkles, Navigation } from 'lucide-react';

export default function LandingPage({ setView }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calculate live depth based on scroll progress: 2.0 m -> 48.5 m
  const depthValue = useTransform(scrollYProgress, [0, 1], [3.2, 48.5]);
  const [sliderPos, setSliderPos] = useState(50); // Before/After slider percentage
  const [depthText, setDepthText] = useState('3.2');

  React.useEffect(() => {
    return depthValue.onChange((v) => {
      setDepthText(v.toFixed(1));
    });
  }, [depthValue]);

  return (
    <div ref={containerRef} className="relative bg-[#070B14] text-[#E2E8F0] min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Floating CSS Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute w-3 h-3 rounded-full bg-cyan-400/40 bottom-[-20px] left-[15%] animate-bubble-1" style={{ animationDuration: '9s' }} />
        <div className="absolute w-5 h-5 rounded-full bg-cyan-300/30 bottom-[-30px] left-[35%] animate-bubble-2" style={{ animationDuration: '14s', animationDelay: '2s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-cyan-400/50 bottom-[-20px] left-[65%] animate-bubble-1" style={{ animationDuration: '11s', animationDelay: '4s' }} />
        <div className="absolute w-4 h-4 rounded-full bg-cyan-300/40 bottom-[-30px] left-[85%] animate-bubble-2" style={{ animationDuration: '16s', animationDelay: '1s' }} />
      </div>

      {/* Floating Bathymetric Depth HUD HUD (sticky) */}
      <div className="fixed top-20 right-6 z-40 bg-[#0F172A]/80 border border-cyan-400/30 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] text-slate-400 tracking-wider uppercase">Depth Telemetry</span>
          <span className="font-mono text-base font-bold text-[#00F0FF]">{depthText} m</span>
        </div>
        <div className="w-1.5 h-8 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
          <motion.div
            className="w-full bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]"
            style={{ height: useTransform(scrollYProgress, [0, 1], ['5%', '100%']) }}
          />
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 h-16 bg-[#070B14]/85 border-b border-[rgba(103,232,249,0.2)] px-6 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Radar className="w-5 h-5 text-[#00F0FF]" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-wider text-[#00F0FF]">
            AQUATRIAGE
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#0F172A] border border-cyan-400/30 text-[11px] font-mono text-slate-300">
            Demo data: simulated positions
          </span>
        </div>

        <button
          onClick={() => setView('dashboard')}
          className="px-4 py-2 rounded-lg bg-[#00F0FF] text-[#070B14] font-display font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
        >
          <span>Launch Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* ZONE 1: EPILAGIC HERO (Sunlight Zone 0 - 15m) */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 relative z-10 border-b border-slate-800/80">
        <div className="max-w-4xl flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono w-max">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
            <span>Zone 1: Epipelagic Ingestion • Depth 0 – 15m</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            70% of Ocean Plastic Sinks Beyond Satellite Reach.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-cyan-200 to-[#10B981]">
              We Map and Triage It.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed font-sans">
            AquaTriage ingests ROV and diver optical footage, corrects deep turbidity in real time, classifies seafloor debris using MBARI YOLOv8x weights, and plans the shortest cleanup route—saving up to{' '}
            <strong className="text-[#10B981] font-semibold">85% transit distance</strong> compared to a blind lawnmower sweep.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setView('dashboard')}
              className="px-6 py-3 rounded-lg bg-[#00F0FF] text-[#070B14] font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.45)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Open Command Center</span>
            </button>

            <div className="px-4 py-2.5 rounded-lg border border-[rgba(103,232,249,0.2)] bg-[#0F172A]/70 text-slate-300 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Detect → Map → Route Pipeline Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 2: MESOPELAGIC THE PROBLEM (Twilight Zone 15 - 30m) */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 relative z-10 border-b border-slate-800/80 bg-[#050912]/50">
        <div className="max-w-5xl flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-mono w-max">
            <span>Zone 2: Mesopelagic Telemetry • Depth 15 – 30m</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-snug">
                Underwater Cleanup Missions Are Constrained by Transit Time.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Standard seafloor sweeps deploy a naive serpentine grid pattern (&quot;lawnmower sweep&quot;), traveling thousands of meters across barren silt while batteries drain.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                AquaTriage solves the Traveling Salesperson Problem on the seafloor: detected debris items are projected onto a 2D coordinate grid and solved via 2-opt trajectory optimization to produce the minimal length dive plan.
              </p>
            </div>

            <div className="panel-box rounded-xl p-5 flex flex-col gap-4 bg-[#0F172A]/80 border-cyan-500/20">
              <h3 className="font-display font-bold text-base text-cyan-300">
                Lawnmower Sweep vs. AquaTriage Route
              </h3>
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="p-3 rounded bg-[#070B14] border border-red-500/30 flex justify-between items-center">
                  <div>
                    <div className="text-red-400 font-bold">Blind Lawnmower Sweep</div>
                    <div className="text-[11px] text-slate-400">Fixed serpentine coverage</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">3,030.6 m</div>
                    <div className="text-[10px] text-slate-500">Benchmark grid</div>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#070B14] border border-emerald-500/40 flex justify-between items-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <div>
                    <div className="text-emerald-400 font-bold">AquaTriage 2-Opt Route</div>
                    <div className="text-[11px] text-slate-400">Target-directed trajectory</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">466.6 m</div>
                    <div className="text-[10px] text-emerald-300 font-bold">84.6% distance saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 3: BATHYPELAGIC OPTICAL RESTORATION & YOLO (30 - 45m) */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 relative z-10 border-b border-slate-800/80">
        <div className="max-w-5xl flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono w-max">
            <span>Zone 3: Optical Restoration & Detection • Depth 30 – 45m</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Cutting Through Murky Water with Optical Balancing.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Underwater imagery suffers from heavy red-wavelength attenuation and turbidity. Slide below to compare raw ROV footage against our optical color-correction pipeline.
            </p>
          </div>

          {/* Interactive Before / After Comparison Slider */}
          <div className="relative w-full max-w-3xl aspect-[16/10] rounded-xl overflow-hidden border border-cyan-400/30 shadow-2xl bg-black select-none mx-auto">
            {/* After (Corrected) image */}
            <img
              src="/samples/frame0_corrected.jpg"
              alt="Optical colour corrected underwater frame"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/70 px-2.5 py-1 rounded text-[11px] font-mono text-cyan-300 border border-cyan-400/40">
              Optical Correction
            </div>

            {/* Before (Raw) clipped image */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src="/samples/frame0_raw.jpg"
                alt="Raw uncorrected underwater frame"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', minWidth: '100%' }}
              />
              <div className="absolute top-4 left-4 bg-black/70 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 border border-slate-600">
                Raw Diver Frame
              </div>
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF] cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-[#00F0FF] text-[#070B14] flex items-center justify-center font-bold text-[10px] shadow-lg">
                ↔
              </div>
            </div>

            {/* Hidden Range Input for full touch/drag support */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-[#0F172A]/70 border border-cyan-500/20">
              <span className="font-mono text-xs text-cyan-400 font-bold block mb-1">01 • RESTORE</span>
              <h4 className="font-display font-semibold text-sm text-slate-200">CLAHE & Red Attenuation</h4>
              <p className="text-slate-400 text-xs mt-1">Recovers lost red spectrums and sharpens silt-scattered contrast.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0F172A]/70 border border-cyan-500/20">
              <span className="font-mono text-xs text-cyan-400 font-bold block mb-1">02 • DETECT</span>
              <h4 className="font-display font-semibold text-sm text-slate-200">MBARI YOLOv8x Weights</h4>
              <p className="text-slate-400 text-xs mt-1">Pinpoints debris items and isolates marine wildlife as protected non-targets.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0F172A]/70 border border-cyan-500/20">
              <span className="font-mono text-xs text-cyan-400 font-bold block mb-1">03 • PLAN</span>
              <h4 className="font-display font-semibold text-sm text-slate-200">2-Opt Seafloor Route</h4>
              <p className="text-slate-400 text-xs mt-1">Generates waypoint navigation ordered for minimal ROV battery consumption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 4: ABYSSAL CALL TO ACTION (45m+) */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 relative z-10 text-center items-center">
        <div className="max-w-3xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-mono">
            <span>Zone 4: Abyssal Extraction • Mission Ready</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Deploy Autonomous Marine Extraction?
          </h2>

          <p className="text-slate-300 text-base max-w-xl leading-relaxed">
            Test detection on real MBARI and TrashCan benchmark frames or upload custom diver footage directly in the Command Center.
          </p>

          <button
            onClick={() => setView('dashboard')}
            className="px-8 py-3.5 rounded-xl bg-[#00F0FF] text-[#070B14] font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:shadow-[0_0_35px_rgba(0,240,255,0.8)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Command Center</span>
          </button>
        </div>

        {/* Dataset Citations Footer */}
        <footer className="mt-20 pt-6 border-t border-slate-800/80 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div>
            AquaTriage • Autonomous Underwater Debris Triage
          </div>
          <div>
            Sample frames: TrashCan 1.0 (UMN). Model: FathomNet/trash-detector (MBARI), CC-BY-4.0.
          </div>
        </footer>
      </section>
    </div>
  );
}
