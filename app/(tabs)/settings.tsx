import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors } from '../../src/config/colors';
import { AppConstants } from '../../src/config/constants';
import { AppTextStyles } from '../../src/config/typography';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { usePreferencesStore } from '../../src/stores/usePreferencesStore';
import { useFavoritesStore } from '../../src/stores/useFavoritesStore';

function ChipGroup({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? AppColors.primary + '1A' : theme.surface,
                borderColor: isSelected ? AppColors.primary : theme.outlineVariant,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? AppColors.primary : theme.onSurface,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const preferences = usePreferencesStore((s) => s.preferences);
  const {
    updateDietPreference,
    updateHealthGoal,
    updateTempUnit,
    updateLanguage,
    updateThemeMode,
  } = usePreferencesStore();
  const clearAllFavorites = useFavoritesStore((s) => s.clearAllFavorites);

  const handleClearFavorites = () => {
    Alert.alert('Clear Favorites', 'Are you sure you want to remove all saved favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => clearAllFavorites(),
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[AppTextStyles.headlineMedium, { color: theme.onSurface }]}>
          Settings
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <MaterialIcons name="account-circle" size={48} color={AppColors.primary} />
          <View style={styles.profileInfo}>
            <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
              {user?.email ?? 'User'}
            </Text>
            <Text style={[AppTextStyles.bodySmall, { color: theme.onSurfaceVariant }]}>
              Signed in
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />

        {/* Diet Preference */}
        <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
          Diet Preference
        </Text>
        <View style={{ height: 12 }} />
        <ChipGroup
          options={['Veg', 'Non-Veg', 'Vegan', 'Everything']}
          selected={preferences.dietPreference}
          onSelect={updateDietPreference}
        />

        <View style={{ height: 24 }} />

        {/* Health Goal */}
        <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
          Health Goal
        </Text>
        <View style={{ height: 12 }} />
        <ChipGroup
          options={['Weight Loss', 'Muscle Gain', 'Balanced', 'No Preference']}
          selected={preferences.healthGoal}
          onSelect={updateHealthGoal}
        />

        <View style={{ height: 24 }} />

        {/* Temperature Unit */}
        <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
          Temperature Unit
        </Text>
        <View style={{ height: 12 }} />
        <ChipGroup
          options={['Celsius', 'Fahrenheit']}
          selected={preferences.temperatureUnit}
          onSelect={updateTempUnit}
        />

        <View style={{ height: 24 }} />

        {/* Language */}
        <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
          Language
        </Text>
        <View style={{ height: 12 }} />
        <ChipGroup
          options={['English', 'Hindi']}
          selected={preferences.language}
          onSelect={updateLanguage}
        />

        <View style={{ height: 24 }} />

        {/* Dark Mode */}
        <View style={[styles.darkModeRow, { backgroundColor: theme.surface }]}>
          <MaterialIcons
            name={preferences.isDarkMode ? 'dark-mode' : 'light-mode'}
            size={24}
            color={AppColors.primary}
          />
          <Text style={[styles.darkModeText, { color: theme.onSurface }]}>
            Dark Mode
          </Text>
          <Switch
            value={preferences.isDarkMode}
            onValueChange={updateThemeMode}
            trackColor={{ true: AppColors.primary, false: theme.outlineVariant }}
          />
        </View>

        <View style={{ height: 32 }} />

        {/* Clear Favorites */}
        <Pressable
          onPress={handleClearFavorites}
          style={[styles.clearButton, { borderColor: AppColors.error }]}
        >
          <MaterialIcons name="delete-outline" size={20} color={AppColors.error} />
          <Text style={[styles.clearButtonText, { color: AppColors.error }]}>
            Clear All Favorites
          </Text>
        </Pressable>

        <View style={{ height: 12 }} />

        {/* Log Out */}
        <Pressable
          onPress={handleLogout}
          style={[styles.clearButton, { borderColor: AppColors.error }]}
        >
          <MaterialIcons name="logout" size={20} color={AppColors.error} />
          <Text style={[styles.clearButtonText, { color: AppColors.error }]}>
            Log Out
          </Text>
        </Pressable>

        <View style={{ height: 32 }} />

        {/* About */}
        <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
          About
        </Text>
        <View style={{ height: 12 }} />
        <View style={[styles.aboutBox, { backgroundColor: theme.surface }]}>
          <Text style={[AppTextStyles.titleLarge, { color: AppColors.primary }]}>
            {AppConstants.appName}
          </Text>
          <Text style={[AppTextStyles.hindiBody, { color: theme.onSurfaceVariant, marginTop: 4 }]}>
            {AppConstants.appTagline}
          </Text>
          <Text style={[AppTextStyles.bodySmall, { color: theme.onSurfaceVariant, marginTop: 8 }]}>
            v1.0.0
          </Text>
          <Text
            style={[
              AppTextStyles.bodySmall,
              { color: theme.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
            ]}
          >
            AI-powered food suggestions based on{'\n'}weather, location & your preferences
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  scrollContent: {
    padding: 16,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  darkModeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  clearButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  aboutBox: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
});
