import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Radio, Power, Activity } from 'lucide-react';
import { PredictionResponse, generateDummyWindow, predictTurbulence } from '@/lib/api';
import { decodeBase64, decodeAudioData, createAudioBlob } from '@/lib/audio-utils';
import { motion, AnimatePresence } from 'framer-motion';

enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

interface AironAssistantProps {
  currentPrediction: PredictionResponse | null;
  backendUrl: string;
}

export function AironAssistant({ currentPrediction, backendUrl }: AironAssistantProps) {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [transcriptions, setTranscriptions] = useState<{ text: string; role: 'user' | 'model' }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micPermissionStatus, setMicPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [isFetchingPrediction, setIsFetchingPrediction] = useState(false);
  const lastTurbulenceQueryRef = useRef<string>('');
  
  // Refs for audio processing
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch turbulence prediction from backend
  const fetchTurbulencePrediction = useCallback(async (): Promise<PredictionResponse | null> => {
    try {
      console.log('[Airon] Fetching turbulence prediction from backend...');
      setIsFetchingPrediction(true);
      
      // Generate a dummy window (in production, this would come from actual sensor data)
      const window = generateDummyWindow('turbulent');
      
      const prediction = await predictTurbulence(window, backendUrl, false);
      console.log('[Airon] Prediction received:', prediction);
      
      setIsFetchingPrediction(false);
      return prediction;
    } catch (error: any) {
      console.error('[Airon] Error fetching prediction:', error);
      setIsFetchingPrediction(false);
      return null;
    }
  }, [backendUrl]);

  // Check if user is asking about turbulence
  const isTurbulenceQuery = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase();
    const turbulenceKeywords = [
      'turbulence', 'turbulent', 'bumpy', 'rough air',
      'chances', 'probability', 'risk', 'upcoming',
      'clear air', 'cat', 'weather', 'conditions',
      'forecast', 'prediction', 'assessment'
    ];
    
    return turbulenceKeywords.some(keyword => lowerText.includes(keyword));
  }, []);

  // Build system instruction with current turbulence data
  const buildSystemInstruction = useCallback(() => {
    const baseInstruction = `You are Airon, an advanced AI cockpit assistant for professional pilots. 
Your manner is professional, concise, and focused on safety. 
Use standard aviation terminology (e.g., "Roger", "Affirmative", "Vector", "Flight Level"). 
You assist with navigation, weather briefings, checklists, and general flight deck operations. 
You prioritize brevity; never use long sentences unless explicitly asked for a detailed brief. 
Always act as a helpful co-pilot who is ready to provide real-time data or cross-check instructions.

IMPORTANT: When the pilot asks about turbulence, chances of turbulence, upcoming turbulence, or weather conditions, 
you will receive real-time prediction data from the backend system. Use this data to provide accurate, 
professional assessments. Always reference the specific probability percentage, severity level, and advisory when responding.`;

    if (currentPrediction) {
      const probPercent = Math.round(currentPrediction.turbulence_probability * 100);
      return `${baseInstruction}

CURRENT TURBULENCE ASSESSMENT (from backend ${backendUrl}):
- Turbulence Probability: ${probPercent}%
- Severity: ${currentPrediction.severity}
- Confidence: ${currentPrediction.confidence}
- Advisory: ${currentPrediction.advisory || 'No advisory available'}
- Anomaly Score: ${currentPrediction.anomaly_score.toFixed(5)}

When the pilot asks about turbulence, weather conditions, or flight safety, provide this information. 
If turbulence probability is above 50%, emphasize the severity and recommend appropriate actions.
Always reference the latest data from the backend prediction system.`;
    }

    return baseInstruction;
  }, [currentPrediction, backendUrl]);

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const connectToAiron = async () => {
    if (status !== ConnectionStatus.DISCONNECTED) {
      console.warn('[Airon] Already connected or connecting, ignoring request');
      return;
    }

    console.log('[Airon] Starting connection process...');
    setErrorMessage(null);

    // Check API Key
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('[Airon] API Key check:', {
      exists: !!geminiApiKey,
      length: geminiApiKey?.length || 0,
      startsWith: geminiApiKey?.substring(0, 10) || 'N/A'
    });

    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      const errorMsg = 'GEMINI_API_KEY not configured. Please set VITE_GEMINI_API_KEY in .env.local';
      console.error('[Airon]', errorMsg);
      setErrorMessage(errorMsg);
      setStatus(ConnectionStatus.ERROR);
      return;
    }

    try {
      setStatus(ConnectionStatus.CONNECTING);
      console.log('[Airon] Requesting microphone access...');
      
      // Check if MediaDevices API is available
      if (!navigator.mediaDevices) {
        const errorMsg = 'MediaDevices API not available. This usually means:\n1. The page is not served over HTTPS\n2. You are using an unsupported browser\n\nPlease use HTTPS (https://) or localhost.';
        console.error('[Airon]', errorMsg);
        setErrorMessage(errorMsg);
        setStatus(ConnectionStatus.ERROR);
        return;
      }

      if (!navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'getUserMedia not supported. Please use a modern browser (Chrome, Firefox, Edge, Safari).';
        console.error('[Airon]', errorMsg);
        setErrorMessage(errorMsg);
        setStatus(ConnectionStatus.ERROR);
        return;
      }
      
      // Request microphone permission
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          } 
        });
        console.log('[Airon] Microphone access granted');
        streamRef.current = stream;
        setMicPermissionStatus('granted');
        setErrorMessage(null);
      } catch (mediaError: any) {
        let errorMsg = '';
        
        if (mediaError.name === 'NotAllowedError') {
          errorMsg = 'Microphone permission denied. Please:\n1. Click the microphone icon in your browser\'s address bar\n2. Allow microphone access\n3. Or click "Request Permission" button below';
          setMicPermissionStatus('denied');
        } else if (mediaError.name === 'NotFoundError') {
          errorMsg = 'No microphone found. Please connect a microphone and try again.';
        } else if (mediaError.name === 'NotReadableError') {
          errorMsg = 'Microphone is being used by another application. Please close other apps using the microphone.';
        } else {
          errorMsg = `Microphone error: ${mediaError.message || mediaError.name || 'Unknown error'}`;
        }
        
        console.error('[Airon]', errorMsg, mediaError);
        setErrorMessage(errorMsg);
        setStatus(ConnectionStatus.ERROR);
        return;
      }

      // Create audio contexts
      console.log('[Airon] Creating audio contexts...');
      let inputCtx: AudioContext;
      let outputCtx: AudioContext;
      
      try {
        inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextsRef.current = { input: inputCtx, output: outputCtx };
        console.log('[Airon] Audio contexts created:', {
          inputState: inputCtx.state,
          outputState: outputCtx.state
        });
      } catch (audioError: any) {
        const errorMsg = `Failed to create audio contexts: ${audioError.message}`;
        console.error('[Airon]', errorMsg, audioError);
        setErrorMessage(errorMsg);
        setStatus(ConnectionStatus.ERROR);
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      // Initialize Gemini AI
      console.log('[Airon] Initializing GoogleGenAI...');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      const systemInstruction = buildSystemInstruction();
      console.log('[Airon] System instruction length:', systemInstruction.length);
      
      console.log('[Airon] Connecting to Gemini Live API...');
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log('[Airon] Connection opened successfully');
            setStatus(ConnectionStatus.CONNECTED);
            setErrorMessage(null);
            
            try {
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                try {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcmBlob = createAudioBlob(inputData);
                  sessionPromise.then((session) => {
                    try {
                      session.sendRealtimeInput({ media: pcmBlob });
                    } catch (sendError: any) {
                      console.error('[Airon] Error sending audio input:', sendError);
                    }
                  }).catch((promiseError: any) => {
                    console.error('[Airon] Error in session promise:', promiseError);
                  });
                } catch (processError: any) {
                  console.error('[Airon] Error processing audio:', processError);
                }
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
              console.log('[Airon] Audio processing pipeline connected');
            } catch (pipelineError: any) {
              console.error('[Airon] Error setting up audio pipeline:', pipelineError);
              setErrorMessage(`Audio pipeline error: ${pipelineError.message}`);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            try {
              console.log('[Airon] Received message:', {
                hasInputTranscription: !!message.serverContent?.inputTranscription,
                hasOutputTranscription: !!message.serverContent?.outputTranscription,
                hasAudio: !!message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data,
                interrupted: !!message.serverContent?.interrupted
              });

              // Handle Transcriptions
              if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                console.log('[Airon] User transcription:', text);
                setTranscriptions(prev => [...prev.slice(-10), { text, role: 'user' }]);
                
                // Check if user is asking about turbulence and fetch from backend
                if (isTurbulenceQuery(text) && text !== lastTurbulenceQueryRef.current) {
                  lastTurbulenceQueryRef.current = text;
                  console.log('[Airon] Detected turbulence query, fetching from backend...');
                  
                  fetchTurbulencePrediction().then((prediction) => {
                    if (prediction && sessionRef.current) {
                      const probPercent = Math.round(prediction.turbulence_probability * 100);
                      const contextMessage = `[BACKEND DATA] Latest turbulence prediction from ${backendUrl}:
Probability: ${probPercent}%
Severity: ${prediction.severity}
Confidence: ${prediction.confidence}
Advisory: ${prediction.advisory || 'No advisory available'}
Anomaly Score: ${prediction.anomaly_score.toFixed(5)}

Use this real-time data to provide an accurate answer to the pilot's question.`;
                      
                      try {
                        // Send the prediction data as text input to the session
                        // Note: Gemini Live API accepts text input via sendRealtimeInput
                        sessionRef.current.sendRealtimeInput({
                          text: contextMessage
                        });
                        console.log('[Airon] Sent backend prediction data to assistant:', {
                          probability: probPercent,
                          severity: prediction.severity
                        });
                      } catch (sendError: any) {
                        console.error('[Airon] Error sending prediction data:', sendError);
                        // Fallback: try sending as a formatted message
                        try {
                          const fallbackMessage = `Turbulence probability is ${probPercent}% with ${prediction.severity} severity. ${prediction.advisory || ''}`;
                          sessionRef.current.sendRealtimeInput({ text: fallbackMessage });
                        } catch (fallbackError) {
                          console.error('[Airon] Fallback send also failed:', fallbackError);
                        }
                      }
                    } else if (!prediction) {
                      console.warn('[Airon] Failed to fetch prediction from backend');
                      try {
                        if (sessionRef.current) {
                          sessionRef.current.sendRealtimeInput({
                            text: 'Unable to fetch latest turbulence data from backend. The backend may be unavailable. Please try again later.'
                          });
                        }
                      } catch (e: any) {
                        console.error('[Airon] Error sending error message:', e);
                      }
                    }
                  }).catch((fetchError: any) => {
                    console.error('[Airon] Error in fetchTurbulencePrediction:', fetchError);
                  });
                }
              }
              if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                console.log('[Airon] Airon transcription:', text);
                setTranscriptions(prev => [...prev.slice(-10), { text, role: 'model' }]);
              }

              // Handle Audio Data
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                const outputCtx = audioContextsRef.current?.output;
                if (!outputCtx) {
                  console.error('[Airon] Output audio context not available');
                  return;
                }

                try {
                  console.log('[Airon] Decoding audio response...');
                  const audioBuffer = await decodeAudioData(
                    decodeBase64(base64Audio),
                    outputCtx,
                    24000,
                    1
                  );
                  
                  console.log('[Airon] Playing audio response, duration:', audioBuffer.duration);
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                  const source = outputCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputCtx.destination);
                  source.onended = () => {
                    sourcesRef.current.delete(source);
                    console.log('[Airon] Audio playback ended');
                  };
                  try {
                    source.start(nextStartTimeRef.current);
                  } catch (startError: any) {
                    console.error('[Airon] Audio playback start error:', startError);
                  }
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);
                } catch (audioError: any) {
                  console.error('[Airon] Error decoding/playing audio:', audioError);
                }
              }

              // Handle Interruption
              if (message.serverContent?.interrupted) {
                console.log('[Airon] Interruption detected');
                stopAllAudio();
              }
            } catch (messageError: any) {
              console.error('[Airon] Error processing message:', messageError);
            }
          },
          onerror: (e: any) => {
            const errorMsg = `Connection error: ${e?.message || e?.toString() || 'Unknown error'}`;
            console.error('[Airon] Connection error:', e);
            setErrorMessage(errorMsg);
            setStatus(ConnectionStatus.ERROR);
          },
          onclose: (event: any) => {
            console.log('[Airon] Connection closed:', event);
            setStatus(ConnectionStatus.DISCONNECTED);
            disconnect();
          }
        }
      });

      console.log('[Airon] Waiting for session...');
      sessionRef.current = await sessionPromise;
      console.log('[Airon] Session established:', !!sessionRef.current);
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Unknown connection error';
      console.error('[Airon] Failed to connect:', error);
      console.error('[Airon] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      });
      setErrorMessage(errorMsg);
      setStatus(ConnectionStatus.ERROR);
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const disconnect = () => {
    console.log('[Airon] Disconnecting...');
    if (sessionRef.current) {
      try { 
        sessionRef.current.close();
        console.log('[Airon] Session closed');
      } catch(e: any) {
        console.error('[Airon] Error closing session:', e);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('[Airon] Media track stopped:', track.kind);
      });
      streamRef.current = null;
    }
    stopAllAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
    setTranscriptions([]);
    setErrorMessage(null);
    console.log('[Airon] Disconnected');
  };

  const toggleMute = () => setIsMuted(!isMuted);

  // Check microphone permission status on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '[::1]';
      
      if (!isSecure) {
        console.warn('[Airon] Not on HTTPS or localhost - MediaDevices API requires secure context');
        const errorMsg = 'Microphone access requires HTTPS or localhost.\n\nPlease:\n1. Use https:// instead of http://\n2. Or access via localhost:8080\n3. Or use 127.0.0.1:8080';
        setErrorMessage(errorMsg);
        setMicPermissionStatus('denied');
        return;
      }

      if (!navigator.mediaDevices) {
        console.warn('[Airon] MediaDevices API not available');
        setMicPermissionStatus('denied');
        setErrorMessage('MediaDevices API not available. This may require HTTPS or a browser update.');
        return;
      }

      if (!navigator.mediaDevices.getUserMedia) {
        console.warn('[Airon] getUserMedia not available');
        setMicPermissionStatus('denied');
        setErrorMessage('getUserMedia not supported. Please use a modern browser (Chrome, Firefox, Edge, Safari).');
        return;
      }

      try {
        // Check if we can query permissions
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          
          result.onchange = () => {
            setMicPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          };
        } else {
          // Fallback: try to get user media to check permission
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setMicPermissionStatus('granted');
          } catch {
            setMicPermissionStatus('prompt');
          }
        }
      } catch (error) {
        console.warn('[Airon] Could not check microphone permission:', error);
        setMicPermissionStatus('prompt');
      }
    };

    checkMicPermission();
  }, []);

  // Request microphone permission explicitly
  const requestMicPermission = async () => {
    console.log('[Airon] Requesting microphone permission...');
    setErrorMessage(null);

    // Check if MediaDevices API is available
    if (!navigator.mediaDevices) {
      const errorMsg = 'MediaDevices API not available. Please use HTTPS or a modern browser.';
      console.error('[Airon]', errorMsg);
      setErrorMessage(errorMsg);
      setMicPermissionStatus('denied');
      return;
    }

    if (!navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'getUserMedia not supported. Please use a modern browser (Chrome, Firefox, Edge, Safari).';
      console.error('[Airon]', errorMsg);
      setErrorMessage(errorMsg);
      setMicPermissionStatus('denied');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      console.log('[Airon] Microphone permission granted');
      setMicPermissionStatus('granted');
      setErrorMessage(null);
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
        : error.name === 'NotFoundError'
        ? 'No microphone found. Please connect a microphone and try again.'
        : `Microphone error: ${error.message || 'Unknown error'}`;
      
      console.error('[Airon]', errorMsg, error);
      setErrorMessage(errorMsg);
      setMicPermissionStatus('denied');
    }
  };

  // Update system instruction when prediction changes
  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED && sessionRef.current) {
      // Note: Gemini Live API doesn't support updating system instruction after connection
      // This is a limitation - the instruction is set at connection time
      // In a production system, you might want to reconnect when prediction changes significantly
    }
  }, [currentPrediction, status]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-panel p-6 border border-white/10 mt-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-foreground" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider uppercase text-foreground">
            Airon Voice Assistant
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded border text-xs font-bold ${
            status === ConnectionStatus.CONNECTED ? 'border-aero-lime bg-aero-lime/10 text-aero-lime' : 
            status === ConnectionStatus.CONNECTING ? 'border-aero-amber bg-aero-amber/10 text-aero-amber' :
            status === ConnectionStatus.ERROR ? 'border-aero-red bg-aero-red/10 text-aero-red' :
            'border-white/20 bg-white/5 text-muted-foreground'
          }`}>
            {status}
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-aero-red/10 border border-aero-red/30 rounded text-xs text-aero-red">
          <div className="font-bold mb-1">Error:</div>
          <div className="whitespace-pre-line">{errorMessage}</div>
          <div className="mt-2 text-[10px] opacity-75">
            Check browser console (F12) for detailed logs
          </div>
          {errorMessage.includes('permission') && (
            <button
              onClick={requestMicPermission}
              className="mt-3 px-4 py-2 bg-aero-red/20 border border-aero-red/50 rounded text-xs font-bold hover:bg-aero-red/30 transition-colors"
            >
              Request Microphone Permission
            </button>
          )}
        </div>
      )}

      {/* Microphone Permission Status */}
      {micPermissionStatus === 'denied' && !errorMessage && (
        <div className="mb-4 p-3 bg-aero-amber/10 border border-aero-amber/30 rounded text-xs text-aero-amber">
          <div className="font-bold mb-1">Microphone Permission Required</div>
          <div className="mb-2">Click the button below to request microphone access.</div>
          <button
            onClick={requestMicPermission}
            className="px-4 py-2 bg-aero-amber/20 border border-aero-amber/50 rounded text-xs font-bold hover:bg-aero-amber/30 transition-colors"
          >
            Request Microphone Permission
          </button>
        </div>
      )}

      {/* Main Control Area */}
      <div className="flex flex-col items-center gap-4 mb-6">
        {/* Connection Button */}
        <button
          onClick={status === ConnectionStatus.CONNECTED ? disconnect : connectToAiron}
          className={`
            relative w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300
            ${status === ConnectionStatus.CONNECTED 
              ? 'bg-aero-lime/10 border-aero-lime shadow-[0_0_20px_-8px_rgba(142,76%,45%,0.5)]' 
              : 'bg-white/5 border-white/20 hover:border-aero-lime/50'
            }
          `}
        >
          {status === ConnectionStatus.CONNECTED ? (
            <>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className="w-1 h-6 bg-aero-lime rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.1}s` }} 
                  />
                ))}
              </div>
              <span className="text-aero-lime font-bold tracking-widest text-[10px]">ACTIVE</span>
            </>
          ) : status === ConnectionStatus.CONNECTING ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aero-lime" />
          ) : (
            <>
              <Power className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-muted-foreground font-bold tracking-widest text-[10px]">INITIALIZE</span>
            </>
          )}
        </button>

        {/* Secondary Controls */}
        {status === ConnectionStatus.CONNECTED && (
          <div className="flex gap-3">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full border transition-colors ${
                isMuted 
                  ? 'bg-aero-red/20 border-aero-red text-aero-red' 
                  : 'bg-white/5 border-white/20 text-muted-foreground hover:text-foreground'
              }`}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Transcription Log */}
      <div className="h-32 overflow-hidden border-t border-white/10 pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Live Comm Log</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
          {transcriptions.length === 0 && (
            <p className="text-muted-foreground italic text-xs">Awaiting communication signal...</p>
          )}
          <AnimatePresence>
            {transcriptions.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-2 text-xs ${t.role === 'user' ? 'text-aero-lime' : 'text-muted-foreground'}`}
              >
                <span className="font-bold opacity-50 shrink-0 w-12 text-[10px]">
                  [{t.role === 'user' ? 'PILOT' : 'AIRON'}]
                </span>
                <span className="tracking-tight">{t.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Backend Fetching Indicator */}
      {isFetchingPrediction && (
        <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-aero-amber">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" />
            <span className="uppercase tracking-widest">Fetching latest turbulence data from backend...</span>
          </div>
        </div>
      )}

      {/* Status Info */}
      {currentPrediction && status === ConnectionStatus.CONNECTED && (
        <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest">Context:</span>
            <span>
              Turbulence {Math.round(currentPrediction.turbulence_probability * 100)}% - {currentPrediction.severity}
            </span>
          </div>
          <div className="mt-1 text-[9px] opacity-75">
            Ask "What are the chances of upcoming turbulence?" to get latest backend prediction
          </div>
        </div>
      )}
    </motion.div>
  );
}

