import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../src/config/colors';
import { useAppTheme } from '../src/hooks/useAppTheme';

export default function PermissionScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeniedForever, setIsDeniedForever] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        setIsRequesting(false);
        return;
      }

      let { status } = await Location.getForegroundPermissionsAsync();

      if (status === 'denied') {
        const result = await Location.requestForegroundPermissionsAsync();
        status = result.status;
      }

      if (status === 'granted') {
        router.replace('/(tabs)');
      } else {
        setIsDeniedForever(true);
        setIsRequesting(false);
      }
    } catch {
      setIsRequesting(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const skip = () => {
    router.replace('/(tabs)');
  };

  const features = [
    { icon: 'cloud' as const, text: 'Weather-based food suggestions' },
    { icon: 'restaurant' as const, text: 'Local cuisine recommendations' },
    { icon: 'shield' as const, text: 'Your location is never shared' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flex: 2 }} />

      <Animated.View
        style={[
          styles.iconCircle,
          {
            backgroundColor: AppColors.primary + '1A',
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialIcons name="location-on" size={56} color={AppColors.primary} />
      </Animated.View>

      <Text style={[styles.title, { color: theme.onSurface }]}>
        {isDeniedForever ? 'Location Access Blocked' : 'Enable Location'}
      </Text>

      <Text style={[styles.description, { color: theme.onSurfaceVariant }]}>
        {isDeniedForever
          ? "You've permanently denied location access. Please open Settings and allow location permission for MausamChef."
          : 'MausamChef uses your location to check the weather and suggest the perfect food for your area.'}
      </Text>

      {!isDeniedForever &&
        features.map((feat, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: AppColors.primary + '1A' }]}>
              <MaterialIcons name={feat.icon} size={20} color={AppColors.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.onSurface }]}>
              {feat.text}
            </Text>
          </View>
        ))}

      <View style={{ flex: 3 }} />

      <Pressable
        onPress={isRequesting ? undefined : isDeniedForever ? openSettings : requestPermission}
        style={[
          styles.primaryButton,
          {
            backgroundColor: isRequesting
              ? AppColors.primary + '80'
              : AppColors.primary,
          },
        ]}
      >
        {isRequesting ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {isDeniedForever ? 'Open Settings' : 'Allow Location Access'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={skip} style={styles.skipButton}>
        <Text style={[styles.skipText, { color: theme.onSurfaceVariant }]}>
          {isDeniedForever ? 'Continue without location' : 'Skip for now'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 32,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  featureIcon: {
    padding: 8,
    borderRadius: 10,
  },
  featureText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginLeft: 14,
    flex: 1,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  skipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
});
