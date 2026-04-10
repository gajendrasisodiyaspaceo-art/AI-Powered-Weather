export interface FoodSuggestion {
  name: string;
  nameHindi: string;
  emoji: string;
  category: string;
  description: string;
  whyNow: string;
  ingredients: string[];
  prepTime: string;
  difficulty: string;
  caloriesApprox: number;
  isHealthy: boolean;
  recipeSearchQuery: string;
}

export function foodSuggestionFromJson(json: any): FoodSuggestion {
  return {
    name: json.name ?? '',
    nameHindi: json.name_hindi ?? '',
    emoji: json.emoji ?? '',
    category: json.category ?? 'Main Course',
    description: json.description ?? '',
    whyNow: json.why_now ?? '',
    ingredients: Array.isArray(json.ingredients)
      ? json.ingredients.map((e: any) => String(e))
      : [],
    prepTime: json.prep_time ?? '',
    difficulty: json.difficulty ?? 'Easy',
    caloriesApprox: typeof json.calories_approx === 'number' ? json.calories_approx : 0,
    isHealthy: json.is_healthy ?? false,
    recipeSearchQuery: json.recipe_search_query ?? json.name ?? '',
  };
}

export function foodSuggestionToJson(item: FoodSuggestion): any {
  return {
    name: item.name,
    name_hindi: item.nameHindi,
    emoji: item.emoji,
    category: item.category,
    description: item.description,
    why_now: item.whyNow,
    ingredients: item.ingredients,
    prep_time: item.prepTime,
    difficulty: item.difficulty,
    calories_approx: item.caloriesApprox,
    is_healthy: item.isHealthy,
    recipe_search_query: item.recipeSearchQuery,
  };
}

export function getShareText(item: FoodSuggestion): string {
  return `${item.emoji} ${item.name} (${item.nameHindi})\n${item.description}\nCategory: ${item.category} | Prep: ${item.prepTime} | Calories: ~${item.caloriesApprox}\nIngredients: ${item.ingredients.join(', ')}\n\nRecommended by MausamChef`;
}
