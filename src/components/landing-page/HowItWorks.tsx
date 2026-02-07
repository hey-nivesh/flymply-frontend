
import React from "react";
import { motion } from "framer-motion";
import { Database, Cpu, BarChart, Layout } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            icon: <Database className="w-6 h-6" />,
            title: "Data Collection",
            desc: "Continuously collects real‑time weather data from global sensors."
        },
        {
            icon: <Cpu className="w-6 h-6" />,
            title: "Atmospheric Analysis",
            desc: "Processes key atmospheric indicators including pressure and wind shear."
        },
        {
            icon: <BarChart className="w-6 h-6" />,
            title: "AI Risk Estimation",
            desc: "Uses proprietary AI models to estimate the probability of turbulence."
        },
        {
            icon: <Layout className="w-6 h-6" />,
            title: "Visual Dashboard",
            desc: "Displays the risk as a live percentage on a mission-critical dashboard."
        }
    ];

    return (
        <section id="howitworks" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-white mb-4 uppercase font-orbitron tracking-tight">How It Works</h2>
                    <p className="text-slate-400 font-inter font-light">A simple flow that turns complex data into clear insights.</p>
                </div>

                <div className="relative">
                    {/* Connector Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-sky-500/20 hidden md:block -translate-y-1/2" />

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative z-10 text-center group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-sky-400 group-hover:text-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-500">
                                    {step.icon}
                                </div>
                                <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest font-rajdhani">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-inter font-light px-4">{step.desc}</p>

                                {/* Step Number Badge */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-400 text-slate-950 text-[10px] font-black font-mono">
                                    0{idx + 1}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
