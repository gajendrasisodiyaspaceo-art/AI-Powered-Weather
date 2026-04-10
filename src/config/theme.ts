import { AppColors } from './colors';

export interface AppThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  surfaceContainerHighest: string;
  error: string;
  isDark: boolean;
}

export const LightTheme: AppThemeColors = {
  background: AppColors.background,
  surface: AppColors.surface,
  surfaceVariant: AppColors.surfaceVariant,
  primary: AppColors.primary,
  primaryLight: AppColors.primaryLight,
  primaryDark: AppColors.primaryDark,
  onPrimary: '#FFFFFF',
  onSurface: AppColors.textPrimary,
  onSurfaceVariant: AppColors.textSecondary,
  outlineVariant: '#D1D5DB',
  surfaceContainerHighest: '#E5E7EB',
  error: AppColors.error,
  isDark: false,
};

export const DarkTheme: AppThemeColors = {
  background: AppColors.darkBackground,
  surface: AppColors.darkSurface,
  surfaceVariant: AppColors.darkSurfaceVariant,
  primary: AppColors.primary,
  primaryLight: AppColors.primaryLight,
  primaryDark: AppColors.primaryDark,
  onPrimary: '#FFFFFF',
  onSurface: AppColors.darkTextPrimary,
  onSurfaceVariant: AppColors.darkTextSecondary,
  outlineVariant: AppColors.darkOutlineVariant,
  surfaceContainerHighest: '#383838',
  error: AppColors.error,
  isDark: true,
};
