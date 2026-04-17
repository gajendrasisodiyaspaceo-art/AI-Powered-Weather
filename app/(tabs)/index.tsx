import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDataPipeline } from '../../src/hooks/useDataPipeline';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useLocationStore } from '../../src/stores/useLocationStore';
import { useWeatherStore } from '../../src/stores/useWeatherStore';
import { useFoodStore } from '../../src/stores/useFoodStore';
import { usePreferencesStore } from '../../src/stores/usePreferencesStore';
import { getTimeOfDayLabel, getMealContext } from '../../src/utils/timeHelper';
import { dailySummaries } from '../../src/models/ForecastData';
import { FoodSuggestion } from '../../src/models/FoodSuggestion';
import { AppColors } from '../../src/config/colors';
import { AppTextStyles } from '../../src/config/typography';

import { WeatherHeroCard } from '../../src/components/WeatherHeroCard';
import { ForecastRow } from '../../src/components/ForecastRow';
import { AiMessageCard } from '../../src/components/AiMessageCard';
import { CategoryFilterChips } from '../../src/components/CategoryFilterChips';
import { FoodGrid } from '../../src/components/FoodGrid';
import { FoodDetailSheet } from '../../src/components/FoodDetailSheet';
import { CitySearchSheet } from '../../src/components/CitySearchSheet';
import { ShimmerWeatherCard, ShimmerFoodGrid } from '../../src/components/LoadingShimmer';
import { ErrorDisplay } from '../../src/components/ErrorDisplay';

export default function HomeScreen() {
  const theme = useAppTheme();
  useDataPipeline();

  const locationStatus = useLocationStore((s) => s.status);
  const location = useLocationStore((s) => s.location);
  const locationError = useLocationStore((s) => s.error);
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const refreshLocation = useLocationStore((s) => s.refreshLocation);

  const weatherStatus = useWeatherStore((s) => s.status);
  const weather = useWeatherStore((s) => s.weather);
  const forecast = useWeatherStore((s) => s.forecast);
  const weatherError = useWeatherStore((s) => s.error);

  const foodStatus = useFoodStore((s) => s.status);
  const foodMessage = useFoodStore((s) => s.message);
  const filteredSuggestions = useFoodStore((s) => s.filteredSuggestions);
  const activeCategory = useFoodStore((s) => s.activeCategory);
  const foodError = useFoodStore((s) => s.error);
  const fallbackSuggestions = useFoodStore((s) => s.fallbackSuggestions);
  const filterByCategory = useFoodStore((s) => s.filterByCategory);
  const refreshSuggestions = useFoodStore((s) => s.refreshSuggestions);

  const preferences = usePreferencesStore((s) => s.preferences);

  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await refreshLocation();
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const forecastSummaries =
    forecast ? dailySummaries(forecast) : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* App bar */}
        <View style={styles.appBar}>
          <View style={styles.appBarText}>
            <Text style={[AppTextStyles.headlineMedium, { color: theme.onSurface }]}>
              {getTimeOfDayLabel()}
            </Text>
            <Text style={[AppTextStyles.bodySmall, { color: theme.onSurfaceVariant }]}>
              {getMealContext()} ke liye kya khaayein?
            </Text>
          </View>
          <Pressable onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color={theme.primary} />
          </Pressable>
        </View>

        {/* Weather section */}
        {weatherStatus === 'loading' || locationStatus === 'loading' ? (
          <ShimmerWeatherCard />
        ) : weatherStatus === 'loaded' && weather && location ? (
          <WeatherHeroCard
            weather={weather}
            location={location}
            temperatureUnit={preferences.temperatureUnit}
            onLocationPress={() => setShowCitySearch(true)}
          />
        ) : locationStatus === 'error' ? (
          <View style={{ padding: 16 }}>
            <ErrorDisplay
              type="locationDenied"
              message={locationError ?? undefined}
              onRetry={requestLocation}
            />
          </View>
        ) : weatherStatus === 'error' ? (
          <View
            style={[
              styles.inlineError,
              { backgroundColor: AppColors.error + '14', borderColor: AppColors.error + '33' },
            ]}
          >
            <MaterialIcons name="cloud-off" size={40} color={AppColors.error} />
            <Text style={[styles.errorText, { color: AppColors.error }]}>
              {weatherError}
            </Text>
            <Pressable
              onPress={() => refreshLocation()}
              style={styles.retryRow}
            >
              <MaterialIcons name="refresh" size={18} color={theme.primary} />
              <Text style={[styles.retryText, { color: theme.primary }]}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ShimmerWeatherCard />
        )}

        {/* 5-Day Forecast */}
        {weatherStatus === 'loaded' && forecastSummaries.length > 0 && (
          <ForecastRow
            dailySummaries={forecastSummaries}
            temperatureUnit={preferences.temperatureUnit}
          />
        )}

        {/* AI Message */}
        {foodStatus === 'loading' ? (
          <View style={styles.aiLoadingRow}>
            <Text style={styles.robotEmoji}>🤖</Text>
            <Text style={[styles.aiLoadingText, { color: theme.onSurfaceVariant }]}>
              AI soch raha hai...
            </Text>
          </View>
        ) : foodStatus === 'loaded' ? (
          <AiMessageCard message={foodMessage} />
        ) : foodStatus === 'error' && fallbackSuggestions ? (
          <View
            style={[styles.warningBox, { backgroundColor: AppColors.warning + '1A' }]}
          >
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text style={[styles.warningText, { color: AppColors.warning }]}>
              AI unavailable, showing curated suggestions!
            </Text>
          </View>
        ) : null}

        {/* Category filter */}
        {foodStatus === 'loaded' && (
          <CategoryFilterChips
            activeCategory={activeCategory}
            onCategorySelected={filterByCategory}
          />
        )}

        <View style={{ height: 12 }} />

        {/* Food grid */}
        {foodStatus === 'loading' ? (
          <ShimmerFoodGrid />
        ) : foodStatus === 'loaded' ? (
          filteredSuggestions.length === 0 ? (
            <View style={styles.emptyCategory}>
              <Text style={[AppTextStyles.bodyMedium, { color: theme.onSurfaceVariant }]}>
                No items in this category
              </Text>
            </View>
          ) : (
            <FoodGrid
              suggestions={filteredSuggestions}
              onCardTap={(item) => setSelectedFood(item)}
            />
          )
        ) : foodStatus === 'error' && fallbackSuggestions ? (
          <FoodGrid
            suggestions={fallbackSuggestions}
            onCardTap={(item) => setSelectedFood(item)}
          />
        ) : foodStatus === 'error' ? (
          <View style={{ padding: 16 }}>
            <ErrorDisplay
              type="apiError"
              message={foodError ?? undefined}
              onRetry={() => {
                if (weather && location) {
                  refreshSuggestions(weather, location, preferences);
                }
              }}
            />
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Food detail bottom sheet */}
      {selectedFood && (
        <FoodDetailSheet
          suggestion={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

      {/* City search bottom sheet */}
      <CitySearchSheet
        visible={showCitySearch}
        onClose={() => setShowCitySearch(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  appBarText: {
    flex: 1,
  },
  inlineError: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  retryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  robotEmoji: {
    fontSize: 20,
  },
  aiLoadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  warningText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    flex: 1,
  },
  emptyCategory: {
    alignItems: 'center',
    padding: 32,
  },
});
