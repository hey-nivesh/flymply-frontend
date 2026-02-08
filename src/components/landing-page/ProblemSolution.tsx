
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, ShieldCheck } from "lucide-react";

export default function ProblemSolution() {
    return (
        <>
            {/* Problem Section */}
            <section id="problem" className="py-24 px-6 bg-slate-900/50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 text-rose-400 font-bold mb-4 uppercase text-[10px] tracking-[0.3em] font-rajdhani">
                            <AlertTriangle className="w-5 h-5" />
                            THE CHALLENGE
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight font-orbitron leading-tight">The Problem with Atmospheric Instability</h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-inter font-light">
                            Turbulence is unpredictable and often invisible to radar. Whether caused by clear‑air, mechanical friction, or thermal rising,
                            it poses significant risks. In most cases, pilots are informed only after turbulence has already been encountered,
                            leaving little time to respond.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            { label: "Invisible", desc: "No radar signature" },
                            { label: "Short Notice", desc: "Seconds to react" },
                            { label: "Injuries", desc: "Risk to crew/passengers" },
                            { label: "Structural", desc: "Wear and tear on airframe" }
                        ].map((item, idx) => (
                            <div key={idx} className="glass p-6 rounded-2xl border-l-4 border-l-rose-500/50">
                                <div className="text-white font-bold mb-1 uppercase text-xs tracking-widest font-rajdhani">{item.label}</div>
                                <div className="text-slate-400 text-sm font-inter">{item.desc}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="solution" className="py-24 px-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="order-2 md:order-1"
                    >
                        <div className="glass p-8 rounded-3xl border-sky-500/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors" />
                            <ShieldCheck className="w-16 h-16 text-sky-400 mb-6 relative z-10" />
                            <h3 className="text-xl font-bold text-white mb-4 relative z-10 uppercase tracking-widest font-rajdhani">AI-Powered Awareness</h3>
                            <p className="text-slate-400 relative z-10 text-sm font-inter">
                                Flymply leverages neural networks trained on petabytes of atmospheric data to identify the precursors of turbulence with high precision.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="order-1 md:order-2"
                    >
                        <div className="inline-flex items-center gap-2 text-sky-400 font-bold mb-4 uppercase text-[10px] tracking-[0.3em] font-rajdhani">
                            <Lightbulb className="w-5 h-5" />
                            OUR SOLUTION
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight font-orbitron leading-tight">Comprehensive Turbulence Awareness</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6 font-inter font-light">
                            Flymply provides a 360-degree, AI-driven prediction model that analyzes and anticipates all three major forms of atmospheric instability:
                            <span className="block mt-4 pl-4 border-l-2 border-sky-400/30">
                                <strong className="text-sky-400">Mechanical Turbulence:</strong> Real-time monitoring of wind shear and surface friction.<br />
                                <strong className="text-sky-400">Thermal Turbulence:</strong> Predictive modeling of convective buoyancy.<br />
                                <strong className="text-sky-400">Wave-Induced Turbulence:</strong> Early warning for mountain waves.
                            </span>
                        </p>
                        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                            Note: Flymply is a decision‑support system and does not control the aircraft.
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
