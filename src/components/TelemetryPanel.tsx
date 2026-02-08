import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { PredictionResponse } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TelemetryPanelProps {
  predictionHistory: Array<PredictionResponse & { timestamp: Date }>;
}

export function TelemetryPanel({ predictionHistory }: TelemetryPanelProps) {
  const chartData = predictionHistory
    .slice(0, 30)
    .reverse()
    .map((p, i) => ({
      index: i,
      probability: p.turbulence_probability * 100,
      severity: p.severity,
    }));

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Low': return 'bg-aero-lime';
      case 'Moderate': return 'bg-aero-amber';
      case 'High': return 'bg-aero-red';
      default: return 'bg-muted';
    }
  };

  const getSeverityTextColor = (sev: string) => {
    switch (sev) {
      case 'Low': return 'text-aero-lime';
      case 'Moderate': return 'text-aero-amber';
      case 'High': return 'text-aero-red';
      default: return 'text-muted-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass p-5 border border-white/10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {/* Panel Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <TrendingUp className="h-5 w-5 text-foreground" />
        <h3 className="font-orbitron text-sm font-semibold tracking-wider uppercase text-foreground">
          Telemetry + History
        </h3>
      </div>

      {/* Chart Section */}
      <div className="mb-6">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Probability Trend (Last 30)
        </p>
        <div className="h-32 bg-white/[0.02] border border-white/10 p-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(195 100% 50%)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(195 100% 50%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="index"
                  hide
                />
                <YAxis
                  domain={[0, 100]}
                  hide
                />
                <ReferenceLine
                  y={30}
                  stroke="hsl(142 76% 45%)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
                <ReferenceLine
                  y={70}
                  stroke="hsl(0 72% 51%)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="glass-panel rounded px-2 py-1 text-xs">
                          <span className="text-primary font-mono">
                            {typeof value === 'number' ? value.toFixed(1) : value}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="hsl(195 100% 50%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: 'hsl(195 100% 50%)',
                    stroke: 'hsl(195 100% 70%)',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="font-mono text-xs text-muted-foreground">
                No data yet...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 min-h-0">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Recent Advisories
        </p>

        <ScrollArea className="h-[calc(100%-24px)]">
          {predictionHistory.length > 0 ? (
            <div className="space-y-2 pr-2">
              {predictionHistory.slice(0, 10).map((prediction, index) => (
                <motion.div
                  key={`${prediction.timestamp.getTime()}-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(prediction.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-mono text-xs font-semibold ${getSeverityTextColor(prediction.severity)}`}>
                          {(prediction.turbulence_probability * 100).toFixed(1)}%
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatTime(prediction.timestamp)}
                        </span>
                      </div>
                      <p className="font-inter text-[11px] text-muted-foreground leading-snug truncate">
                        {prediction.advisory}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              <p className="font-mono text-xs">No history yet</p>
              <p className="font-mono text-[10px] text-center mt-1 opacity-70">
                Start streaming to collect data
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </motion.div>
  );
}
