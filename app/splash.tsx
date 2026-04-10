import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { AppColors } from '../src/config/colors';
import { AppConstants } from '../src/config/constants';
import { usePreferencesStore } from '../src/stores/usePreferencesStore';

export default function SplashScreen() {
  const router = useRouter();
  const preferences = usePreferencesStore((s) => s.preferences);
  const status = usePreferencesStore((s) => s.status);

  useEffect(() => {
    const navigate = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (status === 'loaded' && preferences.hasCompletedOnboarding) {
        const { status: permStatus } = await Location.getForegroundPermissionsAsync();
        if (permStatus === 'granted') {
          router.replace('/(tabs)');
        } else {
          router.replace('/permission');
        }
      } else {
        router.replace('/onboarding');
      }
    };

    if (status === 'loaded' || status === 'initial') {
      // Small delay to allow preferences to load
      const timer = setTimeout(navigate, 100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <LinearGradient
      colors={[AppColors.primary, AppColors.primaryDark]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('../assets/lottie/cooking.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <Text style={styles.appName}>{AppConstants.appName}</Text>
      <Text style={styles.tagline}>{AppConstants.appTagline}</Text>

      <ActivityIndicator
        size="small"
        color="#FFFFFF"
        style={styles.loader}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    width: 200,
    height: 200,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
    color: '#FFFFFF',
    marginTop: 24,
  },
  tagline: {
    fontFamily: 'NotoSansDevanagari_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  loader: {
    marginTop: 48,
  },
});
