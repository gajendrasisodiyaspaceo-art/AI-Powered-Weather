import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../config/colors';
import { AppTextStyles } from '../config/typography';
import { useAppTheme } from '../hooks/useAppTheme';

export type ErrorType = 'noInternet' | 'locationDenied' | 'apiError' | 'generic';

interface ErrorDisplayProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
}

function getIcon(type: ErrorType): keyof typeof MaterialIcons.glyphMap {
  switch (type) {
    case 'noInternet':
      return 'wifi-off';
    case 'locationDenied':
      return 'location-off';
    case 'apiError':
      return 'cloud-off';
    case 'generic':
      return 'error-outline';
  }
}

function getTitle(type: ErrorType): string {
  switch (type) {
    case 'noInternet':
      return 'No Internet Connection';
    case 'locationDenied':
      return 'Location Access Needed';
    case 'apiError':
      return 'Oops! Something went wrong';
    case 'generic':
      return 'Something went wrong';
  }
}

function getDefaultMessage(type: ErrorType): string {
  switch (type) {
    case 'noInternet':
      return 'Please check your internet connection and try again.';
    case 'locationDenied':
      return 'We need your location to suggest weather-based food. Please enable location access in settings.';
    case 'apiError':
      return "We're having trouble getting your food suggestions. Don't worry, we have some backup options!";
    case 'generic':
      return 'An unexpected error occurred. Please try again.';
  }
}

export function ErrorDisplay({
  type = 'generic',
  message,
  onRetry,
}: ErrorDisplayProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('../../assets/lottie/error.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <Text style={[styles.title, AppTextStyles.titleLarge, { color: theme.onSurface }]}>
        {getTitle(type)}
      </Text>
      <Text
        style={[
          styles.message,
          AppTextStyles.bodyMedium,
          { color: theme.onSurfaceVariant },
        ]}
      >
        {message ?? getDefaultMessage(type)}
      </Text>

      {type === 'locationDenied' ? (
        <>
          <Pressable
            onPress={() => Linking.openSettings()}
            style={[styles.primaryButton, { backgroundColor: AppColors.primary }]}
          >
            <MaterialIcons name="settings" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </Pressable>
          {onRetry && (
            <Pressable
              onPress={onRetry}
              style={[styles.outlineButton, { borderColor: AppColors.primary }]}
            >
              <MaterialIcons name="refresh" size={18} color={AppColors.primary} />
              <Text style={[styles.outlineButtonText, { color: AppColors.primary }]}>
                Try Again
              </Text>
            </Pressable>
          )}
        </>
      ) : onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.primaryButton, { backgroundColor: AppColors.primary }]}
        >
          <MaterialIcons name="refresh" size={18} color="#FFF" />
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 32,
  },
  lottieContainer: {
    width: 120,
    height: 120,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  outlineButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
});
