import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Radar, ArrowRight, ShieldCheck, Compass, Sliders, Play, Layers,
  Sparkles, Navigation, ChevronDown, CheckCircle2, AlertTriangle,
  Waves, Activity, Cpu, Eye, Gauge, Crosshair
} from 'lucide-react';

export default function LandingPage({ setView }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calculate live depth based on scroll progress: 3.2 m -> 48.5 m
  const depthValue = useTransform(scrollYProgress, [0, 1], [3.2, 48.5]);
  const [sliderPos, setSliderPos] = useState(50); // Before/After slider percentage
  const [depthText, setDepthText] = useState('3.2');
  const [pressureText, setPressureText] = useState('1.32');

  useEffect(() => {
    return depthValue.on('change', (v) => {
      setDepthText(v.toFixed(1));
      setPressureText((1.0 + v / 10).toFixed(2));
    });
  }, [depthValue]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-[#070B14] text-[#E2E8F0] min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans"
    >
      {/* =========================================================================
          AMBIENT DEEP-OCEAN BACKGROUND ATMOSPHERE & LIGHT ORBS
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft volumetric top-cyan aura */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-cyan-500/15 via-teal-500/8 to-transparent rounded-full blur-[130px] opacity-75" />

        {/* Ambient mid-ocean twilight glow */}
        <div className="absolute top-[35%] -left-36 w-[600px] h-[600px] bg-gradient-to-tr from-sky-600/10 via-cyan-900/15 to-transparent rounded-full blur-[140px] opacity-60" />

        {/* Benthic emerald/teal depth aura */}
        <div className="absolute top-[65%] -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-emerald-500/10 via-cyan-800/12 to-transparent rounded-full blur-[150px] opacity-65" />

        {/* Abyssal bottom luminous core */}
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-t from-cyan-500/12 via-teal-600/6 to-transparent rounded-full blur-[140px] opacity-70" />

        {/* Floating Ambient Microbubbles with realistic radial specular reflections */}
        <div className="bubble w-2 h-2 left-[12%] bottom-0" style={{ animationDuration: '9s', animationDelay: '0.4s' }} />
        <div className="bubble w-3.5 h-3.5 left-[24%] bottom-0" style={{ animationDuration: '13s', animationDelay: '2.5s' }} />
        <div className="bubble w-1.5 h-1.5 left-[42%] bottom-0" style={{ animationDuration: '8s', animationDelay: '1.2s' }} />
        <div className="bubble w-3 h-3 left-[58%] bottom-0" style={{ animationDuration: '11s', animationDelay: '3.7s' }} />
        <div className="bubble w-2.5 h-2.5 left-[75%] bottom-0" style={{ animationDuration: '14s', animationDelay: '0.8s' }} />
        <div className="bubble w-4 h-4 left-[88%] bottom-0" style={{ animationDuration: '16s', animationDelay: '4.2s' }} />
      </div>

      {/* =========================================================================
          DYNAMIC BATHYMETRIC DEPTH & PRESSURE GAUGE HUD (STITCH PROTOTYPE)
          ========================================================================= */}
      <aside
        aria-label="Bathymetric Telemetry Tracker"
        className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-end select-none"
      >
        {/* Floating live depth badge */}
        <div className="mb-2.5 glass-card-subtle px-3 py-1.5 rounded-xl shadow-[0_0_18px_rgba(0,240,255,0.25)] flex items-center gap-2 border border-cyan-400/40">
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          <span className="font-mono text-xs font-bold text-white tracking-wide">{depthText} m</span>
          <span className="text-cyan-500/50 font-mono text-[10px]">|</span>
          <span className="font-mono text-[11px] font-semibold text-cyan-300">{pressureText} ATA</span>
        </div>

        {/* Vertical Gauge Body */}
        <div className="w-20 md:w-22 rounded-2xl glass-gauge p-3 shadow-[0_16px_40px_rgba(0,0,0,0.75)] flex flex-col items-center">
          <div className="w-full text-center pb-2 mb-2 border-b border-cyan-500/20">
            <span className="block font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider">DEPTH</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE ROV
            </span>
          </div>

          {/* Vertical Track Rail */}
          <div
            className="relative w-2.5 h-48 md:h-56 rounded-full bg-slate-900/90 border border-cyan-500/30 overflow-hidden my-1 flex flex-col justify-end"
          >
            <motion.div
              className="w-full bg-gradient-to-t from-emerald-400 via-cyan-400 to-sky-300 rounded-full shadow-[0_0_10px_#00F0FF]"
              style={{ height: useTransform(scrollYProgress, [0, 1], ['5%', '100%']) }}
            />
          </div>

          {/* Depth Quick Station Jumps */}
          <div className="w-full flex flex-col gap-2 pt-2.5 text-center font-mono text-[10px]">
            <button
              onClick={() => scrollToSection('sec-surface')}
              className="text-cyan-200 hover:text-white transition-colors flex justify-between px-1"
            >
              <span>0m</span>
              <span className="text-slate-400">SURF</span>
            </button>
            <button
              onClick={() => scrollToSection('sec-problem')}
              className="text-sky-300 hover:text-white transition-colors flex justify-between px-1"
            >
              <span>15m</span>
              <span className="text-slate-400">TWIL</span>
            </button>
            <button
              onClick={() => scrollToSection('sec-optical')}
              className="text-indigo-300 hover:text-white transition-colors flex justify-between px-1"
            >
              <span>30m</span>
              <span className="text-slate-400">BATH</span>
            </button>
            <button
              onClick={() => scrollToSection('sec-abyssal')}
              className="text-emerald-300 hover:text-white transition-colors flex justify-between px-1"
            >
              <span>48m</span>
              <span className="text-slate-400">BENTH</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          PERSISTENT TOP GLASSMORPHIC NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 h-16 glass-nav px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Radar className="w-5 h-5 text-[#00F0FF]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                AQUATRIAGE
              </span>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0A1628]/90 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                ROV-AI
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider hidden sm:block">
              BATHYMETRIC MISSION ENGINE
            </span>
          </div>
        </div>

        {/* Jump Station Links */}
        <nav className="hidden lg:flex items-center gap-1.5 glass-card-subtle px-2 py-1 rounded-full border border-cyan-500/25">
          <button
            onClick={() => scrollToSection('sec-surface')}
            className="px-3.5 py-1 rounded-full font-mono text-xs font-semibold text-cyan-200 hover:text-white hover:bg-cyan-500/20 transition-all"
          >
            0m Surface
          </button>
          <button
            onClick={() => scrollToSection('sec-problem')}
            className="px-3.5 py-1 rounded-full font-mono text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            15m Problem
          </button>
          <button
            onClick={() => scrollToSection('sec-optical')}
            className="px-3.5 py-1 rounded-full font-mono text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            30m Dehazing & AI
          </button>
          <button
            onClick={() => scrollToSection('sec-abyssal')}
            className="px-3.5 py-1 rounded-full font-mono text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 transition-all"
          >
            48m Seafloor TSP
          </button>
        </nav>

        {/* Right CTA & System Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 glass-card-subtle px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-300">
              STATUS: <span className="text-emerald-300 font-semibold">ROV-01 READY</span>
            </span>
          </div>

          <button
            onClick={() => setView('dashboard')}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.45)] hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.7)] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          ZONE 1 — 0.0m SURFACE ZONE (HERO CINEMATIC WITH GLASSMORPHISM)
          ========================================================================= */}
      <section
        id="sec-surface"
        className="min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 py-16 relative z-10 border-b border-cyan-950/40"
      >
        {/* Volumetric light ray caustic overlay inspired by Stitch prototype */}
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen overflow-hidden">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 900">
            <defs>
              <radialGradient cx="50%" cy="5%" id="heroLightRadial" r="80%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="45%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#070B14" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="heroRayA" x1="40%" x2="60%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#7df4ff" stopOpacity="0.35" />
                <stop offset="75%" stopColor="#070B14" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="heroRayB" x1="68%" x2="78%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="80%" stopColor="#070B14" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect fill="url(#heroLightRadial)" height="900" width="1440" />
            <polygon fill="url(#heroRayA)" points="480,0 620,0 840,900 640,900" />
            <polygon fill="url(#heroRayB)" points="920,0 1080,0 1200,900 980,900" />
          </svg>
        </div>

        {/* Hero Core Content */}
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Telemetry pill badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card-subtle border border-cyan-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_10px_#22d3ee]" />
            <span className="font-mono text-xs font-semibold text-cyan-200 tracking-wider uppercase">
              OPEN-SOURCE SEACLEAR AI + ROV BATHYMETRY
            </span>
          </div>

          {/* Punchy Hero Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.14] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
            70% of Ocean Plastic Sinks Beyond Satellite Reach.{' '}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-400 drop-shadow-[0_0_24px_rgba(0,240,255,0.4)]">
              We Map and Triage It.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="font-sans text-base sm:text-lg text-slate-200 max-w-2xl mt-6 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            AquaTriage pairs low-cost micro-ROVs with real-time optical dehazing and MBARI YOLOv8x models to locate submerged marine debris, assign salvage priority, and plan the shortest cleanup route—saving over{' '}
            <strong className="text-emerald-300 font-semibold">84% transit distance</strong> compared to a blind lawnmower sweep.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setView('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 text-slate-950 font-display text-sm uppercase font-bold shadow-[0_0_25px_rgba(34,211,238,0.55)] hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.75)] active:scale-95 transition-all"
            >
              <Radar className="w-4 h-4" />
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('sec-problem')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-btn-secondary text-cyan-200 font-mono text-xs uppercase font-semibold tracking-wider hover:text-white"
            >
              <ChevronDown className="w-4 h-4 text-cyan-300 animate-bounce" />
              <span>Scroll to Dive (0m → 48m)</span>
            </button>
          </div>

          {/* Streamlined 3-Metric Glass Stat Bar (Stitch Prototype) */}
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 p-3 sm:p-4 rounded-2xl glass-panel">
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl glass-card-subtle">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-cyan-300">89.4%</span>
              <span className="font-mono text-xs text-slate-200 font-medium mt-1">YOLOv8x mAP@50 Detection</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl glass-card-subtle">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400">-84.6%</span>
              <span className="font-mono text-xs text-slate-200 font-medium mt-1">ROV Transit Distance Saved</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl glass-card-subtle">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-sky-200">2-Opt TSP</span>
              <span className="font-mono text-xs text-slate-200 font-medium mt-1">Shortest Benthic Cleanup Path</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ZONE 2 — 15.0m MESOPELAGIC TWILIGHT (THE PROBLEM & TSP COMPARISON)
          ========================================================================= */}
      <section
        id="sec-problem"
        className="min-h-[88vh] py-20 relative px-4 sm:px-6 lg:px-12 flex flex-col justify-center border-b border-cyan-950/40 bg-gradient-to-b from-[#081423] via-[#06111f] to-[#050c18]"
      >
        <div className="max-w-5xl mx-auto w-full relative z-10">
          {/* Depth Ribbon */}
          <div className="flex items-center gap-3 mb-8">
            <span className="px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-200 font-mono text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              DEPTH: 15.0m // ZONE: MESOPELAGIC TWILIGHT // PRESSURE: 2.50 ATA
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-rose-500/40 via-slate-800 to-transparent" />
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Problem Formulation */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-rose-300">
                <Gauge className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-widest font-bold">THE BOTTLENECK</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
                Underwater Cleanup Missions Are Constrained by Battery and Air.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Standard seafloor sweeps deploy a naive serpentine grid pattern (&quot;lawnmower sweep&quot;), traveling thousands of meters across barren silt while ROV batteries drain and diver tank gas exhausts.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                AquaTriage solves the Traveling Salesperson Problem on the seafloor: detected debris items are projected onto a calibrated 2D coordinate grid and solved via 2-opt trajectory optimization to produce the minimal-energy dive plan.
              </p>

              {/* 3 Metric Callout Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl glass-card-subtle border-rose-500/40 flex flex-col shadow-md">
                  <span className="font-display text-2xl font-extrabold text-rose-300">68%</span>
                  <span className="font-display text-xs font-semibold text-white mt-0.5">Air &amp; Power Lost</span>
                  <span className="font-mono text-[10px] text-slate-300 mt-1">In blind sweeps.</span>
                </div>
                <div className="p-3.5 rounded-xl glass-card-subtle border-amber-500/40 flex flex-col shadow-md">
                  <span className="font-display text-2xl font-extrabold text-amber-200">&lt;1.8m</span>
                  <span className="font-display text-xs font-semibold text-white mt-0.5">Visibility</span>
                  <span className="font-mono text-[10px] text-slate-300 mt-1">Silt blocks cameras.</span>
                </div>
                <div className="p-3.5 rounded-xl glass-card-subtle border-emerald-500/40 flex flex-col shadow-md">
                  <span className="font-display text-2xl font-extrabold text-emerald-300">5.8x</span>
                  <span className="font-display text-xs font-semibold text-white mt-0.5">Target Speed</span>
                  <span className="font-mono text-[10px] text-slate-300 mt-1">Via direct waypoints.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Glassmorphic Comparison Card */}
            <div className="lg:col-span-6">
              <div className="w-full rounded-2xl glass-panel p-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs text-cyan-200 uppercase font-bold tracking-wider">
                      Path Optimization Benchmark
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-mono text-[11px] font-bold">
                    SURVEY-01
                  </span>
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  {/* Lawnmower card */}
                  <div className="p-4 rounded-xl glass-card-subtle border-rose-500/40 flex justify-between items-center">
                    <div>
                      <div className="text-rose-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        Blind Lawnmower Sweep
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Fixed serpentine 60m lanes</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-rose-300">3,030.6 m</div>
                      <div className="text-[10px] text-slate-400">Standard sweep</div>
                    </div>
                  </div>

                  {/* AquaTriage 2-opt route card */}
                  <div className="p-4 rounded-xl glass-card-subtle border-emerald-400/50 flex justify-between items-center shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                    <div>
                      <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AquaTriage 2-Opt Route
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Target-directed trajectory</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-300">466.6 m</div>
                      <div className="text-[11px] text-emerald-300 font-bold">84.6% distance saved</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between font-mono text-xs text-slate-300">
                  <span>START BUOY: <strong className="text-white">(40, 40)</strong></span>
                  <span className="text-cyan-300 font-semibold">5 DEBRIS PINS LOCATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ZONE 3 — 30.0m BATHYPELAGIC OPTICAL RESTORATION & YOLO DETECTION
          ========================================================================= */}
      <section
        id="sec-optical"
        className="min-h-[88vh] py-20 relative px-4 sm:px-6 lg:px-12 flex flex-col justify-center border-b border-cyan-950/40 bg-gradient-to-b from-[#050c18] via-[#030812] to-[#02050c]"
      >
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 relative z-10">
          {/* Depth Ribbon */}
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 font-mono text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 shadow-sm">
              <Eye className="w-4 h-4 text-cyan-300" />
              DEPTH: 30.0m // ZONE: TURBID BATHYAL // OPTICAL RESTORATION &amp; YOLOV8
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 via-slate-800 to-transparent" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Cutting Through Murky Harbor Water with Optical CLAHE.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Underwater video frames suffer from heavy red-wavelength attenuation and silt backscattering. Drag the interactive slider below to see how our optical pipeline recovers color contrast before passing frames to the MBARI YOLOv8x detector.
            </p>
          </div>

          {/* Interactive Before / After Comparison Slider inside Glass Frame */}
          <div className="glass-panel p-3 sm:p-4 rounded-2xl max-w-3xl w-full mx-auto relative overflow-hidden shadow-2xl">
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-cyan-400/40 shadow-inner bg-black select-none">
              <div className="scan-beam" />

              {/* After (Corrected) image */}
              <img
                src="/samples/frame0_corrected.jpg"
                alt="Optical colour corrected underwater frame"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 glass-card-subtle px-3 py-1 rounded-lg text-xs font-mono text-cyan-200 border border-cyan-400/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Optical CLAHE Restored
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
                <div className="absolute top-4 left-4 glass-card-subtle px-3 py-1 rounded-lg text-xs font-mono text-rose-200 border border-rose-500/50 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Raw Turbid ROV Frame
                </div>
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-300 shadow-[0_0_14px_#00F0FF] cursor-ew-resize flex items-center justify-center z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-cyan-300 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_12px_#00F0FF]">
                  ↔
                </div>
              </div>

              {/* Touch & mouse drag input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                aria-label="Dehazing slider before after"
              />
            </div>
          </div>

          {/* 3-Phase Horizontal Architecture Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-cyan-300 font-bold block mb-1">PHASE 01 • RESTORE</span>
                <h4 className="font-display font-bold text-base text-white">CLAHE &amp; Red Boost</h4>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  Compensates for severe 480nm red attenuation, balances white points with Gray-World, and sharpens turbidity gradients.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/20 text-[11px] font-mono text-cyan-200 flex justify-between">
                <span>LATENCY:</span>
                <span className="font-semibold text-emerald-300">~12ms / FRAME</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-cyan-300 font-bold block mb-1">PHASE 02 • DETECT</span>
                <h4 className="font-display font-bold text-base text-white">MBARI YOLOv8x Inference</h4>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  Pinpoints derelict trash on the seabed while strictly filtering ROV equipment and cataloging marine wildlife as non-targets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/20 text-[11px] font-mono text-cyan-200 flex justify-between">
                <span>MODEL CONF:</span>
                <span className="font-semibold text-emerald-300">CONF &ge; 0.40</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-cyan-300 font-bold block mb-1">PHASE 03 • PLAN</span>
                <h4 className="font-display font-bold text-base text-white">2-Opt Seafloor Route</h4>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  Transforms 2D projected seabed pins into a prioritized Traveling Salesperson tour, minimizing vehicle battery expenditure.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/20 text-[11px] font-mono text-cyan-200 flex justify-between">
                <span>ALGORITHM:</span>
                <span className="font-semibold text-emerald-300">NN + 2-OPT TSP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ZONE 4 — 48.0m BENTHIC SEAFLOOR (ABYSSAL CALL TO ACTION)
          ========================================================================= */}
      <section
        id="sec-abyssal"
        className="min-h-[85vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-20 relative z-10 text-center items-center bg-gradient-to-b from-[#02050c] to-[#010308]"
      >
        <div className="max-w-3xl flex flex-col items-center gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono">
            <Navigation className="w-3.5 h-3.5" />
            <span>Zone 4: Benthic Seafloor • Mission Deployment Ready</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to Deploy Autonomous Marine Extraction?
          </h2>

          <p className="text-slate-300 text-base max-w-xl leading-relaxed">
            Test detection on real MBARI and TrashCan benchmark frames or upload custom diver footage directly in the interactive Command Center.
          </p>

          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full mt-2 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CORS &amp; Offline Fallback Ready</span>
              <span className="text-cyan-500">|</span>
              <span className="text-cyan-300">3 Surveys Pre-Loaded</span>
            </div>

            <button
              onClick={() => setView('dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(34,211,238,0.55)] hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.85)] active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Command Center</span>
            </button>
          </div>
        </div>

        {/* Dataset Citations Footer */}
        <footer className="mt-20 pt-6 border-t border-cyan-900/30 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
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
