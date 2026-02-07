
import React from "react";
import { Link } from "react-router-dom";
import { Plane, Menu } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Plane className="w-8 h-8 text-sky-400" />
                    <span className="text-2xl font-black tracking-[0.2em] text-white uppercase font-orbitron">Flymply</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300 uppercase tracking-widest font-rajdhani">
                    <a href="#problem" className="hover:text-sky-400 transition-colors">The Problem</a>
                    <a href="#solution" className="hover:text-sky-400 transition-colors">Solution</a>
                    <a href="#howitworks" className="hover:text-sky-400 transition-colors">How It Works</a>
                    <Link to="/dashboard" className="hover:text-sky-400 transition-colors border border-sky-400/30 px-4 py-2 rounded-lg bg-sky-400/10 hover:bg-sky-400 text-slate-300 hover:text-slate-950 transition-all duration-300">Launch Demo</Link>
                </div>

                <button className="md:hidden text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
