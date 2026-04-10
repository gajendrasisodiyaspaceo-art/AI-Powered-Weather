import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FoodSuggestion } from '../models/FoodSuggestion';
import { FoodCard } from './FoodCard';
import { useFavoritesStore } from '../stores/useFavoritesStore';

interface FoodGridProps {
  suggestions: FoodSuggestion[];
  onCardTap?: (suggestion: FoodSuggestion) => void;
}

function GridCard({
  item,
  onTap,
  cardWidth,
}: {
  item: FoodSuggestion;
  onTap: () => void;
  cardWidth: number;
}) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(item.name));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <View style={{ width: cardWidth }}>
      <FoodCard
        suggestion={item}
        isFavorite={isFavorite}
        onTap={onTap}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          toggleFavorite(item);
        }}
      />
    </View>
  );
}

export function FoodGrid({ suggestions, onCardTap }: FoodGridProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 12) / 2; // paddingHorizontal 16*2 + gap 12

  return (
    <View style={styles.grid}>
      {suggestions.map((item, index) => (
        <GridCard
          key={item.name + index}
          item={item}
          onTap={() => onCardTap?.(item)}
          cardWidth={cardWidth}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
});
