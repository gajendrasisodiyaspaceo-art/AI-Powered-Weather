import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '../src/config/colors';
import { usePreferencesStore } from '../src/stores/usePreferencesStore';
import { useAppTheme } from '../src/hooks/useAppTheme';

const STEPS = [
  {
    key: 'diet',
    title: 'What do you eat?',
    subtitle: "We'll customize suggestions for you",
    options: ['Veg', 'Non-Veg', 'Vegan', 'Everything'],
    icons: ['🥬', '🍗', '🌱', '🍽️'],
  },
  {
    key: 'health',
    title: 'Any health goal?',
    subtitle: 'Optional - helps us pick better food',
    options: ['Weight Loss', 'Muscle Gain', 'Balanced', 'No Preference'],
    icons: ['⚖️', '💪', '🧘', '😋'],
  },
  {
    key: 'language',
    title: 'Preferred language?',
    subtitle: 'Choose your vibe',
    options: ['English', 'Hindi'],
    icons: ['🇬🇧', '🇮🇳'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { updateDietPreference, updateHealthGoal, updateLanguage, completeOnboarding } =
    usePreferencesStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDiet, setSelectedDiet] = useState('Everything');
  const [selectedHealthGoal, setSelectedHealthGoal] = useState('No Preference');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getSelected = () => {
    switch (currentStep) {
      case 0: return selectedDiet;
      case 1: return selectedHealthGoal;
      case 2: return selectedLanguage;
      default: return '';
    }
  };

  const setSelected = (value: string) => {
    switch (currentStep) {
      case 0: setSelectedDiet(value); break;
      case 1: setSelectedHealthGoal(value); break;
      case 2: setSelectedLanguage(value); break;
    }
  };

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = async () => {
    if (currentStep < 2) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    } else {
      await updateDietPreference(selectedDiet);
      await updateHealthGoal(selectedHealthGoal);
      await updateLanguage(selectedLanguage);
      await completeOnboarding();
      router.replace('/permission');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    }
  };

  const step = STEPS[currentStep];
  const selected = getSelected();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.safeArea}>
        {/* Progress indicator */}
        <View style={styles.progressRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressBar,
                {
                  backgroundColor:
                    i <= currentStep ? AppColors.primary : theme.outlineVariant,
                },
              ]}
            />
          ))}
        </View>

        {/* Step content */}
        <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
          <Text style={[styles.stepTitle, { color: theme.onSurface }]}>
            {step.title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.onSurfaceVariant }]}>
            {step.subtitle}
          </Text>

          <View style={styles.optionsWrap}>
            {step.options.map((option, index) => {
              const isSelected = option === selected;
              return (
                <Pressable
                  key={option}
                  onPress={() => setSelected(option)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: isSelected
                        ? AppColors.primary + '1A'
                        : theme.surface,
                      borderColor: isSelected
                        ? AppColors.primary
                        : theme.outlineVariant,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <Text style={styles.optionIcon}>{step.icons[index]}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? AppColors.primary : theme.onSurface,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {currentStep > 0 ? (
            <Pressable onPress={handleBack}>
              <Text style={[styles.backText, { color: theme.onSurfaceVariant }]}>
                Back
              </Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={handleNext}
            style={[styles.nextButton, { backgroundColor: AppColors.primary }]}
          >
            <Text style={styles.nextText}>
              {currentStep === 2 ? "Let's Go!" : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    marginTop: 48,
  },
  stepTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
  },
  stepSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginTop: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 32,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});
