import { create } from 'zustand';
import { FoodSuggestion } from '../models/FoodSuggestion';
import * as storageService from '../services/storageService';

type Status = 'initial' | 'loaded';

interface FavoritesState {
  status: Status;
  favorites: FoodSuggestion[];
  loadFavorites: () => Promise<void>;
  toggleFavorite: (suggestion: FoodSuggestion) => Promise<void>;
  removeFavorite: (name: string) => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  isFavorite: (name: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  status: 'initial',
  favorites: [],

  loadFavorites: async () => {
    const favorites = await storageService.loadFavorites();
    set({ status: 'loaded', favorites });
  },

  toggleFavorite: async (suggestion: FoodSuggestion) => {
    const current = get().favorites;
    const exists = current.some((f) => f.name === suggestion.name);
    const updated = exists
      ? current.filter((f) => f.name !== suggestion.name)
      : [...current, suggestion];
    await storageService.saveFavorites(updated);
    set({ favorites: updated });
  },

  removeFavorite: async (name: string) => {
    const updated = get().favorites.filter((f) => f.name !== name);
    await storageService.saveFavorites(updated);
    set({ favorites: updated });
  },

  clearAllFavorites: async () => {
    await storageService.saveFavorites([]);
    set({ favorites: [] });
  },

  isFavorite: (name: string) => {
    return get().favorites.some((f) => f.name === name);
  },
}));
