import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../features/dashboard/screens/HomeScreen';
import { CourseMapScreen } from '../features/course/screens/CourseMapScreen';
import { Home, Map as MapIcon, User } from 'lucide-react-native';
import { theme } from '../core/theme';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          position: 'absolute', // for glassmorphism feel
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
        },
        tabBarActiveTintColor: theme.colors.accentPrimary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fonts.headline,
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="MapTab" 
        component={CourseMapScreen} 
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};
