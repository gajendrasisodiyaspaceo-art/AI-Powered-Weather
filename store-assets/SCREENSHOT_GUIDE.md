# Screenshot Guide - Play Store

## Requirements
- Minimum: 2 screenshots
- Recommended: 4-8 screenshots
- Format: JPEG or PNG (24-bit, no alpha)
- Dimensions: 16:9 or 9:16, min 320px, max 3840px per side

## Recommended Screenshots (6 total)

### 1. Home Screen (Weather + Food Grid)
Show the main screen with WeatherHeroCard, weather animation, AI message, and food grid with emoji cards.

### 2. Food Detail Bottom Sheet
Open any food item to show the bottom sheet with emoji, Hindi/English name, ingredients, calories, "Why Now" reason, and recipe button.

### 3. Onboarding - Diet Selection
Show the onboarding screen with "What do you eat?" and Veg/Non-Veg/Vegan/Everything options.

### 4. Settings Screen
Show diet preferences, health goal, language toggle, dark mode toggle, and about section.

### 5. Favorites Screen
Show saved food items with emojis, Hindi names, and category chips.

### 6. Dark Mode Home Screen
Same home screen in dark mode to showcase theme support.

## How to Capture

### Option A: Physical Android Device (USB)
```bash
# Connect device with USB debugging enabled
# Take screenshot
adb exec-out screencap -p > store-assets/screenshot_1_home.png

# Or pull device screenshots
adb pull /sdcard/Screenshots/ ./store-assets/
```

### Option B: Android Emulator
```bash
# Use the camera icon in the emulator toolbar
# Screenshots saved to desktop by default
```

### Option C: Device Button
Press **Power + Volume Down** on the device, then pull via:
```bash
adb pull /sdcard/Screenshots/ ./store-assets/
```

## Naming Convention
- `screenshot_1_home.png`
- `screenshot_2_food_detail.png`
- `screenshot_3_onboarding.png`
- `screenshot_4_settings.png`
- `screenshot_5_favorites.png`
- `screenshot_6_dark_mode.png`
