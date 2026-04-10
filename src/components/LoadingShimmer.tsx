import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../hooks/useAppTheme';

function ShimmerEffect({ children }: { children: React.ReactNode }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={{ overflow: 'hidden' }}>
      {children}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function ShimmerWeatherCard() {
  const theme = useAppTheme();
  return (
    <ShimmerEffect>
      <View
        style={[
          styles.weatherCard,
          { backgroundColor: theme.surfaceVariant },
        ]}
      />
    </ShimmerEffect>
  );
}

export function ShimmerFoodGrid() {
  const theme = useAppTheme();
  return (
    <ShimmerEffect>
      <View style={styles.foodGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.foodCardPlaceholder,
              { backgroundColor: theme.surfaceVariant },
            ]}
          />
        ))}
      </View>
    </ShimmerEffect>
  );
}

export function ShimmerMessageCard() {
  const theme = useAppTheme();
  return (
    <ShimmerEffect>
      <View
        style={[
          styles.messageCard,
          { backgroundColor: theme.surfaceVariant },
        ]}
      />
    </ShimmerEffect>
  );
}

const styles = StyleSheet.create({
  weatherCard: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  foodCardPlaceholder: {
    width: '47%',
    height: 280,
    borderRadius: 16,
  },
  messageCard: {
    height: 60,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
});
