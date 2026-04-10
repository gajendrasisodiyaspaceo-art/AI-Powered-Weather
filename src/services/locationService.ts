import * as Location from 'expo-location';
import axios from 'axios';
import { LocationData } from '../models/LocationData';
import { AppConstants } from '../config/constants';

export class LocationServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationServiceException';
  }
}

export async function checkPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

export async function requestPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function isLocationServiceEnabled(): Promise<boolean> {
  return await Location.hasServicesEnabledAsync();
}

export async function getCurrentLocation(): Promise<LocationData> {
  const serviceEnabled = await isLocationServiceEnabled();
  if (!serviceEnabled) {
    throw new LocationServiceException(
      'Location services are disabled. Please enable them in settings.'
    );
  }

  const hasPermission = await checkPermission();
  if (!hasPermission) {
    const granted = await requestPermission();
    if (!granted) {
      throw new LocationServiceException(
        'Location permission denied. Please allow location access.'
      );
    }
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 15000,
  });

  let city = '';
  let state = '';
  let country = '';

  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    if (reverseGeocode.length > 0) {
      const place = reverseGeocode[0];
      city = place.city ?? place.subregion ?? '';
      state = place.region ?? '';
      country = place.country ?? '';
    }
  } catch {
    // Try OpenWeatherMap geocoding as fallback
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse`,
        {
          params: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            limit: 1,
            appid: AppConstants.openWeatherMapApiKey,
          },
        }
      );
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        city = result.name ?? '';
        state = result.state ?? '';
        country = result.country ?? '';
      }
    } catch {
      // Geocoding failed; we still have coordinates
    }
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    city,
    state,
    country,
  };
}

export async function getLocationFromCity(cityName: string): Promise<LocationData> {
  // Try expo-location geocoding first
  try {
    const locations = await Location.geocodeAsync(cityName);
    if (locations.length > 0) {
      const loc = locations[0];
      let city = cityName;
      let state = '';
      let country = '';

      try {
        const placemarks = await Location.reverseGeocodeAsync({
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
        if (placemarks.length > 0) {
          const place = placemarks[0];
          city = place.city ?? place.subregion ?? cityName;
          state = place.region ?? '';
          country = place.country ?? '';
        }
      } catch {
        // Reverse geocoding failed; use search term as city name
      }

      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        city,
        state,
        country,
      };
    }
  } catch {
    // expo-location geocoding failed, try OpenWeatherMap
  }

  // Fallback: OpenWeatherMap geocoding API
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct`,
      {
        params: {
          q: cityName,
          limit: 1,
          appid: AppConstants.openWeatherMapApiKey,
        },
      }
    );
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: result.lat,
        longitude: result.lon,
        city: result.name ?? cityName,
        state: result.state ?? '',
        country: result.country ?? '',
      };
    }
  } catch {
    // OpenWeatherMap geocoding also failed
  }

  throw new LocationServiceException(`No results found for "${cityName}"`);
}
