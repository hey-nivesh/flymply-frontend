import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { InputPanel } from '@/components/InputPanel';
import { RiskPanel } from '@/components/RiskPanel';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { AirplaneBackground } from '@/components/AirplaneBackground';
import { AironAssistant } from '@/components/AironAssistant';
import { useStreaming } from '@/hooks/useStreaming';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function DashboardPage() {
  const {
    state,
    featureInputs,
    setFeatureInputs,
    pushFrame,
    startStreaming,
    stopStreaming,
    clearBuffer,
    setWindowSize,
    setUpdateInterval,
    setInputMode,
    setBackendUrl,
    setDemoMode,
  } = useStreaming();

  const [mobileInputOpen, setMobileInputOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background aero-grid relative flex flex-col">
      {/* 3D Airplane Background */}
      <AirplaneBackground />
      
      {/* Subtle scanlines overlay */}
      <div className="scanlines opacity-20" />
      
      {/* Subtle vignette overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, hsl(220 30% 1% / 0.4) 100%)',
        }}
      />

      {/* Header */}
      <Header
        isConnected={state.isConnected}
        isStreaming={state.isStreaming}
        demoMode={state.demoMode}
        backendUrl={state.backendUrl}
        currentPrediction={state.currentPrediction}
        onBackendUrlChange={setBackendUrl}
        onDemoModeChange={setDemoMode}
      />

      {/* Main Content */}
      <main className="flex-1 container px-6 py-6 relative z-20">
        {/* Mobile Input Toggle */}
        <div className="lg:hidden mb-4">
          <Sheet open={mobileInputOpen} onOpenChange={setMobileInputOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full btn-tactical">
                <Menu className="h-4 w-4 mr-2" />
                Live Input Control
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 glass-panel border-r border-border/50 p-0">
              <div className="p-4 h-full overflow-y-auto">
                <InputPanel
                  featureInputs={featureInputs}
                  setFeatureInputs={setFeatureInputs}
                  buffer={state.buffer}
                  windowSize={state.windowSize}
                  updateInterval={state.updateInterval}
                  inputMode={state.inputMode}
                  isStreaming={state.isStreaming}
                  onWindowSizeChange={setWindowSize}
                  onUpdateIntervalChange={setUpdateInterval}
                  onInputModeChange={setInputMode}
                  onPushFrame={pushFrame}
                  onStartStreaming={startStreaming}
                  onStopStreaming={stopStreaming}
                  onClearBuffer={clearBuffer}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Input Control (Desktop) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block lg:col-span-3"
          >
            <InputPanel
              featureInputs={featureInputs}
              setFeatureInputs={setFeatureInputs}
              buffer={state.buffer}
              windowSize={state.windowSize}
              updateInterval={state.updateInterval}
              inputMode={state.inputMode}
              isStreaming={state.isStreaming}
              onWindowSizeChange={setWindowSize}
              onUpdateIntervalChange={setUpdateInterval}
              onInputModeChange={setInputMode}
              onPushFrame={pushFrame}
              onStartStreaming={startStreaming}
              onStopStreaming={stopStreaming}
              onClearBuffer={clearBuffer}
            />
          </motion.aside>

          {/* Center Panel - Risk Output */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <RiskPanel
              prediction={state.currentPrediction}
              isStreaming={state.isStreaming}
            />
            {/* Airon Voice Assistant */}
            <AironAssistant
              currentPrediction={state.currentPrediction}
              backendUrl={state.backendUrl}
            />
          </motion.section>

          {/* Right Panel - Telemetry */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <TelemetryPanel
              predictionHistory={state.predictionHistory}
            />
          </motion.aside>
        </div>
      </main>

      {/* Footer Status Bar */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-panel border-t border-white/10 z-30"
      >
        <div className="container px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Buffer: {state.buffer.length}/{state.windowSize}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:inline">
              Mode: {state.inputMode}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:inline">
              Interval: {state.updateInterval / 1000}s
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              {state.demoMode ? 'Demo Mode' : 'Live API'}
            </span>
            <motion.div
              className={`w-2 h-2 ${state.isStreaming ? 'bg-aero-lime' : 'bg-muted-foreground'}`}
              animate={state.isStreaming ? { opacity: [1, 0.4, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
