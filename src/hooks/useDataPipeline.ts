import { useEffect, useRef } from 'react';
import { useLocationStore } from '../stores/useLocationStore';
import { useWeatherStore } from '../stores/useWeatherStore';
import { useFoodStore } from '../stores/useFoodStore';
import { usePreferencesStore } from '../stores/usePreferencesStore';

export function useDataPipeline() {
  const locationStatus = useLocationStore((s) => s.status);
  const location = useLocationStore((s) => s.location);
  const requestLocation = useLocationStore((s) => s.requestLocation);

  const weatherStatus = useWeatherStore((s) => s.status);
  const weather = useWeatherStore((s) => s.weather);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);

  const foodStatus = useFoodStore((s) => s.status);
  const fetchSuggestions = useFoodStore((s) => s.fetchSuggestions);
  const refreshSuggestions = useFoodStore((s) => s.refreshSuggestions);

  const preferences = usePreferencesStore((s) => s.preferences);

  const prevPrefsRef = useRef({
    diet: preferences.dietPreference,
    health: preferences.healthGoal,
    language: preferences.language,
  });

  // Start the pipeline: request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // When location loads -> fetch weather
  useEffect(() => {
    if (locationStatus === 'loaded' && location) {
      fetchWeather(location);
    }
  }, [locationStatus, location]);

  // When weather loads -> fetch food suggestions
  useEffect(() => {
    if (weatherStatus === 'loaded' && weather && location) {
      fetchSuggestions(weather, location, preferences);
    }
  }, [weatherStatus, weather, location]);

  // When preferences change -> re-fetch food suggestions
  useEffect(() => {
    const prev = prevPrefsRef.current;
    const changed =
      prev.diet !== preferences.dietPreference ||
      prev.health !== preferences.healthGoal ||
      prev.language !== preferences.language;

    if (changed && weather && location) {
      prevPrefsRef.current = {
        diet: preferences.dietPreference,
        health: preferences.healthGoal,
        language: preferences.language,
      };
      refreshSuggestions(weather, location, preferences);
    }
  }, [preferences.dietPreference, preferences.healthGoal, preferences.language]);
}
