export const AppConstants = {
  openWeatherMapApiKey: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  groqApiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  groqBaseUrl: 'https://api.groq.com/openai/v1/chat/completions',
  groqModel: 'llama-3.3-70b-versatile',
  appName: 'MausamChef',
  appTagline: 'Weather pe depend karta hai khaana!',
  weatherCacheMinutes: 30,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};
