import { create } from 'zustand';
import { FoodSuggestion } from '../models/FoodSuggestion';
import { WeatherData } from '../models/WeatherData';
import { LocationData } from '../models/LocationData';
import { UserPreferences } from '../models/UserPreferences';
import * as aiFoodService from '../services/aiFoodService';

type Status = 'initial' | 'loading' | 'loaded' | 'error';

interface FoodState {
  status: Status;
  message: string;
  suggestions: FoodSuggestion[];
  filteredSuggestions: FoodSuggestion[];
  activeCategory: string;
  error: string | null;
  fallbackSuggestions: FoodSuggestion[] | null;
  fetchSuggestions: (
    weather: WeatherData,
    location: LocationData,
    preferences: UserPreferences
  ) => Promise<void>;
  refreshSuggestions: (
    weather: WeatherData,
    location: LocationData,
    preferences: UserPreferences
  ) => Promise<void>;
  filterByCategory: (category: string) => void;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  status: 'initial',
  message: '',
  suggestions: [],
  filteredSuggestions: [],
  activeCategory: 'All',
  error: null,
  fallbackSuggestions: null,

  fetchSuggestions: async (weather, location, preferences) => {
    set({ status: 'loading', error: null, fallbackSuggestions: null });
    try {
      const response = await aiFoodService.fetchSuggestions(
        weather,
        location,
        preferences
      );
      set({
        status: 'loaded',
        message: response.message,
        suggestions: response.suggestions,
        filteredSuggestions: response.suggestions,
        activeCategory: 'All',
      });
    } catch (e: any) {
      const fallback = aiFoodService.getFallbackSuggestions(
        weather.weatherCondition
      );
      set({
        status: 'error',
        error: e.message ?? 'Something went wrong',
        fallbackSuggestions: fallback.suggestions,
      });
    }
  },

  refreshSuggestions: async (weather, location, preferences) => {
    set({ status: 'loading', error: null, fallbackSuggestions: null });
    aiFoodService.clearCache();
    try {
      const response = await aiFoodService.fetchSuggestions(
        weather,
        location,
        preferences
      );
      set({
        status: 'loaded',
        message: response.message,
        suggestions: response.suggestions,
        filteredSuggestions: response.suggestions,
        activeCategory: 'All',
      });
    } catch (e: any) {
      const fallback = aiFoodService.getFallbackSuggestions(
        weather.weatherCondition
      );
      set({
        status: 'error',
        error: e.message ?? 'Something went wrong',
        fallbackSuggestions: fallback.suggestions,
      });
    }
  },

  filterByCategory: (category: string) => {
    const state = get();
    if (category === 'All') {
      set({
        filteredSuggestions: state.suggestions,
        activeCategory: 'All',
      });
    } else {
      const filtered = state.suggestions.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
      set({
        filteredSuggestions: filtered,
        activeCategory: category,
      });
    }
  },
}));
