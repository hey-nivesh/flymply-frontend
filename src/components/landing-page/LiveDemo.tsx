
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, ShieldAlert, Activity } from "lucide-react";

export default function LiveDemo() {
    const [risk, setRisk] = useState(14.5);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate fluctuation between 12% and 18%
            const fluctuation = (Math.random() - 0.5) * 2; // -1 to +1
            setRisk((prev) => {
                const next = prev + fluctuation;
                return Math.min(Math.max(next, 12), 18);
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getRiskColor = (val: number) => {
        if (val < 14) return "text-emerald-400";
        if (val < 16) return "text-amber-400";
        return "text-rose-400";
    };

    const getRiskBg = (val: number) => {
        if (val < 14) return "bg-emerald-400/20";
        if (val < 16) return "bg-amber-400/20";
        return "bg-rose-400/20";
    };

    const getRiskLevel = (val: number) => {
        if (val < 14) return "Low";
        if (val < 16) return "Moderate";
        return "High";
    };

    return (
        <section id="demo" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black text-white mb-4 uppercase font-orbitron tracking-tight">See Flymply in Action</h2>
                    <p className="text-slate-400 text-lg font-inter font-light">
                        Experience how Flymply continuously updates turbulence risk in real time.
                    </p>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    {/* Main Gauge Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass p-12 rounded-3xl relative w-full max-w-md aspect-square flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${getRiskBg(risk)}`} />

                        {/* Radar Lines */}
                        <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />

                        <div className="relative z-10 text-center">
                            <motion.div
                                className={`text-7xl font-mono font-bold tracking-tighter mb-2 transition-colors duration-1000 ${getRiskColor(risk)}`}
                            >
                                {risk.toFixed(1)}%
                            </motion.div>
                            <div className="text-slate-300 font-bold tracking-[0.2em] uppercase text-[10px] mb-6 font-rajdhani">
                                Turbulence Risk Probability
                            </div>

                            <div className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors duration-1000 font-rajdhani ${getRiskColor(risk)} ${getRiskBg(risk)}`}>
                                <ShieldAlert className="w-4 h-4" />
                                {getRiskLevel(risk)} Risk State
                            </div>
                        </div>

                        {/* Simulated Data Feed Decoration */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
                                LIVE STREAMING DATA
                            </div>
                            <div>STATION_ID: FLP-X92</div>
                        </div>
                    </motion.div>

                    {/* Context Info */}
                    <div className="flex-1 space-y-6">
                        <div className="glass p-6 rounded-2xl flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-lg bg-sky-400/20 flex items-center justify-center shrink-0">
                                <Wind className="w-6 h-6 text-sky-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 uppercase text-xs tracking-widest font-rajdhani">Multi-Type Detection</h3>
                                <p className="text-slate-400 text-sm font-inter">Identifying Mechanical, Thermal, and Wave-Induced turbulence patterns.</p>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-2xl flex gap-4 items-start border-l-4 border-l-sky-400">
                            <div className="w-10 h-10 rounded-lg bg-emerald-400/20 flex items-center justify-center shrink-0">
                                <Activity className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 uppercase text-xs tracking-widest font-rajdhani">Actionable Alerts</h3>
                                <p className="text-slate-400 text-sm font-inter">Instantaneous updates for flight crew and operations centers.</p>
                            </div>
                        </div>

                        <Link
                            to="/dashboard"
                            className="block w-full text-center py-4 bg-sky-400 hover:bg-sky-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-sky-400/20 transform hover:-translate-y-1 uppercase tracking-widest text-xs font-rajdhani"
                        >
                            Launch Full Demo Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
