import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { PaywallScreen } from '../features/paywall/screens/PaywallScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { VocabScreen } from '../features/vocabulary/screens/VocabScreen';
import { LessonScreen } from '../features/lesson/screens/LessonScreen';
import { AuthScreen } from '../features/auth/screens/AuthScreen';
import { theme } from '../core/theme';
import { useUserStore } from '../store/useUserStore';
import { RevenueCatService } from '../services/revenuecat';
import { AppState, AppStateStatus } from 'react-native';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Paywall: undefined;
  Main: undefined;
  Vocab: undefined;
  Lesson: { lessonId?: string; reviewMode?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { hasOnboarded, setPremium } = useUserStore();

  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App has come to the foreground! Re-verify premium status.
        const isNowPremium = await RevenueCatService.checkPremiumStatus();
        setPremium(isNowPremium);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Check once on mount as well
    RevenueCatService.checkPremiumStatus().then(setPremium);

    return () => {
      subscription.remove();
    };
  }, [setPremium]);

  return (
    <Stack.Navigator
      initialRouteName={hasOnboarded ? "Main" : "Onboarding"}
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

