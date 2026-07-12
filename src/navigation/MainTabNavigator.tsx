import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../features/dashboard/screens/HomeScreen';
import { CourseMapScreen } from '../features/course/screens/CourseMapScreen';
import { Home, Map as MapIcon, User, BarChart2 } from 'lucide-react-native';
import { theme } from '../core/theme';
import { View, Text, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { ProgressScreen } from '../features/progress/screens/ProgressScreen';

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopColor: 'rgba(0, 0, 0, 0.05)',
          position: 'absolute', // for glassmorphism feel
          height: 80,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          elevation: 0,
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
        name="ProgressTab" 
        component={ProgressScreen} 
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />
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
