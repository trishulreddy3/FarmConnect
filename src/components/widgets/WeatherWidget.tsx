import React, { useState, useEffect } from 'react';
import { RefreshCw, Droplets, Wind, Lightbulb } from 'lucide-react';
import { weatherService } from '../../services/weatherService';
import { mapsService } from '../../services/mapsService';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const position = await mapsService.getCurrentLocation();
      if (position) {
        const weather = await weatherService.getCurrentWeather(
          position.lat,
          position.lng
        );
        setWeatherData(weather);
      } else {
        setError('Location not available');
      }
    } catch (err) {
      setError('Failed to load weather');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
          <span>Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-red-200 mr-3">⚠️</div>
            <span>{error}</span>
          </div>
          <button
            onClick={loadWeather}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const main = weatherData.main;
  const weather = weatherData.weather[0];
  const wind = weatherData.wind;

  const temp = Math.round(main.temp);
  const humidity = main.humidity;
  const windSpeed = wind.speed;

  const advice = weatherService.getFarmingAdvice(weatherData);

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-2">
            {weatherService.getWeatherIcon(weather.main)}
          </span>
          <div>
            <div className="text-2xl font-bold">{temp}°C</div>
            <div className="text-sm opacity-90">
              {weatherService.getWeatherDescription(weather.main)}
            </div>
          </div>
        </div>
        <button
          onClick={loadWeather}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Weather Details */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 mr-1 opacity-80" />
          <div>
            <div className="text-xs opacity-80">Humidity</div>
            <div className="font-semibold">{humidity}%</div>
          </div>
        </div>
        <div className="flex items-center">
          <Wind className="h-4 w-4 mr-1 opacity-80" />
          <div>
            <div className="text-xs opacity-80">Wind</div>
            <div className="font-semibold">{windSpeed.toFixed(1)} m/s</div>
          </div>
        </div>
      </div>

      {/* Farming Advice */}
      <div className="bg-white bg-opacity-20 rounded-lg p-3">
        <div className="flex items-start">
          <Lightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{advice}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
