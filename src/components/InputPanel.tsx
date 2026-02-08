import { motion } from 'framer-motion';
import {
  Gauge,
  Play,
  Square,
  Plus,
  Trash2,
  Radio,
  Database,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeatureInputs, InputMode } from '@/hooks/useStreaming';

interface InputPanelProps {
  featureInputs: FeatureInputs;
  setFeatureInputs: (inputs: FeatureInputs) => void;
  buffer: number[][];
  windowSize: number;
  updateInterval: number;
  inputMode: InputMode;
  isStreaming: boolean;
  onWindowSizeChange: (size: number) => void;
  onUpdateIntervalChange: (interval: number) => void;
  onInputModeChange: (mode: InputMode) => void;
  onPushFrame: () => void;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  onClearBuffer: () => void;
}

const featureLabels: Record<keyof FeatureInputs, { label: string; unit: string; min: number; max: number }> = {
  altitude: { label: 'Altitude', unit: 'ft', min: 0, max: 50000 },
  velocity: { label: 'Velocity', unit: 'kts', min: 0, max: 700 },
  vertical_rate: { label: 'Vert Rate', unit: 'fpm', min: -5000, max: 5000 },
  u_wind: { label: 'U Wind', unit: 'm/s', min: -100, max: 100 },
  v_wind: { label: 'V Wind', unit: 'm/s', min: -100, max: 100 },
  temperature: { label: 'Temp', unit: '°C', min: -80, max: 50 },
};

export function InputPanel({
  featureInputs,
  setFeatureInputs,
  buffer,
  windowSize,
  updateInterval,
  inputMode,
  isStreaming,
  onWindowSizeChange,
  onUpdateIntervalChange,
  onInputModeChange,
  onPushFrame,
  onStartStreaming,
  onStopStreaming,
  onClearBuffer,
}: InputPanelProps) {
  const bufferProgress = (buffer.length / windowSize) * 100;

  const handleFeatureChange = (key: keyof FeatureInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFeatureInputs({ ...featureInputs, [key]: numValue });
  };

  const getModeIcon = (mode: InputMode) => {
    switch (mode) {
      case 'manual': return <Gauge className="h-4 w-4" />;
      case 'simulation': return <Radio className="h-4 w-4" />;
      case 'csv': return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass p-5 border border-white/10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {/* Panel Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
        <Database className="h-5 w-5 text-foreground" />
        <h3 className="font-orbitron text-sm font-semibold tracking-wider uppercase text-foreground">
          Live Input Control
        </h3>
      </div>

      {/* Input Mode Selector */}
      <div className="space-y-3 mb-8">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Input Mode
        </Label>
        <Select value={inputMode} onValueChange={(v) => onInputModeChange(v as InputMode)}>
          <SelectTrigger className="glass-panel border border-white/10 font-mono text-xs h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-panel border border-white/10">
            <SelectItem value="manual" className="font-mono text-xs">
              <div className="flex items-center gap-2">
                <Gauge className="h-3 w-3" /> Manual Entry
              </div>
            </SelectItem>
            <SelectItem value="simulation" className="font-mono text-xs">
              <div className="flex items-center gap-2">
                <Radio className="h-3 w-3" /> Simulation
              </div>
            </SelectItem>
            <SelectItem value="csv" className="font-mono text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" /> CSV Replay
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Window Size */}
      <div className="space-y-3 mb-8">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Window Size
          </Label>
          <span className="font-mono text-xs text-foreground">{windowSize}</span>
        </div>
        <Slider
          value={[windowSize]}
          onValueChange={(v) => onWindowSizeChange(v[0])}
          min={50}
          max={50}
          step={5}
          disabled
          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/50"
        />
      </div>

      {/* Update Interval */}
      <div className="space-y-3 mb-8">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Update Interval
          </Label>
          <span className="font-mono text-xs text-foreground">{updateInterval / 1000}s</span>
        </div>
        <div className="flex gap-2">
          {[1000, 3000, 5000].map((interval) => (
            <Button
              key={interval}
              variant="outline"
              size="sm"
              onClick={() => onUpdateIntervalChange(interval)}
              className={`flex-1 font-mono text-xs h-9 ${updateInterval === interval
                ? 'border-white bg-white/10 text-white'
                : 'border-white/20 text-muted-foreground hover:border-white/40'
                }`}
            >
              {interval / 1000}s
            </Button>
          ))}
        </div>
      </div>

      {/* Feature Inputs */}
      <div className="space-y-4 mb-8">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Feature Values
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(featureInputs) as Array<keyof FeatureInputs>).map((key) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground tracking-wider">
                {featureLabels[key].label}
                <span className="ml-1 text-white/40">{featureLabels[key].unit}</span>
              </Label>
              <Input
                type="number"
                value={featureInputs[key]}
                onChange={(e) => handleFeatureChange(key, e.target.value)}
                className="h-9 font-mono text-xs bg-white/5 border border-white/10 focus:border-white/30"
                disabled={inputMode === 'simulation' || isStreaming}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Buffer Progress */}
      <div className="space-y-3 mb-8">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Buffer
          </Label>
          <span className="font-mono text-xs">
            <span className="text-foreground">{buffer.length}</span>
            <span className="text-muted-foreground"> / {windowSize}</span>
          </span>
        </div>
        <div className="h-1 bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${bufferProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => onPushFrame()}
          disabled={isStreaming}
          className="w-full btn-tactical h-10 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Push Frame
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={isStreaming ? onStopStreaming : onStartStreaming}
            className={`h-10 text-xs font-orbitron tracking-wider uppercase ${isStreaming
              ? 'bg-aero-red/20 border border-aero-red/50 text-aero-red hover:bg-aero-red/30'
              : 'bg-aero-lime/20 border border-aero-lime/50 text-aero-lime hover:bg-aero-lime/30'
              }`}
          >
            {isStreaming ? (
              <>
                <Square className="h-3.5 w-3.5 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-2" />
                Stream
              </>
            )}
          </Button>

          <Button
            onClick={onClearBuffer}
            variant="outline"
            className="h-10 text-xs border-white/20 hover:border-white/40 hover:bg-white/5"
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Mode Indicator */}
      <motion.div
        className="mt-8 p-4 border border-white/10 bg-white/[0.02]"
        animate={isStreaming ? { borderColor: ['hsl(0 0% 100% / 0.1)', 'hsl(0 0% 100% / 0.25)', 'hsl(0 0% 100% / 0.1)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-3">
          {getModeIcon(inputMode)}
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {inputMode} Mode {isStreaming && '• Active'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
