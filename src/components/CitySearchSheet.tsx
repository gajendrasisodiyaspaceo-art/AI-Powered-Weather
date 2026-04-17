import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../config/colors';
import { useAppTheme } from '../hooks/useAppTheme';
import { useLocationStore } from '../stores/useLocationStore';
import { LocationData } from '../models/LocationData';
import * as storageService from '../services/storageService';

interface CitySearchSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CitySearchSheet({ visible, onClose }: CitySearchSheetProps) {
  const theme = useAppTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);

  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<LocationData[]>([]);

  const setManualLocation = useLocationStore((s) => s.setManualLocation);
  const useGpsLocation = useLocationStore((s) => s.useGpsLocation);
  const selectHistoryLocation = useLocationStore((s) => s.selectHistoryLocation);

  // Reset state and reload history each time the sheet opens
  useEffect(() => {
    if (visible) {
      setQuery('');
      setError(null);
      setIsSearching(false);
      storageService.loadSearchHistory().then(setSearchHistory);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Please enter a city name');
      return;
    }
    setError(null);
    setIsSearching(true);
    await setManualLocation(trimmed);
    const { status, error: storeError } = useLocationStore.getState();
    setIsSearching(false);
    if (status === 'loaded') {
      onClose();
    } else {
      setError(storeError ?? 'Something went wrong');
    }
  };

  const handleUseGps = async () => {
    setError(null);
    setIsSearching(true);
    await useGpsLocation();
    const { status, error: storeError } = useLocationStore.getState();
    setIsSearching(false);
    if (status === 'loaded') {
      onClose();
    } else {
      setError(storeError ?? 'Failed to get location');
    }
  };

  const handleSelectHistory = async (location: LocationData) => {
    setError(null);
    setIsSearching(true);
    await selectHistoryLocation(location);
    const { status, error: storeError } = useLocationStore.getState();
    setIsSearching(false);
    if (status === 'loaded') {
      onClose();
    } else {
      setError(storeError ?? 'Something went wrong');
    }
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.outlineVariant }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.onSurface }]}>Change Location</Text>

        {/* Search input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.surfaceContainerHighest },
          ]}
        >
          <MaterialIcons name="search" size={20} color={theme.onSurfaceVariant} />
          <BottomSheetTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search city..."
            placeholderTextColor={theme.onSurfaceVariant}
            style={[styles.input, { color: theme.onSurface }]}
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
          />
          {isSearching && <ActivityIndicator size="small" />}
        </View>

        {/* Recent searches */}
        {searchHistory.length > 0 && (
          <>
            <Text style={[styles.recentLabel, { color: theme.onSurfaceVariant }]}>
              Recent
            </Text>
            <View style={styles.historyWrap}>
              {searchHistory.map((loc, i) => (
                <Pressable
                  key={i}
                  onPress={() => !isSearching && handleSelectHistory(loc)}
                  style={[styles.historyChip, { backgroundColor: theme.surfaceContainerHighest }]}
                >
                  <MaterialIcons name="history" size={16} color={theme.onSurfaceVariant} />
                  <Text style={[styles.historyText, { color: theme.onSurface }]}>
                    {loc.city}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Error */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Search button */}
        <Pressable
          onPress={isSearching ? undefined : handleSubmit}
          style={[
            styles.searchButton,
            {
              backgroundColor: isSearching
                ? AppColors.primary + '80'
                : AppColors.primary,
            },
          ]}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>

        {/* Use My Location */}
        <Pressable
          onPress={isSearching ? undefined : handleUseGps}
          style={[styles.gpsButton, { borderColor: AppColors.primary }]}
        >
          <MaterialIcons name="my-location" size={18} color={AppColors.primary} />
          <Text style={[styles.gpsButtonText, { color: AppColors.primary }]}>
            Use My Location
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    paddingVertical: 10,
    marginLeft: 8,
  },
  recentLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginTop: 12,
  },
  historyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  historyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: AppColors.error,
    marginTop: 8,
  },
  searchButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  searchButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  gpsButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
});
