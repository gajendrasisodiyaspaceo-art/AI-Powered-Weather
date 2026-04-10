import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ForecastEntry } from '../models/ForecastData';
import { formatTemperature, getWeatherLottieAsset } from '../utils/helpers';
import { useAppTheme } from '../hooks/useAppTheme';

interface ForecastRowProps {
  dailySummaries: ForecastEntry[];
  temperatureUnit: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ForecastRow({ dailySummaries, temperatureUnit = 'Celsius' }: ForecastRowProps) {
  const theme = useAppTheme();

  if (dailySummaries.length === 0) return null;

  return (
    <View>
      <Text
        style={[styles.title, { color: theme.onSurface }]}
      >
        5-Day Forecast
      </Text>
      <FlatList
        horizontal
        data={dailySummaries}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item }) => {
          const dayName = DAY_NAMES[item.dateTime.getDay()];
          const lottieAsset = getWeatherLottieAsset(item.weatherCondition);

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.outlineVariant + '80',
                },
              ]}
            >
              <Text style={[styles.dayName, { color: theme.onSurface }]}>
                {dayName}
              </Text>
              <View style={styles.lottieContainer}>
                <LottieView source={lottieAsset} autoPlay loop style={styles.lottie} />
              </View>
              <Text style={[styles.maxTemp, { color: theme.onSurface }]}>
                {formatTemperature(item.tempMax, temperatureUnit)}
              </Text>
              <Text style={[styles.minTemp, { color: theme.onSurfaceVariant }]}>
                {formatTemperature(item.tempMin, temperatureUnit)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 85,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  lottieContainer: {
    width: 36,
    height: 36,
    marginVertical: 4,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  maxTemp: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  minTemp: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },
});
