
import React from "react";
import { Plane, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-white/5 bg-slate-950">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <Plane className="w-6 h-6 text-sky-400" />
                    <span className="text-xl font-black text-white uppercase tracking-[0.2em] font-orbitron">Flymply</span>
                </div>

                <div className="text-center md:text-left">
                    <p className="text-slate-500 text-sm max-w-md font-inter font-light">
                        Flymply is a proof‑of‑concept project developed to demonstrate how AI can predict clear‑air turbulence. Not intended to replace certified systems.
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">
                    <div className="font-rajdhani font-bold">Built by Team Flymply | Hackathon Project</div>
                    <div className="flex items-center gap-4 mt-2 font-rajdhani font-bold">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                        <Github className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                    </div>
                </div>
            </div>

            <div className="text-center mt-12 text-[10px] text-slate-700">
                © 2026 Flymply — AI‑Based Clear‑Air Turbulence Prediction. All rights reserved.
            </div>
        </footer>
    );
}
