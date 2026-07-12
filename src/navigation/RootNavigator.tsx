import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { PaywallScreen } from '../features/paywall/screens/PaywallScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { VocabScreen } from '../features/vocabulary/screens/VocabScreen';
import { LessonScreen } from '../features/lesson/screens/LessonScreen';
import { AuthScreen } from '../features/auth/screens/AuthScreen';
import { theme } from '../core/theme';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Paywall: undefined;
  Main: undefined;
  Vocab: undefined;
  Lesson: { lessonId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.primaryDark },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Vocab" component={VocabScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
};

