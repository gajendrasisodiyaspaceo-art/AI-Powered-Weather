import { AppColors } from '../config/colors';

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function formatTemperature(celsius: number, unit: string): string {
  if (unit === 'Fahrenheit') {
    return `${Math.round(celsiusToFahrenheit(celsius))}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function getWeatherGradient(condition: string): string[] {
  switch (condition.toLowerCase()) {
    case 'thunderstorm':
    case 'rain':
    case 'drizzle':
      return AppColors.rainyGradient;
    case 'snow':
      return AppColors.coldGradient;
    case 'clear':
      return AppColors.warmGradient;
    case 'clouds':
      return AppColors.coolGradient;
    default:
      return AppColors.defaultGradient;
  }
}

export function getTemperatureGradient(tempCelsius: number): string[] {
  if (tempCelsius >= 35) return AppColors.hotGradient;
  if (tempCelsius >= 25) return AppColors.warmGradient;
  if (tempCelsius >= 15) return AppColors.coolGradient;
  return AppColors.coldGradient;
}

export function getWeatherLottieAsset(condition: string) {
  switch (condition.toLowerCase()) {
    case 'clear':
      return require('../../assets/lottie/sunny.json');
    case 'rain':
    case 'drizzle':
    case 'thunderstorm':
      return require('../../assets/lottie/rainy.json');
    case 'snow':
      return require('../../assets/lottie/snowy.json');
    case 'clouds':
      return require('../../assets/lottie/cloudy.json');
    default:
      return require('../../assets/lottie/sunny.json');
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'drinks':
    case 'drink':
      return AppColors.drinks;
    case 'main course':
      return AppColors.mainCourse;
    case 'lunch':
      return AppColors.lunch;
    case 'dinner':
      return AppColors.dinner;
    case 'snacks':
    case 'snack':
      return AppColors.snacks;
    case 'dessert':
      return AppColors.dessert;
    case 'breakfast':
      return AppColors.breakfast;
    default:
      return AppColors.primary;
  }
}
