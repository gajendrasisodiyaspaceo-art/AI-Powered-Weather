import { create } from 'zustand';
import { LocationData } from '../models/LocationData';
import * as locationService from '../services/locationService';
import * as storageService from '../services/storageService';

type Status = 'initial' | 'loading' | 'loaded' | 'error';

interface LocationState {
  status: Status;
  location: LocationData | null;
  error: string | null;
  requestLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  setManualLocation: (cityName: string) => Promise<void>;
  useGpsLocation: () => Promise<void>;
  selectHistoryLocation: (location: LocationData) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  status: 'initial',
  location: null,
  error: null,

  requestLocation: async () => {
    set({ status: 'loading', error: null });
    try {
      const saved = await storageService.loadSelectedLocation();
      if (saved) {
        set({ status: 'loaded', location: saved });
        return;
      }
      const location = await locationService.getCurrentLocation();
      set({ status: 'loaded', location });
    } catch (e: any) {
      set({ status: 'error', error: e.message ?? 'Failed to get location' });
    }
  },

  refreshLocation: async () => {
    set({ status: 'loading', error: null });
    try {
      const saved = await storageService.loadSelectedLocation();
      if (saved) {
        set({ status: 'loaded', location: saved });
        return;
      }
      const location = await locationService.getCurrentLocation();
      set({ status: 'loaded', location });
    } catch (e: any) {
      set({ status: 'error', error: e.message ?? 'Failed to get location' });
    }
  },

  setManualLocation: async (cityName: string) => {
    set({ status: 'loading', error: null });
    try {
      const location = await locationService.getLocationFromCity(cityName);
      await storageService.saveSelectedLocation(location);
      await storageService.addSearchHistory(location);
      set({ status: 'loaded', location });
    } catch (e: any) {
      set({
        status: 'error',
        error: e.message ?? `Could not find city "${cityName}"`,
      });
    }
  },

  useGpsLocation: async () => {
    set({ status: 'loading', error: null });
    try {
      await storageService.clearSelectedLocation();
      const location = await locationService.getCurrentLocation();
      set({ status: 'loaded', location });
    } catch (e: any) {
      set({ status: 'error', error: e.message ?? 'Failed to get location' });
    }
  },

  selectHistoryLocation: async (location: LocationData) => {
    set({ status: 'loading', error: null });
    await storageService.saveSelectedLocation(location);
    set({ status: 'loaded', location });
  },
}));
