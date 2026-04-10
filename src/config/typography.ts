import { TextStyle, Platform } from 'react-native';

const poppins = (weight: string) =>
  Platform.select({
    ios: 'Poppins_' + weight,
    android: 'Poppins_' + weight,
    default: 'Poppins_' + weight,
  }) || 'Poppins_400Regular';

export const AppTextStyles: Record<string, TextStyle> = {
  headlineLarge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
  },
  headlineMedium: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
  },
  titleLarge: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },
  titleMedium: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  bodyLarge: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },
  bodyMedium: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  bodySmall: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  labelLarge: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  labelSmall: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  // Hindi text styles
  hindiBody: {
    fontFamily: 'NotoSansDevanagari_400Regular',
    fontSize: 14,
  },
  hindiSmall: {
    fontFamily: 'NotoSansDevanagari_400Regular',
    fontSize: 12,
  },
  // Temperature display
  temperatureLarge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 48,
    color: '#FFFFFF',
  },
  temperatureSmall: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
};
