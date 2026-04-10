import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FoodSuggestion } from '../../src/models/FoodSuggestion';
import { getCategoryColor } from '../../src/utils/helpers';
import { AppColors } from '../../src/config/colors';
import { AppTextStyles } from '../../src/config/typography';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useFavoritesStore } from '../../src/stores/useFavoritesStore';
import { FoodDetailSheet } from '../../src/components/FoodDetailSheet';

function FavoriteItem({
  item,
  index,
  onTap,
  onDelete,
}: {
  item: FoodSuggestion;
  index: number;
  onTap: () => void;
  onDelete: () => void;
}) {
  const theme = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: 50 * index,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: 50 * index,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const categoryColor = getCategoryColor(item.category);

  const renderRightActions = () => (
    <View style={[styles.deleteBackground, { backgroundColor: AppColors.error + '1A' }]}>
      <MaterialIcons name="delete-outline" size={24} color={AppColors.error} />
    </View>
  );

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}
    >
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete();
        }}
      >
        <Pressable onPress={onTap}>
          <View
            style={[
              styles.itemContainer,
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
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.textColumn}>
              <Text style={[AppTextStyles.titleMedium, { color: theme.onSurface }]}>
                {item.name}
              </Text>
              {item.nameHindi ? (
                <Text style={[AppTextStyles.hindiSmall, { color: theme.onSurfaceVariant }]}>
                  {item.nameHindi}
                </Text>
              ) : null}
              <View style={[styles.categoryChip, { backgroundColor: categoryColor + '1A' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {item.category}
                </Text>
              </View>
            </View>
            <MaterialIcons name="favorite" size={20} color={AppColors.error} />
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

export default function FavoritesScreen() {
  const theme = useAppTheme();
  const favorites = useFavoritesStore((s) => s.favorites);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[AppTextStyles.headlineMedium, { color: theme.onSurface }]}>
            Favorites
          </Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={[AppTextStyles.titleLarge, { color: theme.onSurface }]}>
            No favorites yet!
          </Text>
          <Text style={[AppTextStyles.bodySmall, { color: theme.onSurfaceVariant, marginTop: 8 }]}>
            Long press on any food card to save it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[AppTextStyles.headlineMedium, { color: theme.onSurface }]}>
          Favorites
        </Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <FavoriteItem
            item={item}
            index={index}
            onTap={() => setSelectedFood(item)}
            onDelete={() => removeFavorite(item.name)}
          />
        )}
      />
      {selectedFood && (
        <FoodDetailSheet
          suggestion={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
  },
  textColumn: {
    flex: 1,
    marginLeft: 16,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  deleteBackground: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
    borderRadius: 16,
    marginBottom: 12,
    width: 80,
  },
});
