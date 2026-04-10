import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FoodSuggestion, getShareText } from '../models/FoodSuggestion';
import { getCategoryColor } from '../utils/helpers';
import { AppColors } from '../config/colors';
import { AppTextStyles } from '../config/typography';
import { useAppTheme } from '../hooks/useAppTheme';

interface FoodCardProps {
  suggestion: FoodSuggestion;
  isFavorite?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
}

export function FoodCard({
  suggestion,
  isFavorite = false,
  onTap,
  onLongPress,
}: FoodCardProps) {
  const theme = useAppTheme();
  const categoryColor = getCategoryColor(suggestion.category);

  const handleShare = () => {
    Share.share({ message: getShareText(suggestion) });
  };

  return (
    <Pressable onPress={onTap} onLongPress={onLongPress} style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
              },
              android: { elevation: 2 },
            }),
          },
        ]}
      >
        <View style={styles.topRow}>
          <Text style={styles.emoji}>{suggestion.emoji}</Text>
          <View style={styles.topIcons}>
            <Pressable onPress={handleShare}>
              <MaterialIcons name="share" size={16} color={theme.onSurfaceVariant} />
            </Pressable>
            {isFavorite && (
              <MaterialIcons
                name="favorite"
                size={18}
                color={AppColors.error}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
        </View>

        <Text
          style={[styles.name, { color: theme.onSurface }]}
          numberOfLines={1}
        >
          {suggestion.name}
        </Text>

        {suggestion.nameHindi ? (
          <Text
            style={[AppTextStyles.hindiSmall, { color: theme.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {suggestion.nameHindi}
          </Text>
        ) : null}

        <View style={[styles.categoryChip, { backgroundColor: categoryColor + '1A' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {suggestion.category}
          </Text>
        </View>

        <Text
          style={[AppTextStyles.bodySmall, { color: theme.onSurface, marginTop: 6 }]}
          numberOfLines={2}
        >
          {suggestion.description}
        </Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="timer" size={12} color={theme.onSurfaceVariant} />
          <Text style={[AppTextStyles.labelSmall, { color: theme.onSurfaceVariant, marginLeft: 4 }]}>
            {suggestion.prepTime}
          </Text>
          <MaterialIcons
            name="signal-cellular-alt"
            size={12}
            color={theme.onSurfaceVariant}
            style={{ marginLeft: 8 }}
          />
          <Text style={[AppTextStyles.labelSmall, { color: theme.onSurfaceVariant, marginLeft: 4 }]}>
            {suggestion.difficulty}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[AppTextStyles.labelSmall, { color: theme.onSurfaceVariant }]}>
            {suggestion.caloriesApprox} cal
          </Text>
          {suggestion.isHealthy && (
            <View style={[styles.healthyBadge, { backgroundColor: AppColors.healthyBadge + '1A' }]}>
              <Text style={styles.healthyText}>🌿 Healthy</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginTop: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  categoryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  healthyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  healthyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 9,
    color: AppColors.healthyBadge,
  },
});
