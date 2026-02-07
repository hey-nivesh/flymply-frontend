'use client';

import { useState, useEffect } from 'react';

interface PredictionData {
  turbulence_probability: number;
  risk_level: string;
  weather: {
    wind_speed: number;
    temperature: number;
    pressure: number;
    humidity: number;
  };
  ml_score: number;
  gemma_adjustment: number;
  reasoning: string;
}

export function CATDashboard() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_BACKEND_URL || 'http://172.16.11.30:5000');

  const fetchPrediction = async () => {
    try {
      const response = await fetch(`${backendUrl}/predict-cat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrediction(data);
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch prediction:', response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    const interval = setInterval(fetchPrediction, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [backendUrl]);

  const getRiskColor = (prob: number) => {
    if (prob < 40) return 'text-green-500 bg-green-50 border-green-300';
    if (prob < 70) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-red-500 bg-red-50 border-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading prediction system...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800">
            Clear-Air Turbulence Risk Prediction
          </h1>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Backend URL:</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              placeholder="http://localhost:5000"
            />
          </div>
        </div>

        {prediction && (
          <div className="space-y-6">
            {/* Main Risk Display */}
            <div className={`rounded-2xl border-4 p-12 text-center ${getRiskColor(prediction.turbulence_probability)}`}>
              <div className="text-7xl font-bold mb-4">
                {prediction.turbulence_probability}%
              </div>
              <div className="text-2xl font-semibold uppercase tracking-wide">
                {prediction.risk_level} Risk
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weather Data */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Weather Conditions</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Speed:</span>
                    <span className="font-semibold">{prediction.weather.wind_speed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold">{prediction.weather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pressure:</span>
                    <span className="font-semibold">{prediction.weather.pressure} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity:</span>
                    <span className="font-semibold">{prediction.weather.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">AI Analysis</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ML Score:</span>
                    <span className="font-semibold">{prediction.ml_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gemma Adjustment:</span>
                    <span className="font-semibold">{prediction.gemma_adjustment > 0 ? '+' : ''}{prediction.gemma_adjustment}%</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-gray-600 block mb-2">Reasoning:</span>
                    <p className="text-sm text-gray-700 italic">{prediction.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div className="text-center text-gray-600 text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        )}

        {!prediction && !loading && (
          <div className="text-center text-red-600">
            Failed to load prediction. Please check your backend connection.
          </div>
        )}
      </div>
    </main>
  );
}

