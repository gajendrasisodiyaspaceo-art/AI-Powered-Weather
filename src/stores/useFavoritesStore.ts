import { create } from 'zustand';
import { FoodSuggestion } from '../models/FoodSuggestion';
import * as supabaseService from '../services/supabaseService';

type Status = 'initial' | 'loaded';

interface FavoritesState {
  status: Status;
  favorites: FoodSuggestion[];
  loadFavorites: () => Promise<void>;
  toggleFavorite: (suggestion: FoodSuggestion) => Promise<void>;
  removeFavorite: (name: string) => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  isFavorite: (name: string) => boolean;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  status: 'initial',
  favorites: [],

  loadFavorites: async () => {
    const favorites = await supabaseService.loadFavorites();
    set({ status: 'loaded', favorites });
  },

  toggleFavorite: async (suggestion: FoodSuggestion) => {
    const current = get().favorites;
    const exists = current.some((f) => f.name === suggestion.name);

    if (exists) {
      // Remove: optimistic update then DB call
      const updated = current.filter((f) => f.name !== suggestion.name);
      set({ favorites: updated });
      await supabaseService.removeFavorite(suggestion.name);
    } else {
      // Add: optimistic update then DB call
      set({ favorites: [...current, suggestion] });
      await supabaseService.saveFavorite(suggestion);
    }
  },

  removeFavorite: async (name: string) => {
    const updated = get().favorites.filter((f) => f.name !== name);
    set({ favorites: updated });
    await supabaseService.removeFavorite(name);
  },

  clearAllFavorites: async () => {
    set({ favorites: [] });
    await supabaseService.clearAllFavorites();
  },

  isFavorite: (name: string) => {
    return get().favorites.some((f) => f.name === name);
  },

  reset: () => {
    set({ status: 'initial', favorites: [] });
  },
}));
