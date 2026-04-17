import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../../src/config/colors';
import { AppConstants } from '../../src/config/constants';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await signIn(trimmedEmail, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1 }} />

        {/* Branding */}
        <View style={styles.brandingSection}>
          <Text style={[styles.appName, { color: AppColors.primary }]}>
            {AppConstants.appName}
          </Text>
          <Text style={[styles.tagline, { color: theme.onSurfaceVariant }]}>
            {AppConstants.appTagline}
          </Text>
        </View>

        <Text style={[styles.title, { color: theme.onSurface }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.onSurfaceVariant }]}>
          Sign in to continue
        </Text>

        {/* Email */}
        <View
          style={[
            styles.inputContainer,
            { borderColor: theme.outlineVariant, backgroundColor: theme.surface },
          ]}
        >
          <MaterialIcons name="email" size={20} color={theme.onSurfaceVariant} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.onSurfaceVariant}
            style={[styles.input, { color: theme.onSurface }]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password */}
        <View
          style={[
            styles.inputContainer,
            { borderColor: theme.outlineVariant, backgroundColor: theme.surface },
          ]}
        >
          <MaterialIcons name="lock" size={20} color={theme.onSurfaceVariant} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.onSurfaceVariant}
            style={[styles.input, { color: theme.onSurface }]}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color={theme.onSurfaceVariant}
            />
          </Pressable>
        </View>

        {/* Forgot Password */}
        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotButton}
        >
          <Text style={[styles.forgotText, { color: AppColors.primary }]}>
            Forgot Password?
          </Text>
        </Pressable>

        {/* Error */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Login Button */}
        <Pressable
          onPress={loading ? undefined : handleLogin}
          style={[
            styles.primaryButton,
            { backgroundColor: loading ? AppColors.primary + '80' : AppColors.primary },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </Pressable>

        <View style={{ flex: 2 }} />

        {/* Sign Up Link */}
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: theme.onSurfaceVariant }]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/signup')}>
            <Text style={[styles.bottomLink, { color: AppColors.primary }]}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
  },
  tagline: {
    fontFamily: 'NotoSansDevanagari_400Regular',
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 12,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: AppColors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  bottomText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  bottomLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
});
