import { create } from 'zustand';
import { WeatherData } from '../models/WeatherData';
import { ForecastData } from '../models/ForecastData';
import { LocationData } from '../models/LocationData';
import * as weatherService from '../services/weatherService';

type Status = 'initial' | 'loading' | 'loaded' | 'error';

interface WeatherState {
  status: Status;
  weather: WeatherData | null;
  forecast: ForecastData | null;
  error: string | null;
  _cachedLocationKey: string | null;
  _lastFetchTime: number | null;
  fetchWeather: (location: LocationData) => Promise<void>;
  refreshWeather: (location: LocationData) => Promise<void>;
}

function locationKey(location: LocationData): string {
  return `${location.latitude},${location.longitude}`;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  status: 'initial',
  weather: null,
  forecast: null,
  error: null,
  _cachedLocationKey: null,
  _lastFetchTime: null,

  fetchWeather: async (location: LocationData) => {
    const key = locationKey(location);
    const state = get();
    if (
      state.weather &&
      state._cachedLocationKey === key &&
      state._lastFetchTime &&
      Date.now() - state._lastFetchTime < 30 * 60 * 1000
    ) {
      set({ status: 'loaded' });
      return;
    }

    set({ status: 'loading', error: null });
    try {
      const [weather, forecast] = await Promise.all([
        weatherService.fetchWeather(location),
        weatherService.fetchForecast(location),
      ]);
      set({
        status: 'loaded',
        weather,
        forecast,
        _cachedLocationKey: key,
        _lastFetchTime: Date.now(),
      });
    } catch (e: any) {
      set({ status: 'error', error: e.message ?? 'Failed to fetch weather' });
    }
  },

  refreshWeather: async (location: LocationData) => {
    set({ status: 'loading', error: null });
    try {
      const [weather, forecast] = await Promise.all([
        weatherService.fetchWeather(location),
        weatherService.fetchForecast(location),
      ]);
      set({
        status: 'loaded',
        weather,
        forecast,
        _cachedLocationKey: locationKey(location),
        _lastFetchTime: Date.now(),
      });
    } catch (e: any) {
      set({ status: 'error', error: e.message ?? 'Failed to fetch weather' });
    }
  },
}));
