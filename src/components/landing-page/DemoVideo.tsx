
import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function DemoVideo() {
    return (
        <section className="py-24 px-6 bg-slate-900/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-400/10 border border-sky-400/20 text-sky-400 text-[10px] font-bold mb-6 tracking-[0.3em] font-rajdhani uppercase">
                        Product Showcase
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase font-orbitron tracking-tight">Project Demo</h2>
                    <p className="text-slate-400 font-inter font-light max-w-2xl mx-auto">
                        Watch Flymply's AI-powered turbulence prediction engine in action, providing pilots with mission-critical early warnings.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative max-w-5xl mx-auto group"
                >
                    {/* Video Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <video
                            className="w-full h-full object-cover"
                            controls
                            poster="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                        >
                            <source src="/demo_video.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-6 -right-6 w-12 h-12 border-t-2 border-r-2 border-sky-400/30 rounded-tr-xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-12 h-12 border-b-2 border-l-2 border-sky-400/30 rounded-bl-xl"></div>
                </motion.div>
            </div>
        </section>
    );
}
