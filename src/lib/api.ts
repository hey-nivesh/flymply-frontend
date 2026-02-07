import { cachePrediction, getCachedPrediction } from './cache';

export interface PredictionInput {
  window: number[][];
}

export interface PredictionResponse {
  turbulence_probability: number;
  severity: 'Low' | 'Moderate' | 'High';
  confidence: 'Low' | 'Medium' | 'High';
  anomaly_score: number;
  advisory: string;
}

// Get backend URL from environment variable, fallback to default
const DEFAULT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://172.16.11.30:5000';

// Configuration matching backend test_predict.py
const WINDOW_SIZE = 50;
const NUM_FEATURES = 6;

/**
 * Generate dummy window data similar to test_predict.py
 * @param mode - 'turbulent' for high variance data, 'calm' for stable data
 */
export function generateDummyWindow(mode: 'turbulent' | 'calm' = 'turbulent'): number[][] {
  const data: number[][] = [];
  
  for (let i = 0; i < WINDOW_SIZE; i++) {
    if (mode === 'turbulent') {
      // Simulate high variance in vertical rate (index 2) and wind components (3, 4)
      const row = [
        gaussianRandom(0, 0.1),  // Altitude (stable-ish)
        gaussianRandom(0, 0.2),  // Velocity
        gaussianRandom(0, 2.5),  // Vertical rate (High variance!)
        gaussianRandom(0, 2.0),  // U wind (Gusty)
        gaussianRandom(0, 2.0),  // V wind (Gusty)
        gaussianRandom(0, 0.5)   // Temp
      ];
      data.push(row);
    } else {
      // Calm conditions
      const row = Array(NUM_FEATURES).fill(0).map(() => gaussianRandom(0, 0.1));
      data.push(row);
    }
  }
  
  return data;
}

/**
 * Generate a random number from a Gaussian distribution
 */
function gaussianRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Predict turbulence with local caching support
 * Falls back to cache if backend is unavailable
 */
export async function predictTurbulence(
  window: number[][],
  backendUrl: string = DEFAULT_BACKEND_URL,
  useCache: boolean = true
): Promise<PredictionResponse> {
  // Check cache first if enabled
  if (useCache) {
    const cached = getCachedPrediction(window);
    if (cached) {
      console.log('Using cached prediction');
      return cached;
    }
  }

  try {
    const response = await fetch(`${backendUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        window,
        include_advisory: true,
        time_horizon_min: 15,
        altitude_band: 'FL380'
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Cache the response for future use
    if (useCache) {
      cachePrediction(window, result);
    }
    
    return result;
  } catch (error) {
    // If backend fails, try to get from cache as fallback
    if (useCache) {
      const cached = getCachedPrediction(window);
      if (cached) {
        console.warn('Backend unavailable, using cached prediction');
        return cached;
      }
    }
    
    // If no cache available, throw the error
    throw error;
  }
}

// Generate realistic mock sensor values for simulation mode
export function generateMockSensorData(): number[] {
  const altitude = 30000 + Math.random() * 12000; // 30,000 - 42,000 ft (FL300-FL420)
  const velocity = 400 + Math.random() * 150; // 400 - 550 knots
  const verticalRate = (Math.random() - 0.5) * 2000; // -1000 to +1000 fpm
  const uWind = (Math.random() - 0.5) * 100; // -50 to +50 m/s
  const vWind = (Math.random() - 0.5) * 100; // -50 to +50 m/s
  const temperature = -60 + Math.random() * 30; // -60 to -30 °C

  return [
    Math.round(altitude),
    Math.round(velocity * 10) / 10,
    Math.round(verticalRate),
    Math.round(uWind * 10) / 10,
    Math.round(vWind * 10) / 10,
    Math.round(temperature * 10) / 10,
  ];
}

// Generate mock prediction response for demo mode
export function generateMockPrediction(): PredictionResponse {
  const probability = Math.random();
  const severity: PredictionResponse['severity'] =
    probability < 0.3 ? 'Low' : probability < 0.7 ? 'Moderate' : 'High';
  const confidence: PredictionResponse['confidence'] =
    Math.random() < 0.33 ? 'Low' : Math.random() < 0.66 ? 'Medium' : 'High';

  const advisories = {
    Low: [
      "Conditions stable. Continue as planned.",
      "Clear air expected for next 15 minutes.",
      "Light turbulence possible. Standard operations.",
    ],
    Moderate: [
      "Moderate turbulence likely ahead in ~8 minutes at current FL. Seatbelt ON.",
      "Expect moderate chop in 5-10 minutes. Consider altitude change.",
      "Turbulence building. Secure cabin and advise passengers.",
    ],
    High: [
      "SEVERE CAT WARNING: Immediate altitude change recommended. Avoid FL360-FL380.",
      "HIGH TURBULENCE ALERT: Secure all items. Emergency descent may be required.",
      "CRITICAL: Extreme CAT detected ahead. Deviate NOW.",
    ],
  };

  const randomAdvisory = advisories[severity][Math.floor(Math.random() * advisories[severity].length)];

  return {
    turbulence_probability: Math.round(probability * 100) / 100,
    severity,
    confidence,
    anomaly_score: Math.round(Math.random() * 0.1 * 10000) / 10000,
    advisory: randomAdvisory,
  };
}
