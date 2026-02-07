
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Play, Activity } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sky-400 text-[10px] font-bold mb-6 tracking-[0.3em] font-rajdhani">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        NEXT-GEN AVIATION TECH
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 uppercase tracking-tight font-orbitron">
                        Predicting <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Clear‑Air Turbulence</span> Before It Happens
                    </h1>

                    <p className="text-xl text-slate-400 max-w-lg mb-10 leading-relaxed font-inter font-light">
                        An AI‑based early warning system that predicts the probability of clear‑air turbulence using real‑time weather data, helping pilots make safer decisions.
                    </p>

                    <div className="flex flex-wrap gap-4 uppercase tracking-widest text-xs font-bold font-rajdhani">
                        <Link
                            to="/dashboard"
                            className="px-8 py-4 bg-sky-400 hover:bg-sky-500 text-slate-950 rounded-lg transition-all shadow-lg shadow-sky-400/20 flex items-center gap-2"
                        >
                            View Live Demo
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                        <a href="#howitworks" className="px-8 py-4 glass text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
                            How It Works
                            <Play className="w-4 h-4 fill-white" />
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative hidden md:block w-full aspect-square"
                >
                    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    {/* 3D Model Viewer */}
                    <div className="w-full h-full relative z-0">
                        <style>{`
                            model-viewer {
                                width: 100%;
                                height: 100%;
                                background-color: transparent;
                                --poster-color: transparent;
                            }
                        `}</style>
                        {/* @ts-ignore */}
                        <model-viewer
                            src="https://raw.githubusercontent.com/Ysurac/FlightAirMap-3dmodels/master/a320/glTF2/A320.glb"
                            ios-src=""
                            alt="A 3D model of an aeroplane"
                            shadow-intensity="1"
                            camera-controls
                            auto-rotate
                            rotation-per-second="30deg"
                            camera-orbit="45deg 75deg 105%"
                            field-of-view="30deg"
                            exposure="1.2"
                            environment-image="neutral"
                            interaction-prompt="none"
                            loading="eager"
                        >
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <Activity className="w-12 h-12 text-sky-400 animate-pulse" />
                            </div>
                        </model-viewer>
                    </div>

                    {/* Mock UI Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                        <div className="glass-dark p-4 rounded-xl border border-sky-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-sky-400">ACTIVE_3D_TELEMETRY</span>
                                <Activity className="w-4 h-4 text-sky-400" />
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 2, delay: 1 }}
                                    className="bg-sky-400 h-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 border border-sky-400/20 rounded-full animate-pulse-slow" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 border border-sky-400/10 rounded-full" />
                </motion.div>
            </div>
        </section>
    );
}

// Minimal Activity icon for the mock UI - Renamed to ActivityIcon to avoid conflict if Activity is imported, but Activity is imported from lucide-react. Wait, the original code had a custom Activity function at bottom.
// But Lucide React also exports Activity. I should check if the original used Lucide React Activity or custom.
// Original: import { ChevronRight, Play } from "lucide-react"; and function Activity({ className })...
// So I should rename the local one or use Lucide. Actually, Lucide Activity is probably fine.
// The custom one: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> vs Lucide.
// I'll stick to Lucide Activity for consistency if possible, or define the custom one as PulseIcon.
