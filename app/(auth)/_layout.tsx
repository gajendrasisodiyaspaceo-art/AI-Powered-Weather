import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { usePreferencesStore } from '../../src/stores/usePreferencesStore';

export default function AuthLayout() {
  const authStatus = useAuthStore((s) => s.status);
  const preferencesStatus = usePreferencesStore((s) => s.status);
  const hasCompletedOnboarding = usePreferencesStore(
    (s) => s.preferences.hasCompletedOnboarding
  );

  if (authStatus === 'authenticated') {
    if (preferencesStatus !== 'loaded') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (hasCompletedOnboarding) {
      return <Redirect href="/(tabs)" />;
    }
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
