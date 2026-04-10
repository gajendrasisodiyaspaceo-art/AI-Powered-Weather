import { create } from 'zustand';
import { UserPreferences, defaultPreferences } from '../models/UserPreferences';
import * as storageService from '../services/storageService';

type Status = 'initial' | 'loaded';

interface PreferencesState {
  status: Status;
  preferences: UserPreferences;
  loadPreferences: () => Promise<void>;
  updateDietPreference: (diet: string) => Promise<void>;
  updateHealthGoal: (goal: string) => Promise<void>;
  updateTempUnit: (unit: string) => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateThemeMode: (isDark: boolean) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  status: 'initial',
  preferences: defaultPreferences,

  loadPreferences: async () => {
    const prefs = await storageService.loadPreferences();
    set({ status: 'loaded', preferences: prefs });
  },

  updateDietPreference: async (diet: string) => {
    const updated = { ...get().preferences, dietPreference: diet };
    await storageService.savePreferences(updated);
    set({ preferences: updated });
  },

  updateHealthGoal: async (goal: string) => {
    const updated = { ...get().preferences, healthGoal: goal };
    await storageService.savePreferences(updated);
    set({ preferences: updated });
  },

  updateTempUnit: async (unit: string) => {
    const updated = { ...get().preferences, temperatureUnit: unit };
    await storageService.savePreferences(updated);
    set({ preferences: updated });
  },

  updateLanguage: async (lang: string) => {
    const updated = { ...get().preferences, language: lang };
    await storageService.savePreferences(updated);
    set({ preferences: updated });
  },

  completeOnboarding: async () => {
    const updated = { ...get().preferences, hasCompletedOnboarding: true };
    await storageService.savePreferences(updated);
    set({ preferences: updated });
  },

  updateThemeMode: async (isDark: boolean) => {
    const updated = { ...get().preferences, isDarkMode: isDark };
    await storageService.savePreferences(updated);
    set({ preferences: updated });
  },
}));
