import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, locationDataFromJson, locationDataToJson } from '../models/LocationData';

const KEYS = {
  SELECTED_LOCATION: 'selected_location',
  CACHED_WEATHER: 'cached_weather',
  SEARCH_HISTORY: 'search_history',
};

// Selected location
export async function saveSelectedLocation(location: LocationData): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_LOCATION, JSON.stringify(locationDataToJson(location)));
}

export async function loadSelectedLocation(): Promise<LocationData | null> {
  const json = await AsyncStorage.getItem(KEYS.SELECTED_LOCATION);
  if (!json) return null;
  return locationDataFromJson(JSON.parse(json));
}

export async function clearSelectedLocation(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SELECTED_LOCATION);
}

// Weather cache
export async function cacheWeatherData(weatherJson: any): Promise<void> {
  const cacheData = {
    data: weatherJson,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(KEYS.CACHED_WEATHER, JSON.stringify(cacheData));
}

export async function getCachedWeather(staleMinutes: number = 30): Promise<any | null> {
  const cached = await AsyncStorage.getItem(KEYS.CACHED_WEATHER);
  if (!cached) return null;
  const cacheData = JSON.parse(cached);
  const timestamp = cacheData.timestamp as number;
  if (Date.now() - timestamp > staleMinutes * 60 * 1000) return null;
  return cacheData.data;
}

// Search history
export async function addSearchHistory(location: LocationData): Promise<void> {
  const history = await loadSearchHistory();
  const filtered = history.filter(
    (l) => l.city.toLowerCase() !== location.city.toLowerCase()
  );
  filtered.unshift(location);
  const trimmed = filtered.slice(0, 5);
  const jsonList = trimmed.map((l) => JSON.stringify(locationDataToJson(l)));
  await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(jsonList));
}

export async function loadSearchHistory(): Promise<LocationData[]> {
  const raw = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
  if (!raw) return [];
  const jsonList: string[] = JSON.parse(raw);
  return jsonList.map((s) => locationDataFromJson(JSON.parse(s)));
}

export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
}

// Clear only app-specific keys (not Supabase session tokens)
export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.SELECTED_LOCATION,
    KEYS.CACHED_WEATHER,
    KEYS.SEARCH_HISTORY,
  ]);
}
