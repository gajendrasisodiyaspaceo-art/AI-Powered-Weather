import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface CategoryFilterChipsProps {
  activeCategory: string;
  onCategorySelected: (category: string) => void;
}

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks', 'Dessert'];

export function CategoryFilterChips({
  activeCategory,
  onCategorySelected,
}: CategoryFilterChipsProps) {
  const theme = useAppTheme();

  return (
    <FlatList
      horizontal
      data={CATEGORIES}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.listContent}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      renderItem={({ item }) => {
        const isActive = item === activeCategory;
        return (
          <Pressable
            onPress={() => onCategorySelected(item)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? theme.primary : theme.surface,
                borderColor: isActive ? theme.primary : theme.outlineVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive ? theme.onPrimary : theme.onSurfaceVariant,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    height: 40,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
});
