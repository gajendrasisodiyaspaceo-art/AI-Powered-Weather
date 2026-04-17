import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../../src/config/colors';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function TabLayout() {
  const theme = useAppTheme();
  const authStatus = useAuthStore((s) => s.status);

  if (authStatus !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: theme.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: 'Poppins_400Regular',
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.outlineVariant,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name={focused ? 'home' : 'home'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name={focused ? 'favorite' : 'favorite-border'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="settings"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
