
import React from "react";
import { motion } from "framer-motion";
import { Zap, Target, Palette, LayoutDashboard, CloudRain } from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: <Zap className="w-6 h-6 text-sky-400" />,
            title: "Real‑time Prediction",
            desc: "Live processing of atmospheric data for instantaneous risk assessment."
        },
        {
            icon: <Target className="w-6 h-6 text-sky-400" />,
            title: "Percentage‑Based Output",
            desc: "Clear, quantified probability scores instead of vague advisories."
        },
        {
            icon: <Palette className="w-6 h-6 text-sky-400" />,
            title: "Color‑Coded Levels",
            desc: "Intuitive Green/Amber/Red visual hierarchy for immediate awareness."
        },
        {
            icon: <LayoutDashboard className="w-6 h-6 text-sky-400" />,
            title: "Intuitive Dashboard",
            desc: "Streamlined interface designed for the high-stress cockpit environment."
        },
        {
            icon: <CloudRain className="w-6 h-6 text-sky-400" />,
            title: "Uses Existing Data",
            desc: "No expensive hardware upgrades needed; works with standard weather feeds."
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
