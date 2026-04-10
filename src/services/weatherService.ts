import axios from 'axios';
import { AppConstants } from '../config/constants';
import { WeatherData, weatherDataFromOpenWeatherJson } from '../models/WeatherData';
import { ForecastData, forecastDataFromOpenWeatherJson } from '../models/ForecastData';
import { LocationData } from '../models/LocationData';

export class WeatherServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceException';
  }
}

const weatherApi = axios.create({
  baseURL: AppConstants.openWeatherBaseUrl,
  timeout: 15000,
});

export async function fetchWeather(location: LocationData): Promise<WeatherData> {
  try {
    const response = await weatherApi.get('/weather', {
      params: {
        lat: location.latitude,
        lon: location.longitude,
        appid: AppConstants.openWeatherMapApiKey,
        units: 'metric',
      },
    });
    return weatherDataFromOpenWeatherJson(response.data);
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new WeatherServiceException(
        'Connection timed out. Please check your internet.'
      );
    }
    if (error.response?.status === 401) {
      throw new WeatherServiceException(
        'Invalid API key. Please check your OpenWeatherMap API key.'
      );
    }
    throw new WeatherServiceException(
      `Failed to fetch weather data: ${error.message}`
    );
  }
}

export async function fetchForecast(location: LocationData): Promise<ForecastData> {
  try {
    const response = await weatherApi.get('/forecast', {
      params: {
        lat: location.latitude,
        lon: location.longitude,
        appid: AppConstants.openWeatherMapApiKey,
        units: 'metric',
      },
    });
    return forecastDataFromOpenWeatherJson(response.data);
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new WeatherServiceException(
        'Connection timed out. Please check your internet.'
      );
    }
    throw new WeatherServiceException(
      `Failed to fetch forecast data: ${error.message}`
    );
  }
}
