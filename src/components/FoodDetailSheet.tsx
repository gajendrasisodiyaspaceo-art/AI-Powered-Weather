import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Share, Linking } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FoodSuggestion, getShareText } from '../models/FoodSuggestion';
import { getCategoryColor } from '../utils/helpers';
import { AppColors } from '../config/colors';
import { AppTextStyles } from '../config/typography';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFavoritesStore } from '../stores/useFavoritesStore';

interface FoodDetailSheetProps {
  suggestion: FoodSuggestion | null;
  onClose: () => void;
}

export function FoodDetailSheet({ suggestion, onClose }: FoodDetailSheetProps) {
  const theme = useAppTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%', '95%'], []);
  const isFavorite = useFavoritesStore((s) =>
    suggestion ? s.isFavorite(suggestion.name) : false
  );
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose]
  );

  if (!suggestion) return null;

  const categoryColor = getCategoryColor(suggestion.category);

  const openYouTubeRecipe = () => {
    const query = encodeURIComponent(suggestion.recipeSearchQuery);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  };

  const handleShare = () => {
    Share.share({ message: getShareText(suggestion) });
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(suggestion);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.outlineVariant }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Emoji + Name */}
        <View style={styles.headerRow}>
          <Text style={styles.emoji}>{suggestion.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={[AppTextStyles.headlineMedium, { color: theme.onSurface }]}>
              {suggestion.name}
            </Text>
            {suggestion.nameHindi ? (
              <Text style={[AppTextStyles.hindiBody, { color: theme.onSurfaceVariant }]}>
                {suggestion.nameHindi}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Info chips */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: categoryColor + '1A' }]}>
            <Text style={[styles.chipText, { color: categoryColor }]}>
              {suggestion.category}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: theme.surfaceContainerHighest }]}>
            <Text style={[styles.chipText, { color: theme.onSurfaceVariant }]}>
              {suggestion.prepTime}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: theme.surfaceContainerHighest }]}>
            <Text style={[styles.chipText, { color: theme.onSurfaceVariant }]}>
              {suggestion.difficulty}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface, marginTop: 20 }]}>
          Description
        </Text>
        <Text style={[AppTextStyles.bodyMedium, { color: theme.onSurface, marginTop: 8 }]}>
          {suggestion.description}
        </Text>

        {/* Why Now */}
        {suggestion.whyNow ? (
          <View style={[styles.whyNowBox, { backgroundColor: AppColors.primary + '14' }]}>
            <Text style={styles.lightBulb}>💡</Text>
            <Text
              style={[
                styles.whyNowText,
                { color: theme.primary },
              ]}
            >
              {suggestion.whyNow}
            </Text>
          </View>
        ) : null}

        {/* Ingredients */}
        {suggestion.ingredients.length > 0 && (
          <>
            <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface, marginTop: 16 }]}>
              Ingredients
            </Text>
            <View style={styles.ingredientsWrap}>
              {suggestion.ingredients.map((ing, i) => (
                <View
                  key={i}
                  style={[
                    styles.ingredientTag,
                    { backgroundColor: theme.surfaceContainerHighest },
                  ]}
                >
                  <Text style={[AppTextStyles.bodySmall, { color: theme.onSurface }]}>
                    {ing}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Calories + Healthy */}
        <View style={styles.caloriesRow}>
          <MaterialIcons name="local-fire-department" size={20} color={AppColors.warning} />
          <Text style={[AppTextStyles.bodyMedium, { color: theme.onSurface, marginLeft: 4 }]}>
            {suggestion.caloriesApprox} calories (approx)
          </Text>
          {suggestion.isHealthy && (
            <View
              style={[
                styles.healthyBadge,
                { backgroundColor: AppColors.healthyBadge + '1A' },
              ]}
            >
              <Text style={styles.healthyText}>🌿 Healthy</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={openYouTubeRecipe}
            style={[styles.watchButton, { backgroundColor: AppColors.error }]}
          >
            <MaterialIcons name="play-circle-outline" size={20} color="#FFF" />
            <Text style={styles.watchButtonText}>Watch Recipe</Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={[styles.iconButton, { backgroundColor: theme.surfaceContainerHighest }]}
          >
            <MaterialIcons name="share" size={20} color={theme.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={handleFavorite}
            style={[
              styles.iconButton,
              {
                backgroundColor: isFavorite
                  ? AppColors.error + '1A'
                  : theme.surfaceContainerHighest,
              },
            ]}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? AppColors.error : theme.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  whyNowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  lightBulb: {
    fontSize: 20,
  },
  whyNowText: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginLeft: 8,
  },
  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  ingredientTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  healthyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  healthyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: AppColors.healthyBadge,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  watchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  watchButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  iconButton: {
    padding: 14,
    borderRadius: 12,
  },
});
