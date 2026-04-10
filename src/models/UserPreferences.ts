export interface UserPreferences {
  dietPreference: string;
  healthGoal: string;
  temperatureUnit: string;
  language: string;
  hasCompletedOnboarding: boolean;
  isDarkMode: boolean;
}

export const defaultPreferences: UserPreferences = {
  dietPreference: 'Everything',
  healthGoal: 'No Preference',
  temperatureUnit: 'Celsius',
  language: 'English',
  hasCompletedOnboarding: false,
  isDarkMode: false,
};

export function userPreferencesFromJson(json: any): UserPreferences {
  return {
    dietPreference: json.diet_preference ?? 'Everything',
    healthGoal: json.health_goal ?? 'No Preference',
    temperatureUnit: json.temperature_unit ?? 'Celsius',
    language: json.language ?? 'English',
    hasCompletedOnboarding: json.has_completed_onboarding ?? false,
    isDarkMode: json.is_dark_mode ?? false,
  };
}

export function userPreferencesToJson(prefs: UserPreferences): any {
  return {
    diet_preference: prefs.dietPreference,
    health_goal: prefs.healthGoal,
    temperature_unit: prefs.temperatureUnit,
    language: prefs.language,
    has_completed_onboarding: prefs.hasCompletedOnboarding,
    is_dark_mode: prefs.isDarkMode,
  };
}
