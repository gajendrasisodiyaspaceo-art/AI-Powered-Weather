import { create } from 'zustand';
import { UserPreferences, defaultPreferences } from '../models/UserPreferences';
import * as supabaseService from '../services/supabaseService';

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
  reset: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  status: 'initial',
  preferences: defaultPreferences,

  loadPreferences: async () => {
    const prefs = await supabaseService.loadPreferences();
    set({ status: 'loaded', preferences: prefs });
  },

  updateDietPreference: async (diet: string) => {
    const updated = { ...get().preferences, dietPreference: diet };
    set({ preferences: updated });
    await supabaseService.savePreferences(updated);
  },

  updateHealthGoal: async (goal: string) => {
    const updated = { ...get().preferences, healthGoal: goal };
    set({ preferences: updated });
    await supabaseService.savePreferences(updated);
  },

  updateTempUnit: async (unit: string) => {
    const updated = { ...get().preferences, temperatureUnit: unit };
    set({ preferences: updated });
    await supabaseService.savePreferences(updated);
  },

  updateLanguage: async (lang: string) => {
    const updated = { ...get().preferences, language: lang };
    set({ preferences: updated });
    await supabaseService.savePreferences(updated);
  },

  completeOnboarding: async () => {
    const updated = { ...get().preferences, hasCompletedOnboarding: true };
    set({ preferences: updated });
    await supabaseService.savePreferences(updated);
  },

  updateThemeMode: async (isDark: boolean) => {
    const updated = { ...get().preferences, isDarkMode: isDark };
    set({ preferences: updated });
    await supabaseService.savePreferences(updated);
  },

  reset: () => {
    set({ status: 'initial', preferences: defaultPreferences });
  },
}));
