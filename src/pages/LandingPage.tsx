
import Navbar from "@/components/landing-page/Navbar";
import Hero from "@/components/landing-page/Hero";
import ProblemSolution from "@/components/landing-page/ProblemSolution";
import HowItWorks from "@/components/landing-page/HowItWorks";
import Features from "@/components/landing-page/Features";
import DemoVideo from "@/components/landing-page/DemoVideo";
import LiveDemo from "@/components/landing-page/LiveDemo";
import Footer from "@/components/landing-page/Footer";
import GlobeBackground from "@/components/landing-page/GlobeBackground";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-sky-400 selection:text-slate-950">
            {/* Globe Background */}
            <GlobeBackground />

            {/* Page Content */}
            <div className="relative z-10">
                <Navbar />
                <main>
                    <Hero />
                    <ProblemSolution />
                    <HowItWorks />
                    <Features />
                    <DemoVideo />
                    <LiveDemo />
                </main>
                <Footer />
            </div>
        </div>
    );
}
