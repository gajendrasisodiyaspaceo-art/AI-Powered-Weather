import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WeatherData } from '../models/WeatherData';
import { LocationData } from '../models/LocationData';
import { formatTemperature, getTemperatureGradient, getWeatherLottieAsset } from '../utils/helpers';
import { AppTextStyles } from '../config/typography';

interface WeatherHeroCardProps {
  weather: WeatherData;
  location: LocationData;
  temperatureUnit: string;
  onLocationPress?: () => void;
}

export function WeatherHeroCard({
  weather,
  location,
  temperatureUnit = 'Celsius',
  onLocationPress,
}: WeatherHeroCardProps) {
  const gradient = getTemperatureGradient(weather.tempCelsius);
  const lottieAsset = getWeatherLottieAsset(weather.weatherCondition);

  return (
    <LinearGradient
      colors={gradient as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <Pressable onPress={onLocationPress} style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={[AppTextStyles.temperatureSmall, styles.locationText]} numberOfLines={1}>
              {location.city}, {location.state}
            </Text>
            <MaterialIcons name="expand-more" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <Text style={[AppTextStyles.temperatureLarge, { marginTop: 8 }]}>
            {formatTemperature(weather.tempCelsius, temperatureUnit)}
          </Text>

          <Text style={styles.conditionText}>{weather.weatherDescription}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="thermostat" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.detailText}>
                Feels {formatTemperature(weather.feelsLike, temperatureUnit)}
              </Text>
            </View>
            <View style={[styles.detailItem, { marginLeft: 16 }]}>
              <MaterialIcons name="water-drop" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.detailText}>{weather.humidity}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.lottieContainer}>
          <LottieView source={lottieAsset} autoPlay loop style={styles.lottie} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    flex: 1,
  },
  conditionText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  lottieContainer: {
    width: 100,
    height: 100,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
