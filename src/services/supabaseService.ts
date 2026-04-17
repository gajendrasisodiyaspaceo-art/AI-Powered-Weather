import { supabase } from '../config/supabase';
import { UserPreferences, defaultPreferences, userPreferencesFromJson, userPreferencesToJson } from '../models/UserPreferences';
import { FoodSuggestion, foodSuggestionFromJson, foodSuggestionToJson } from '../models/FoodSuggestion';

// ---- Helpers ----

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ---- User Preferences ----

export async function loadPreferences(): Promise<UserPreferences> {
  const userId = await getCurrentUserId();
  if (!userId) return defaultPreferences;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return defaultPreferences;

  return userPreferencesFromJson(data);
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const json = userPreferencesToJson(preferences);
  await supabase
    .from('user_preferences')
    .update({
      ...json,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

// ---- Favorites ----

export async function loadFavorites(): Promise<FoodSuggestion[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => foodSuggestionFromJson(row));
}

export async function saveFavorite(suggestion: FoodSuggestion): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const json = foodSuggestionToJson(suggestion);
  await supabase.from('user_favorites').upsert(
    {
      user_id: userId,
      ...json,
    },
    { onConflict: 'user_id,name' }
  );
}

export async function removeFavorite(name: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('name', name);
}

export async function clearAllFavorites(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId);
}
