export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'afternoon';
  if (hour >= 14 && hour < 17) return 'afternoon_snack';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getTimeOfDayLabel(): string {
  switch (getTimeOfDay()) {
    case 'morning':
      return 'Good Morning';
    case 'afternoon':
      return 'Good Afternoon';
    case 'afternoon_snack':
      return 'Snack Time';
    case 'evening':
      return 'Good Evening';
    case 'night':
      return 'Late Night';
    default:
      return 'Hello';
  }
}

export function getMealContext(): string {
  switch (getTimeOfDay()) {
    case 'morning':
      return 'breakfast';
    case 'afternoon':
      return 'lunch';
    case 'afternoon_snack':
      return 'evening snacks';
    case 'evening':
      return 'dinner';
    case 'night':
      return 'late night snack';
    default:
      return 'meal';
  }
}
