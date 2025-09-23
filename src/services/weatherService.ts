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

interface WeatherForecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

class WeatherService {
  private readonly apiKey = 'demo_key'; // Demo key - replace with actual OpenWeatherMap API key
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      // Return mock data if API key is not properly configured
      if (this.apiKey === 'demo_key' || this.apiKey === 'YOUR_WEATHER_API_KEY') {
        return {
          main: {
            temp: 25,
            humidity: 65
          },
          wind: {
            speed: 5
          },
          weather: [{
            main: 'Clear',
            description: 'clear sky'
          }]
        };
      }

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Weather API error:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  async getWeatherForecast(latitude: number, longitude: number): Promise<WeatherForecast | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Weather forecast API error:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  getWeatherIcon(weatherCondition: string): string {
    switch (weatherCondition.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'drizzle':
        return '🌦️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  }

  getWeatherDescription(weatherCondition: string): string {
    switch (weatherCondition.toLowerCase()) {
      case 'clear':
        return 'Clear Sky';
      case 'clouds':
        return 'Cloudy';
      case 'rain':
        return 'Rainy';
      case 'drizzle':
        return 'Light Rain';
      case 'thunderstorm':
        return 'Thunderstorm';
      case 'snow':
        return 'Snowy';
      case 'mist':
        return 'Misty';
      case 'fog':
        return 'Foggy';
      default:
        return 'Partly Cloudy';
    }
  }

  getFarmingAdvice(weatherData: WeatherData): string {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const weatherCondition = weatherData.weather[0].main;

    if (weatherCondition.toLowerCase() === 'rain') {
      return '🌧️ Rainy conditions - Avoid field work and protect crops from waterlogging';
    } else if (temp > 35) {
      return '🌡️ High temperature - Ensure adequate irrigation and shade for crops';
    } else if (temp < 5) {
      return '❄️ Low temperature - Protect sensitive crops from frost damage';
    } else if (humidity > 80) {
      return '💧 High humidity - Watch for fungal diseases and ensure good ventilation';
    } else if (windSpeed > 10) {
      return '💨 Strong winds - Secure structures and protect young plants';
    } else if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70) {
      return '✅ Optimal conditions - Great weather for farming activities';
    } else {
      return '🌤️ Moderate conditions - Normal farming activities can proceed';
    }
  }
}

export const weatherService = new WeatherService();
