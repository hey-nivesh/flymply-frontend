import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Target,
  Clock,
  Activity,
} from 'lucide-react';
import { PredictionResponse } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface RiskPanelProps {
  prediction: PredictionResponse | null;
  isStreaming: boolean;
}

export function RiskPanel({ prediction, isStreaming }: RiskPanelProps) {
  const probability = prediction?.turbulence_probability ?? 0;
  const severity = prediction?.severity ?? 'Low';
  const confidence = prediction?.confidence ?? 'Low';
  const anomalyScore = prediction?.anomaly_score ?? 0;
  const advisory = prediction?.advisory ?? 'Awaiting data stream...';

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Low': return 'text-aero-lime';
      case 'Moderate': return 'text-aero-amber';
      case 'High': return 'text-aero-red';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBg = (sev: string) => {
    switch (sev) {
      case 'Low': return 'severity-low';
      case 'Moderate': return 'severity-moderate';
      case 'High': return 'severity-high';
      default: return '';
    }
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'High': return 'text-aero-lime';
      case 'Medium': return 'text-aero-amber';
      case 'Low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const gaugeRotation = -90 + (probability * 180);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass p-8 border border-white/10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-foreground" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider uppercase text-foreground">
            Turbulence Risk Output
          </h3>
        </div>
        <motion.div
          animate={isStreaming ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Activity className={`h-4 w-4 ${isStreaming ? 'text-aero-lime' : 'text-muted-foreground'}`} />
        </motion.div>
      </div>

      {/* Main Gauge Section */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        {/* Circular Gauge */}
        <div className="relative w-64 h-64 mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="gaugeGradientLow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="gaugeGradientMed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="gaugeGradientHigh" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
            {/* Background Track - Subtle Segmented Look */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="12"
              strokeLinecap="butt"
              strokeDasharray="1.5 1.5"
            />
            {/* Progress Arc */}
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={severity === 'High' ? 'url(#gaugeGradientHigh)' : severity === 'Moderate' ? 'url(#gaugeGradientMed)' : 'url(#gaugeGradientLow)'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${probability * 138} 276`}
              initial={{ strokeDasharray: '0 276' }}
              animate={{ strokeDasharray: `${probability * 138} 276` }}
              transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
            />
            {/* Arc Tip Indicator */}
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`0.1 276`}
              animate={{ strokeDashoffset: -(probability * 138) }}
              transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </svg>

          {/* Center Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={probability}
                initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="text-center relative z-10"
              >
                <div className="flex items-start justify-center">
                  <span className={`font-orbitron text-7xl font-black tracking-tighter ${getSeverityColor(severity)} contrast-125`}>
                    {(probability * 100).toFixed(0)}
                  </span>
                  <span className={`text-2xl font-bold mt-4 ml-1 ${getSeverityColor(severity)} opacity-60`}>%</span>
                </div>
                <div className="flex flex-col items-center -mt-2">
                  <div className="h-[2px] w-12 bg-white/10 mb-2" />
                  <span className="font-rajdhani text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
                    Probability Score
                  </span>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`font-mono text-[9px] px-2 py-0.5 mt-1 border border-white/10 bg-white/5 rounded tracking-widest ${getSeverityColor(severity)}`}
                  >
                    STATE::{severity.toUpperCase()}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Technical Rings */}
          <div className="absolute inset-2 border-[0.5px] border-white/5 rounded-full pointer-events-none" />
          <div className="absolute inset-10 border-[0.5px] border-white/5 rounded-full pointer-events-none" />
          <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow opacity-20 pointer-events-none"
            style={{ borderStyle: 'dashed', animationDuration: '30s' }} />
        </div>

        {/* Status Badges */}
        <div className="flex gap-4 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <Badge
              variant="outline"
              className={`font-orbitron text-xs tracking-wider px-4 py-1.5 border ${getSeverityBg(severity)}`}
            >
              <AlertTriangle className="h-3 w-3 mr-2" />
              {severity}
            </Badge>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            <Badge
              variant="outline"
              className={`font-orbitron text-xs tracking-wider px-4 py-1.5 border border-white/20 ${getConfidenceColor(confidence)}`}
            >
              <Shield className="h-3 w-3 mr-2" />
              {confidence} Confidence
            </Badge>
          </motion.div>
        </div>

        {/* Anomaly Score */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="font-mono text-xs text-muted-foreground">Anomaly Score:</span>
          <span className="font-mono text-xs text-foreground">{anomalyScore.toFixed(5)}</span>
        </motion.div>

        {/* Time Horizon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-xs uppercase tracking-widest">
            Prediction Horizon: next 5–15 min
          </span>
        </motion.div>
      </div>

      {/* Advisory Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="p-5 bg-white/[0.02] border border-white/10 mt-4"
      >
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 ${getSeverityColor(severity)}`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
              Advisory
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={advisory}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className={`font-inter text-sm leading-relaxed ${getSeverityColor(severity)}`}
              >
                {advisory}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
