import axios from 'axios';
import { AppConstants } from '../config/constants';
import { FoodSuggestion, foodSuggestionFromJson } from '../models/FoodSuggestion';
import { WeatherData } from '../models/WeatherData';
import { LocationData } from '../models/LocationData';
import { UserPreferences } from '../models/UserPreferences';
import { getTimeOfDay, getMealContext } from '../utils/timeHelper';

export interface AiFoodResponse {
  message: string;
  suggestions: FoodSuggestion[];
}

export class AiFoodServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiFoodServiceException';
  }
}

// In-memory cache
let cachedSuggestions: FoodSuggestion[] | null = null;
let cachedMessage: string | null = null;
let lastCacheKey: string | null = null;

const NON_FOOD_EMOJIS = new Set([
  '\u{1F53A}', '\u{1F53B}', '\u{1F535}', '\u{1F534}', '\u{1F4A7}', '\u{1F374}', '\u{1F37D}\u{FE0F}', '\u{1F944}', '\u{1F52A}', '\u{1F3E0}', '\u{2B50}',
  '\u{2728}', '\u{1F4AB}', '\u{1F389}', '\u{1F38A}', '\u{2764}\u{FE0F}', '\u{1F49B}', '\u{1F49A}', '\u{1F90E}', '\u{1F468}\u{200D}\u{1F373}', '\u{1F469}\u{200D}\u{1F373}',
]);

const CATEGORY_FALLBACK_EMOJI: Record<string, string> = {
  Drinks: '\u{1F375}',
  'Main Course': '\u{1F35B}',
  Lunch: '\u{1F35B}',
  Dinner: '\u{1F372}',
  Snacks: '\u{1F9C6}',
  Dessert: '\u{1F36E}',
  Breakfast: '\u{1F95E}',
};

function sanitizeEmoji(item: FoodSuggestion): FoodSuggestion {
  if (!item.emoji || NON_FOOD_EMOJIS.has(item.emoji)) {
    const fallback = CATEGORY_FALLBACK_EMOJI[item.category] ?? '\u{1F37D}\u{FE0F}';
    return { ...item, emoji: fallback };
  }
  return item;
}

function buildPrompt(weather: WeatherData, location: LocationData, preferences: UserPreferences): string {
  const timeOfDay = getTimeOfDay();
  const mealContext = getMealContext();

  return `You are MausamChef, an AI food recommendation engine for India. Based on the current weather, location, time of day, and user preferences, suggest exactly 12 food items.

CURRENT CONTEXT:
- Location: ${location.city}, ${location.state}, ${location.country}
- Weather: ${weather.weatherCondition} (${weather.weatherDescription})
- Temperature: ${Math.round(weather.tempCelsius)}\u00B0C (Feels like: ${Math.round(weather.feelsLike)}\u00B0C)
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} m/s
- Time of Day: ${timeOfDay} (${mealContext} time)
- Diet Preference: ${preferences.dietPreference}
- Health Goal: ${preferences.healthGoal}

REQUIREMENTS:
- Suggest foods that are popular in ${location.city}/${location.state} region
- Consider the weather: hot weather \u2192 cooling foods/drinks, cold \u2192 warm/comfort food, rainy \u2192 pakoras/chai type items
- Time-appropriate: breakfast items for morning, heavy meals for lunch/dinner, snacks for snack time
- Respect diet preference: ${preferences.dietPreference}
- Consider health goal: ${preferences.healthGoal}
- Breakfast: light morning foods like poha, upma, idli, paratha, dosa etc.
- Lunch: full meals like thali, rice dishes, dal-roti, biryani etc.
- Dinner: slightly lighter but complete meals like khichdi, soup with roti, paneer dishes etc.

RESPONSE FORMAT (JSON only, no markdown):
{
  "message": "A fun Hinglish message about today's weather and food mood (1-2 sentences)",
  "suggestions": [
    {
      "name": "English name",
      "name_hindi": "Hindi name",
      "emoji": "single food emoji that visually represents this dish (use: \u{1F35B} for curries/gravies, \u{1F372} for soups/stews, \u{1F35C} for noodles, \u{1F958} for rice dishes/biryanis, \u{1F35A} for plain rice items, \u{1FAD3} for rotis/parathas/flatbreads, \u{1F95F} for dumplings/momos/samosas, \u{1F9C6} for fried snacks/pakoras/vadas, \u{1F957} for chaats/salads, \u{1F375} for tea/hot drinks, \u2615 for coffee, \u{1F95B} for lassi/milk drinks, \u{1F9C3} for juices/cold drinks, \u{1F366} for kulfi/ice cream, \u{1F36E} for halwa/puddings, \u{1F369} for gulab jamun/round sweets, \u{1F36A} for cookies/biscuits, \u{1F95E} for dosa/pancakes/cheela, \u{1F373} for egg dishes, \u{1F357} for chicken, \u{1F356} for meat)",
      "category": "Breakfast|Lunch|Dinner|Snacks|Drinks|Dessert",
      "description": "Brief appetizing description in Hinglish",
      "why_now": "Why this food fits current weather/time",
      "ingredients": ["key", "ingredients", "list"],
      "prep_time": "15 mins",
      "difficulty": "Easy|Medium|Hard",
      "calories_approx": 250,
      "is_healthy": true,
      "recipe_search_query": "search query for YouTube recipe"
    }
  ]
}

Provide exactly: 2 Breakfast, 2 Lunch, 2 Dinner, 2 Snacks, 2 Drinks, 2 Dessert.
Return ONLY valid JSON, no other text.`;
}

function parseResponse(content: string): AiFoodResponse {
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.substring(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.substring(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.substring(0, jsonStr.length - 3);
  }
  jsonStr = jsonStr.trim();

  const decoded = JSON.parse(jsonStr);
  const message = decoded.message ?? 'Aaj ke liye kuch special suggestions!';
  const items = decoded.suggestions ?? [];

  const suggestions: FoodSuggestion[] = items
    .map((item: any) => foodSuggestionFromJson(item))
    .map(sanitizeEmoji);

  return { message, suggestions };
}

export async function fetchSuggestions(
  weather: WeatherData,
  location: LocationData,
  preferences: UserPreferences
): Promise<AiFoodResponse> {
  const cacheKey = `${location.city}_${weather.weatherCondition}_${Math.round(weather.tempCelsius)}_${getTimeOfDay()}_${preferences.dietPreference}`;

  if (lastCacheKey === cacheKey && cachedSuggestions) {
    return { message: cachedMessage ?? '', suggestions: cachedSuggestions };
  }

  try {
    const prompt = buildPrompt(weather, location, preferences);

    const response = await axios.post(
      AppConstants.groqBaseUrl,
      {
        model: AppConstants.groqModel,
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are MausamChef, an AI food recommendation engine. Always respond with valid JSON only, no markdown or extra text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AppConstants.groqApiKey}`,
        },
      }
    );

    const content = response.data.choices[0].message.content as string;
    const parsed = parseResponse(content);

    cachedSuggestions = parsed.suggestions;
    cachedMessage = parsed.message;
    lastCacheKey = cacheKey;

    return parsed;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new AiFoodServiceException('Invalid Groq API key.');
    }
    throw new AiFoodServiceException(
      `Failed to get food suggestions: ${error.message}`
    );
  }
}

export function clearCache(): void {
  cachedSuggestions = null;
  cachedMessage = null;
  lastCacheKey = null;
}

// Static fallback suggestions
export function getFallbackSuggestions(weatherCondition: string): AiFoodResponse {
  const condition = weatherCondition.toLowerCase();
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
    return rainyFallback;
  } else if (condition.includes('snow') || condition.includes('cold')) {
    return coldFallback;
  } else if (condition.includes('clear')) {
    return hotFallback;
  }
  return moderateFallback;
}

const rainyFallback: AiFoodResponse = {
  message: 'Baarish ka mausam hai! Pakode aur chai ka time! \u2614\u{1F375}',
  suggestions: [
    { name: 'Poha', nameHindi: '\u092A\u094B\u0939\u093E', emoji: '\u{1F35A}', category: 'Breakfast', description: 'Light fluffy poha with peanuts aur sev', whyNow: 'Light breakfast for a rainy morning', ingredients: ['Flattened rice', 'Peanuts', 'Onions', 'Turmeric', 'Curry leaves'], prepTime: '15 mins', difficulty: 'Easy', caloriesApprox: 250, isHealthy: true, recipeSearchQuery: 'poha recipe' },
    { name: 'Bread Pakora', nameHindi: '\u092C\u094D\u0930\u0947\u0921 \u092A\u0915\u094B\u0921\u093C\u093E', emoji: '\u{1F9C6}', category: 'Breakfast', description: 'Crispy bread pakora with mint chutney', whyNow: 'Perfect baarish wala breakfast', ingredients: ['Bread', 'Besan', 'Potatoes', 'Green chili', 'Spices'], prepTime: '20 mins', difficulty: 'Easy', caloriesApprox: 300, isHealthy: false, recipeSearchQuery: 'bread pakora recipe' },
    { name: 'Rajma Chawal', nameHindi: '\u0930\u093E\u091C\u092E\u093E \u091A\u093E\u0935\u0932', emoji: '\u{1F35B}', category: 'Lunch', description: 'Hearty rajma with steamed rice aur pyaaz', whyNow: 'Warm filling lunch for rainy day', ingredients: ['Kidney beans', 'Rice', 'Onions', 'Tomatoes', 'Spices'], prepTime: '45 mins', difficulty: 'Medium', caloriesApprox: 450, isHealthy: true, recipeSearchQuery: 'rajma chawal recipe' },
    { name: 'Chole Bhature', nameHindi: '\u091B\u094B\u0932\u0947 \u092D\u091F\u0942\u0930\u0947', emoji: '\u{1FAD3}', category: 'Lunch', description: 'Spicy chole with fluffy bhature', whyNow: 'Comfort lunch when its pouring outside', ingredients: ['Chickpeas', 'Flour', 'Yogurt', 'Onions', 'Spices'], prepTime: '50 mins', difficulty: 'Medium', caloriesApprox: 550, isHealthy: false, recipeSearchQuery: 'chole bhature recipe' },
    { name: 'Khichdi', nameHindi: '\u0916\u093F\u091A\u0921\u093C\u0940', emoji: '\u{1F35A}', category: 'Dinner', description: 'Comforting dal khichdi with ghee tadka', whyNow: 'Warm comfort food for rainy evenings', ingredients: ['Rice', 'Moong dal', 'Ghee', 'Spices'], prepTime: '30 mins', difficulty: 'Easy', caloriesApprox: 350, isHealthy: true, recipeSearchQuery: 'dal khichdi recipe' },
    { name: 'Maggi Noodles', nameHindi: '\u092E\u0948\u0917\u0940', emoji: '\u{1F35C}', category: 'Dinner', description: 'Quick and comforting Maggi with extra veggies', whyNow: 'Comfort food for cozy rainy nights', ingredients: ['Maggi', 'Vegetables', 'Spices'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 300, isHealthy: false, recipeSearchQuery: 'maggi noodles recipe' },
    { name: 'Pakora', nameHindi: '\u092A\u0915\u094B\u0921\u093C\u093E', emoji: '\u{1F9C6}', category: 'Snacks', description: 'Crispy pyaaz ke pakode, baarish ki jodi', whyNow: 'Rainy weather classic snack', ingredients: ['Onions', 'Besan', 'Green chili', 'Spices'], prepTime: '20 mins', difficulty: 'Easy', caloriesApprox: 200, isHealthy: false, recipeSearchQuery: 'onion pakora recipe' },
    { name: 'Samosa', nameHindi: '\u0938\u092E\u094B\u0938\u093E', emoji: '\u{1F95F}', category: 'Snacks', description: 'Crispy samosa with spicy aloo filling', whyNow: 'Baarish + samosa = perfect combo', ingredients: ['Potatoes', 'Peas', 'Flour', 'Spices'], prepTime: '45 mins', difficulty: 'Medium', caloriesApprox: 250, isHealthy: false, recipeSearchQuery: 'samosa recipe' },
    { name: 'Masala Chai', nameHindi: '\u092E\u0938\u093E\u0932\u093E \u091A\u093E\u092F', emoji: '\u{1F375}', category: 'Drinks', description: 'Garam masaledar chai for the perfect rainy day', whyNow: 'Nothing beats hot chai in the rain', ingredients: ['Tea leaves', 'Milk', 'Ginger', 'Cardamom', 'Sugar'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 80, isHealthy: true, recipeSearchQuery: 'masala chai recipe' },
    { name: 'Filter Coffee', nameHindi: '\u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u0915\u0949\u092B\u093C\u0940', emoji: '\u2615', category: 'Drinks', description: 'Strong South Indian filter coffee', whyNow: 'Garam coffee for baarish ka mausam', ingredients: ['Coffee powder', 'Milk', 'Sugar'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 90, isHealthy: true, recipeSearchQuery: 'south indian filter coffee recipe' },
    { name: 'Jalebi', nameHindi: '\u091C\u0932\u0947\u092C\u0940', emoji: '\u{1F369}', category: 'Dessert', description: 'Crispy hot jalebi dripping with syrup', whyNow: 'Garam jalebi baarish mein toh best hai', ingredients: ['Flour', 'Yogurt', 'Sugar', 'Saffron'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 300, isHealthy: false, recipeSearchQuery: 'jalebi recipe' },
    { name: 'Gulab Jamun', nameHindi: '\u0917\u0941\u0932\u093E\u092C \u091C\u093E\u092E\u0941\u0928', emoji: '\u{1F369}', category: 'Dessert', description: 'Soft gulab jamun in warm sugar syrup', whyNow: 'Sweet treat for a cozy rainy evening', ingredients: ['Khoya', 'Flour', 'Sugar', 'Cardamom', 'Rose water'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 300, isHealthy: false, recipeSearchQuery: 'gulab jamun recipe' },
  ],
};

const hotFallback: AiFoodResponse = {
  message: 'Garmi bahut hai! Thanda thanda cool cool khaate hain! \u{1F31E}\u{1F9CA}',
  suggestions: [
    { name: 'Idli Sambhar', nameHindi: '\u0907\u0921\u0932\u0940 \u0938\u093E\u0902\u092D\u0930', emoji: '\u{1F95E}', category: 'Breakfast', description: 'Soft idli with tangy sambhar aur chutney', whyNow: 'Light breakfast for a hot morning', ingredients: ['Rice batter', 'Urad dal', 'Lentils', 'Vegetables', 'Spices'], prepTime: '20 mins', difficulty: 'Easy', caloriesApprox: 200, isHealthy: true, recipeSearchQuery: 'idli sambhar recipe' },
    { name: 'Fruit Bowl', nameHindi: '\u092B\u094D\u0930\u0942\u091F \u092C\u093E\u0909\u0932', emoji: '\u{1F957}', category: 'Breakfast', description: 'Fresh seasonal fruits with honey drizzle', whyNow: 'Refreshing and light start to a hot day', ingredients: ['Mango', 'Watermelon', 'Banana', 'Pomegranate', 'Honey'], prepTime: '5 mins', difficulty: 'Easy', caloriesApprox: 150, isHealthy: true, recipeSearchQuery: 'indian fruit bowl recipe' },
    { name: 'Curd Rice', nameHindi: '\u0926\u0939\u0940 \u091A\u093E\u0935\u0932', emoji: '\u{1F35A}', category: 'Lunch', description: 'Cool curd rice with tempering', whyNow: 'Cooling and easy to digest in heat', ingredients: ['Rice', 'Curd', 'Mustard seeds', 'Curry leaves'], prepTime: '15 mins', difficulty: 'Easy', caloriesApprox: 250, isHealthy: true, recipeSearchQuery: 'curd rice recipe' },
    { name: 'Veg Thali', nameHindi: '\u0935\u0947\u091C \u0925\u093E\u0932\u0940', emoji: '\u{1F35B}', category: 'Lunch', description: 'Complete thali with dal, sabzi, roti, rice', whyNow: 'Balanced lunch even in the heat', ingredients: ['Dal', 'Seasonal vegetables', 'Roti', 'Rice', 'Salad'], prepTime: '40 mins', difficulty: 'Medium', caloriesApprox: 500, isHealthy: true, recipeSearchQuery: 'indian veg thali recipe' },
    { name: 'Palak Paneer', nameHindi: '\u092A\u093E\u0932\u0915 \u092A\u0928\u0940\u0930', emoji: '\u{1F35B}', category: 'Dinner', description: 'Creamy spinach curry with soft paneer cubes', whyNow: 'Nutritious light dinner for hot evenings', ingredients: ['Spinach', 'Paneer', 'Onions', 'Cream', 'Spices'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 350, isHealthy: true, recipeSearchQuery: 'palak paneer recipe' },
    { name: 'Moong Dal Cheela', nameHindi: '\u092E\u0942\u0902\u0917 \u0926\u093E\u0932 \u091A\u0940\u0932\u093E', emoji: '\u{1F95E}', category: 'Dinner', description: 'Crispy moong dal cheela with green chutney', whyNow: 'Light protein-rich dinner for garmi', ingredients: ['Moong dal', 'Ginger', 'Green chili', 'Spices'], prepTime: '20 mins', difficulty: 'Easy', caloriesApprox: 200, isHealthy: true, recipeSearchQuery: 'moong dal cheela recipe' },
    { name: 'Pani Puri', nameHindi: '\u092A\u093E\u0928\u0940 \u092A\u0942\u0930\u0940', emoji: '\u{1F957}', category: 'Snacks', description: 'Tangy and spicy pani puri for refreshment', whyNow: 'Tangy flavors beat the heat', ingredients: ['Puris', 'Mint water', 'Tamarind', 'Potatoes'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 150, isHealthy: true, recipeSearchQuery: 'pani puri recipe' },
    { name: 'Cucumber Sandwich', nameHindi: '\u0916\u0940\u0930\u093E \u0938\u0948\u0902\u0921\u0935\u093F\u091A', emoji: '\u{1F957}', category: 'Snacks', description: 'Cool cucumber sandwich with mint mayo', whyNow: 'Light refreshing snack for garmi', ingredients: ['Bread', 'Cucumber', 'Mint', 'Butter', 'Black pepper'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 180, isHealthy: true, recipeSearchQuery: 'cucumber sandwich recipe' },
    { name: 'Lassi', nameHindi: '\u0932\u0938\u094D\u0938\u0940', emoji: '\u{1F95B}', category: 'Drinks', description: 'Thick creamy Punjab ki lassi', whyNow: 'Best cooling drink for hot weather', ingredients: ['Yogurt', 'Sugar', 'Cardamom', 'Ice'], prepTime: '5 mins', difficulty: 'Easy', caloriesApprox: 150, isHealthy: true, recipeSearchQuery: 'punjabi lassi recipe' },
    { name: 'Watermelon Juice', nameHindi: '\u0924\u0930\u092C\u0942\u091C \u0915\u093E \u0930\u0938', emoji: '\u{1F9C3}', category: 'Drinks', description: 'Fresh watermelon juice with mint', whyNow: 'Hydrating and refreshing in the heat', ingredients: ['Watermelon', 'Mint', 'Black salt'], prepTime: '5 mins', difficulty: 'Easy', caloriesApprox: 80, isHealthy: true, recipeSearchQuery: 'watermelon juice recipe' },
    { name: 'Kulfi', nameHindi: '\u0915\u0941\u0932\u094D\u092B\u0940', emoji: '\u{1F366}', category: 'Dessert', description: 'Creamy mango kulfi to beat the heat', whyNow: 'Frozen treat perfect for hot days', ingredients: ['Milk', 'Mango', 'Sugar', 'Cardamom'], prepTime: '4 hours', difficulty: 'Medium', caloriesApprox: 200, isHealthy: false, recipeSearchQuery: 'mango kulfi recipe' },
    { name: 'Aam Ras', nameHindi: '\u0906\u092E \u0930\u0938', emoji: '\u{1F95B}', category: 'Dessert', description: 'Sweet mango puree served chilled', whyNow: 'Summer special mango dessert', ingredients: ['Mango', 'Sugar', 'Cardamom', 'Saffron'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 180, isHealthy: true, recipeSearchQuery: 'aam ras recipe' },
  ],
};

const coldFallback: AiFoodResponse = {
  message: 'Thand bahut hai! Garam garam khaana khate hain! \u{1F976}\u{1F525}',
  suggestions: [
    { name: 'Aloo Paratha', nameHindi: '\u0906\u0932\u0942 \u092A\u0930\u093E\u0920\u093E', emoji: '\u{1FAD3}', category: 'Breakfast', description: 'Stuffed aloo paratha with butter and curd', whyNow: 'Hearty warm breakfast for cold mornings', ingredients: ['Wheat flour', 'Potatoes', 'Spices', 'Butter'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 400, isHealthy: false, recipeSearchQuery: 'aloo paratha recipe' },
    { name: 'Upma', nameHindi: '\u0909\u092A\u092E\u093E', emoji: '\u{1F35A}', category: 'Breakfast', description: 'Hot rava upma with vegetables and cashews', whyNow: 'Warm comforting breakfast for thand', ingredients: ['Semolina', 'Vegetables', 'Mustard seeds', 'Cashews', 'Curry leaves'], prepTime: '15 mins', difficulty: 'Easy', caloriesApprox: 250, isHealthy: true, recipeSearchQuery: 'upma recipe' },
    { name: 'Rajma Chawal', nameHindi: '\u0930\u093E\u091C\u092E\u093E \u091A\u093E\u0935\u0932', emoji: '\u{1F35B}', category: 'Lunch', description: 'Hearty rajma with steamed rice', whyNow: 'Warm filling lunch for cold days', ingredients: ['Kidney beans', 'Rice', 'Onions', 'Tomatoes', 'Spices'], prepTime: '45 mins', difficulty: 'Medium', caloriesApprox: 450, isHealthy: true, recipeSearchQuery: 'rajma chawal recipe' },
    { name: 'Butter Chicken', nameHindi: '\u092C\u091F\u0930 \u091A\u093F\u0915\u0928', emoji: '\u{1F357}', category: 'Lunch', description: 'Rich creamy butter chicken with naan', whyNow: 'Rich heavy lunch to fight the cold', ingredients: ['Chicken', 'Butter', 'Cream', 'Tomatoes', 'Spices'], prepTime: '50 mins', difficulty: 'Medium', caloriesApprox: 550, isHealthy: false, recipeSearchQuery: 'butter chicken recipe' },
    { name: 'Dal Makhani', nameHindi: '\u0926\u093E\u0932 \u092E\u0916\u0928\u0940', emoji: '\u{1F35B}', category: 'Dinner', description: 'Creamy slow-cooked dal makhani with naan', whyNow: 'Rich warm dinner for cold nights', ingredients: ['Black lentils', 'Butter', 'Cream', 'Tomatoes', 'Spices'], prepTime: '45 mins', difficulty: 'Medium', caloriesApprox: 400, isHealthy: false, recipeSearchQuery: 'dal makhani recipe' },
    { name: 'Soup & Roti', nameHindi: '\u0938\u0942\u092A \u0914\u0930 \u0930\u094B\u091F\u0940', emoji: '\u{1F372}', category: 'Dinner', description: 'Hot mixed veg soup with tandoori roti', whyNow: 'Nothing warms you up like garam soup', ingredients: ['Vegetables', 'Cream', 'Wheat flour', 'Spices'], prepTime: '25 mins', difficulty: 'Easy', caloriesApprox: 300, isHealthy: true, recipeSearchQuery: 'mixed veg soup recipe' },
    { name: 'Mathri', nameHindi: '\u092E\u0920\u0930\u0940', emoji: '\u{1F36A}', category: 'Snacks', description: 'Crispy flaky mathri with chai', whyNow: 'Classic winter snack with chai', ingredients: ['Flour', 'Ghee', 'Ajwain', 'Salt'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 200, isHealthy: false, recipeSearchQuery: 'mathri recipe' },
    { name: 'Shakarkandi Chaat', nameHindi: '\u0936\u0915\u0930\u0915\u0902\u0926\u0940 \u091A\u093E\u091F', emoji: '\u{1F957}', category: 'Snacks', description: 'Roasted sweet potato chaat with masala', whyNow: 'Winter special street food snack', ingredients: ['Sweet potato', 'Lemon', 'Chaat masala', 'Green chutney'], prepTime: '20 mins', difficulty: 'Easy', caloriesApprox: 180, isHealthy: true, recipeSearchQuery: 'shakarkandi chaat recipe' },
    { name: 'Hot Chocolate', nameHindi: '\u0939\u0949\u091F \u091A\u0949\u0915\u0932\u0947\u091F', emoji: '\u2615', category: 'Drinks', description: 'Rich creamy hot chocolate', whyNow: 'Warm drink for cold weather', ingredients: ['Milk', 'Cocoa', 'Sugar', 'Cream'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 200, isHealthy: false, recipeSearchQuery: 'hot chocolate recipe' },
    { name: 'Masala Chai', nameHindi: '\u092E\u0938\u093E\u0932\u093E \u091A\u093E\u092F', emoji: '\u{1F375}', category: 'Drinks', description: 'Extra ginger wali kadak chai', whyNow: 'Garam chai for thand ka mausam', ingredients: ['Tea leaves', 'Milk', 'Ginger', 'Cardamom', 'Sugar'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 80, isHealthy: true, recipeSearchQuery: 'masala chai recipe' },
    { name: 'Gajar Halwa', nameHindi: '\u0917\u093E\u091C\u0930 \u0915\u093E \u0939\u0932\u0935\u093E', emoji: '\u{1F36E}', category: 'Dessert', description: 'Warm grated carrot halwa with dry fruits', whyNow: 'Winter special dessert', ingredients: ['Carrots', 'Milk', 'Sugar', 'Ghee', 'Dry fruits'], prepTime: '40 mins', difficulty: 'Medium', caloriesApprox: 350, isHealthy: false, recipeSearchQuery: 'gajar halwa recipe' },
    { name: 'Gond Ladoo', nameHindi: '\u0917\u094B\u0902\u0926 \u0915\u0947 \u0932\u0921\u094D\u0921\u0942', emoji: '\u{1F369}', category: 'Dessert', description: 'Nutritious winter ladoo with gond and dry fruits', whyNow: 'Traditional winter energy booster', ingredients: ['Gond', 'Wheat flour', 'Ghee', 'Dry fruits', 'Jaggery'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 250, isHealthy: true, recipeSearchQuery: 'gond ladoo recipe' },
  ],
};

const moderateFallback: AiFoodResponse = {
  message: 'Mausam sahi hai! Kuch tasty khaate hain! \u{1F60B}\u{1F37D}\u{FE0F}',
  suggestions: [
    { name: 'Dosa', nameHindi: '\u0921\u094B\u0938\u093E', emoji: '\u{1F95E}', category: 'Breakfast', description: 'Crispy golden dosa with sambhar and chutney', whyNow: 'Classic South Indian breakfast', ingredients: ['Rice batter', 'Urad dal', 'Potatoes', 'Spices'], prepTime: '20 mins', difficulty: 'Easy', caloriesApprox: 250, isHealthy: true, recipeSearchQuery: 'masala dosa recipe' },
    { name: 'Paratha with Curd', nameHindi: '\u092A\u0930\u093E\u0920\u093E \u0926\u0939\u0940', emoji: '\u{1FAD3}', category: 'Breakfast', description: 'Stuffed paratha with fresh dahi', whyNow: 'Filling breakfast to start the day right', ingredients: ['Wheat flour', 'Paneer', 'Spices', 'Curd'], prepTime: '25 mins', difficulty: 'Easy', caloriesApprox: 350, isHealthy: true, recipeSearchQuery: 'paneer paratha recipe' },
    { name: 'Biryani', nameHindi: '\u092C\u093F\u0930\u092F\u093E\u0928\u0940', emoji: '\u{1F958}', category: 'Lunch', description: 'Fragrant layered biryani with raita', whyNow: 'Perfect meal for any weather', ingredients: ['Rice', 'Spices', 'Yogurt', 'Onions', 'Herbs'], prepTime: '60 mins', difficulty: 'Hard', caloriesApprox: 500, isHealthy: false, recipeSearchQuery: 'biryani recipe' },
    { name: 'Dal Rice', nameHindi: '\u0926\u093E\u0932 \u091A\u093E\u0935\u0932', emoji: '\u{1F35B}', category: 'Lunch', description: 'Tadkewali dal with jeera rice', whyNow: 'Simple satisfying lunch combo', ingredients: ['Toor dal', 'Rice', 'Ghee', 'Cumin', 'Spices'], prepTime: '30 mins', difficulty: 'Easy', caloriesApprox: 400, isHealthy: true, recipeSearchQuery: 'dal rice recipe' },
    { name: 'Paneer Tikka', nameHindi: '\u092A\u0928\u0940\u0930 \u091F\u093F\u0915\u094D\u0915\u093E', emoji: '\u{1F35B}', category: 'Dinner', description: 'Smoky grilled paneer tikka with mint chutney', whyNow: 'Light yet flavourful dinner option', ingredients: ['Paneer', 'Yogurt', 'Bell peppers', 'Onions', 'Spices'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 300, isHealthy: true, recipeSearchQuery: 'paneer tikka recipe' },
    { name: 'Roti Sabzi', nameHindi: '\u0930\u094B\u091F\u0940 \u0938\u092C\u094D\u091C\u093C\u0940', emoji: '\u{1FAD3}', category: 'Dinner', description: 'Fresh roti with seasonal mix veg sabzi', whyNow: 'Simple homestyle dinner', ingredients: ['Wheat flour', 'Mixed vegetables', 'Spices', 'Oil'], prepTime: '30 mins', difficulty: 'Easy', caloriesApprox: 350, isHealthy: true, recipeSearchQuery: 'roti sabzi recipe' },
    { name: 'Bhel Puri', nameHindi: '\u092D\u0947\u0932 \u092A\u0942\u0930\u0940', emoji: '\u{1F957}', category: 'Snacks', description: 'Tangy crunchy bhel puri chaat', whyNow: 'Light and tasty snack anytime', ingredients: ['Puffed rice', 'Sev', 'Onions', 'Chutneys'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 200, isHealthy: true, recipeSearchQuery: 'bhel puri recipe' },
    { name: 'Vada Pav', nameHindi: '\u0935\u0921\u093C\u093E \u092A\u093E\u0935', emoji: '\u{1F9C6}', category: 'Snacks', description: 'Mumbai style spicy vada pav with chutney', whyNow: 'Iconic snack for any time of day', ingredients: ['Potatoes', 'Besan', 'Pav', 'Garlic chutney', 'Spices'], prepTime: '25 mins', difficulty: 'Medium', caloriesApprox: 300, isHealthy: false, recipeSearchQuery: 'vada pav recipe' },
    { name: 'Masala Chai', nameHindi: '\u092E\u0938\u093E\u0932\u093E \u091A\u093E\u092F', emoji: '\u{1F375}', category: 'Drinks', description: 'Perfect cup of masala chai', whyNow: 'Chai is always a good idea', ingredients: ['Tea', 'Milk', 'Ginger', 'Cardamom'], prepTime: '10 mins', difficulty: 'Easy', caloriesApprox: 80, isHealthy: true, recipeSearchQuery: 'masala chai recipe' },
    { name: 'Mango Lassi', nameHindi: '\u092E\u0948\u0902\u0917\u094B \u0932\u0938\u094D\u0938\u0940', emoji: '\u{1F95B}', category: 'Drinks', description: 'Thick sweet mango lassi', whyNow: 'Refreshing drink any time of day', ingredients: ['Yogurt', 'Mango', 'Sugar', 'Cardamom'], prepTime: '5 mins', difficulty: 'Easy', caloriesApprox: 180, isHealthy: true, recipeSearchQuery: 'mango lassi recipe' },
    { name: 'Gulab Jamun', nameHindi: '\u0917\u0941\u0932\u093E\u092C \u091C\u093E\u092E\u0941\u0928', emoji: '\u{1F369}', category: 'Dessert', description: 'Soft sweet gulab jamun in sugar syrup', whyNow: 'Sweet treat to brighten any day', ingredients: ['Khoya', 'Flour', 'Sugar', 'Cardamom', 'Rose water'], prepTime: '30 mins', difficulty: 'Medium', caloriesApprox: 300, isHealthy: false, recipeSearchQuery: 'gulab jamun recipe' },
    { name: 'Rasmalai', nameHindi: '\u0930\u0938\u092E\u0932\u093E\u0908', emoji: '\u{1F36E}', category: 'Dessert', description: 'Soft paneer balls in creamy saffron milk', whyNow: 'Elegant dessert for a pleasant day', ingredients: ['Paneer', 'Milk', 'Sugar', 'Saffron', 'Cardamom'], prepTime: '40 mins', difficulty: 'Hard', caloriesApprox: 250, isHealthy: false, recipeSearchQuery: 'rasmalai recipe' },
  ],
};
