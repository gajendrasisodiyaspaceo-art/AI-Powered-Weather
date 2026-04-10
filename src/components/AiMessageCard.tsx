import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface AiMessageCardProps {
  message: string;
}

export function AiMessageCard({ message }: AiMessageCardProps) {
  const theme = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [message]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primary + '14',
          borderColor: theme.primary + '26',
        },
      ]}
    >
      <Text style={styles.emoji}>🤖</Text>
      <Animated.Text
        style={[
          styles.message,
          { color: theme.onSurface, opacity: fadeAnim },
        ]}
      >
        {message}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 20,
  },
  message: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
});
