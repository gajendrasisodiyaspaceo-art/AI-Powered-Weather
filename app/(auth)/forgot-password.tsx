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
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../../src/config/colors';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await resetPassword(trimmedEmail);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? 'Failed to send reset email');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={theme.onSurface} />
      </Pressable>

      {sent ? (
        /* Success state */
        <View style={styles.centeredContent}>
          <View
            style={[styles.iconCircle, { backgroundColor: AppColors.success + '1A' }]}
          >
            <MaterialIcons name="mark-email-read" size={56} color={AppColors.success} />
          </View>
          <Text style={[styles.title, { color: theme.onSurface, textAlign: 'center' }]}>
            Check Your Email
          </Text>
          <Text
            style={[
              styles.description,
              { color: theme.onSurfaceVariant, textAlign: 'center' },
            ]}
          >
            We've sent a password reset link to{'\n'}
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{email.trim()}</Text>
          </Text>
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            style={[styles.primaryButton, { backgroundColor: AppColors.primary }]}
          >
            <Text style={styles.primaryButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      ) : (
        /* Form state */
        <View style={styles.centeredContent}>
          <View
            style={[styles.iconCircle, { backgroundColor: AppColors.primary + '1A' }]}
          >
            <MaterialIcons name="lock-reset" size={56} color={AppColors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.onSurface }]}>Reset Password</Text>
          <Text style={[styles.description, { color: theme.onSurfaceVariant }]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Email input */}
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

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Send button */}
          <Pressable
            onPress={loading ? undefined : handleReset}
            style={[
              styles.primaryButton,
              { backgroundColor: loading ? AppColors.primary + '80' : AppColors.primary },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Link</Text>
            )}
          </Pressable>

          {/* Back to login */}
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: theme.onSurfaceVariant }]}>
              Back to Login
            </Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  backButton: {
    marginTop: 36,
    padding: 8,
    alignSelf: 'flex-start',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 12,
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
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  linkButton: {
    paddingVertical: 16,
  },
  linkText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
});
