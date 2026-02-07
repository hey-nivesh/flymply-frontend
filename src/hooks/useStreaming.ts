import { useState, useCallback, useRef, useEffect } from 'react';
import {
  predictTurbulence,
  generateMockSensorData,
  generateMockPrediction,
  PredictionResponse
} from '@/lib/api';
import { toast } from 'sonner';

export type InputMode = 'manual' | 'simulation' | 'csv';

export interface StreamingState {
  isStreaming: boolean;
  isConnected: boolean;
  buffer: number[][];
  windowSize: number;
  updateInterval: number;
  inputMode: InputMode;
  currentPrediction: PredictionResponse | null;
  predictionHistory: Array<PredictionResponse & { timestamp: Date }>;
  backendUrl: string;
  demoMode: boolean;
}

export interface FeatureInputs {
  altitude: number;
  velocity: number;
  vertical_rate: number;
  u_wind: number;
  v_wind: number;
  temperature: number;
}

export function useStreaming() {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isConnected: false,
    buffer: [],
    windowSize: 50,
    updateInterval: 3000,
    inputMode: 'simulation',
    currentPrediction: null,
    predictionHistory: [],
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://172.16.11.30:5000',
    demoMode: false,
  });

  const [featureInputs, setFeatureInputs] = useState<FeatureInputs>({
    altitude: 35000,
    velocity: 450,
    vertical_rate: 0,
    u_wind: 15,
    v_wind: -8,
    temperature: -45,
  });

  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Check backend connection
  const checkConnection = useCallback(async () => {
    if (state.demoMode) {
      setState(prev => ({ ...prev, isConnected: true }));
      return true;
    }

    try {
      const response = await fetch(`${state.backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      const connected = response.ok;
      setState(prev => ({ ...prev, isConnected: connected }));
      return connected;
    } catch {
      setState(prev => ({ ...prev, isConnected: false }));
      return false;
    }
  }, [state.backendUrl, state.demoMode]);

  // Add a frame to buffer
  const pushFrame = useCallback((values?: number[]) => {
    const frame = values || [
      featureInputs.altitude,
      featureInputs.velocity,
      featureInputs.vertical_rate,
      featureInputs.u_wind,
      featureInputs.v_wind,
      featureInputs.temperature,
    ];

    setState(prev => {
      // If manual mode and not streaming, fill the buffer with the current frame
      // to trigger an immediate prediction for this state
      if (prev.inputMode === 'manual' && !prev.isStreaming) {
        return {
          ...prev,
          buffer: Array(prev.windowSize).fill(frame)
        };
      }

      const newBuffer = [...prev.buffer, frame];
      // Keep only the last windowSize frames
      if (newBuffer.length > prev.windowSize) {
        newBuffer.shift();
      }
      return { ...prev, buffer: newBuffer };
    });
  }, [featureInputs]);

  // Make prediction
  const makePrediction = useCallback(async () => {
    if (state.buffer.length < state.windowSize) {
      return;
    }

    try {
      let prediction: PredictionResponse;

      if (state.demoMode) {
        prediction = generateMockPrediction();
      } else {
        prediction = await predictTurbulence(state.buffer, state.backendUrl);
      }

      const timestampedPrediction = { ...prediction, timestamp: new Date() };

      setState(prev => ({
        ...prev,
        currentPrediction: prediction,
        predictionHistory: [
          timestampedPrediction,
          ...prev.predictionHistory.slice(0, 29),
        ],
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prediction failed';
      toast.error('Prediction Error', { description: message });
    }
  }, [state.buffer, state.windowSize, state.demoMode, state.backendUrl]);

  // Start streaming
  const startStreaming = useCallback(() => {
    setState(prev => ({ ...prev, isStreaming: true }));

    streamingIntervalRef.current = setInterval(() => {
      // Generate and push new frame
      if (state.inputMode === 'simulation') {
        const mockData = generateMockSensorData();
        pushFrame(mockData);
      } else if (state.inputMode === 'manual') {
        pushFrame();
      }
    }, state.updateInterval);
  }, [state.inputMode, state.updateInterval, pushFrame]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  // Clear buffer
  const clearBuffer = useCallback(() => {
    setState(prev => ({ ...prev, buffer: [] }));
  }, []);

  // Update settings
  const setWindowSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, windowSize: size }));
  }, []);

  const setUpdateInterval = useCallback((interval: number) => {
    setState(prev => ({ ...prev, updateInterval: interval }));
  }, []);

  const setInputMode = useCallback((mode: InputMode) => {
    setState(prev => ({ ...prev, inputMode: mode }));
  }, []);

  const setBackendUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, backendUrl: url }));
  }, []);

  const setDemoMode = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, demoMode: enabled }));
  }, []);

  // Auto-predict when buffer is full
  useEffect(() => {
    if (state.buffer.length >= state.windowSize) {
      makePrediction();
    }
  }, [state.buffer, state.windowSize, state.isStreaming, makePrediction]);

  // Connection check interval
  useEffect(() => {
    checkConnection();
    connectionCheckRef.current = setInterval(checkConnection, 10000);

    return () => {
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, [checkConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  return {
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
    makePrediction,
    checkConnection,
  };
}
