
import React from "react";
import { motion } from "framer-motion";
import { Zap, Target, LayoutDashboard, BarChart } from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: <Zap className="w-6 h-6 text-sky-400" />,
            title: "Intelligent Cockpit Integration",
            desc: "Specialized EFB plugin providing pilots with a visual \"OneLayer\" view of turbulence intensity (EDR)."
        },
        {
            icon: <Target className="w-6 h-6 text-sky-400" />,
            title: "AI Voice Assistant",
            desc: "Hands-free alerts for pilots and calm, automated updates for passengers explaining expected bumps."
        },
        {
            icon: <LayoutDashboard className="w-6 h-6 text-sky-400" />,
            title: "Airline Operations Dashboard",
            desc: "Full-fleet visibility, live fleet maps, and deep-dive charts for route optimization."
        },
        {
            icon: <BarChart className="w-6 h-6 text-sky-400" />,
            title: "Interactive Reporting",
            desc: "Probability charts for 12hr forecasts and real-time stability metrics (Thermal vs Mechanical)."
        }
    ];

    return (
        <section className="py-24 px-6 bg-slate-900/30">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h2 className="text-4xl font-black text-white mb-6 uppercase font-orbitron tracking-tight leading-tight">Key Features</h2>
                        <p className="text-slate-400 leading-relaxed mb-8 font-inter font-light">
                            Flymply is designed to integrate seamlessly into existing aviation workflows while providing a leap forward in safety technology.
                        </p>
                        <div className="p-6 glass rounded-2xl border-l-4 border-l-sky-400">
                            <div className="text-white font-bold mb-2 uppercase text-xs tracking-widest font-rajdhani">Hardware-Free</div>
                            <p className="text-slate-400 text-sm italic font-inter font-light">Pure software solution utilizing existing aircraft communication protocols.</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass p-6 rounded-2xl hover:border-sky-400/50 transition-colors"
                            >
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest font-rajdhani">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-inter font-light">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
