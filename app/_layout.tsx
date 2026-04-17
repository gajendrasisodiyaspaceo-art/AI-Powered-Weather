import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { NotoSansDevanagari_400Regular } from '@expo-google-fonts/noto-sans-devanagari';

import { useAuthStore } from '../src/stores/useAuthStore';
import { usePreferencesStore } from '../src/stores/usePreferencesStore';
import { useFavoritesStore } from '../src/stores/useFavoritesStore';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    NotoSansDevanagari_400Regular,
  });

  const authStatus = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);
  const loadPreferences = usePreferencesStore((s) => s.loadPreferences);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);
  const isDarkMode = usePreferencesStore((s) => s.preferences.isDarkMode);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  // Load user data only when authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      loadPreferences();
      loadFavorites();
    }
  }, [authStatus]);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="permission" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
