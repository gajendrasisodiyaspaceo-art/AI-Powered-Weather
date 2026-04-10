import { usePreferencesStore } from '../stores/usePreferencesStore';
import { LightTheme, DarkTheme, AppThemeColors } from '../config/theme';

export function useAppTheme(): AppThemeColors {
  const isDarkMode = usePreferencesStore((state) => state.preferences.isDarkMode);
  return isDarkMode ? DarkTheme : LightTheme;
}
