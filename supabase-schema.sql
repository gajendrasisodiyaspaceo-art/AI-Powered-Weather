-- Run this in Supabase Dashboard > SQL Editor
-- Also disable "Enable email confirmations" in Authentication > Email Auth settings

-- 1. User Preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_preference TEXT NOT NULL DEFAULT 'Everything',
  health_goal TEXT NOT NULL DEFAULT 'No Preference',
  temperature_unit TEXT NOT NULL DEFAULT 'Celsius',
  language TEXT NOT NULL DEFAULT 'English',
  has_completed_onboarding BOOLEAN NOT NULL DEFAULT false,
  is_dark_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. User Favorites table
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_hindi TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Main Course',
  description TEXT NOT NULL DEFAULT '',
  why_now TEXT NOT NULL DEFAULT '',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  prep_time TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Easy',
  calories_approx INTEGER NOT NULL DEFAULT 0,
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  recipe_search_query TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Auto-create preferences row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
