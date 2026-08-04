import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/core/theme';
import { IAPService } from './src/services/iap';
import { MetaService } from './src/services/meta';
import * as Font from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFontsAndUpdates() {
      try {
        // Only check for updates in production builds
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        console.error('OTA Update failed', e);
      }

      try {
        await Font.loadAsync({
          Outfit: Outfit_400Regular,
          OutfitMedium: Outfit_500Medium,
          OutfitSemiBold: Outfit_600SemiBold,
          OutfitBold: Outfit_700Bold,
          Inter: Inter_400Regular,
          InterMedium: Inter_500Medium,
          InterSemiBold: Inter_600SemiBold,
        });
      } catch (e) {
        console.error('Font loading failed', e);
      }

      setFontsLoaded(true);
    }
    loadFontsAndUpdates();

    // SDK init runs independently of the OTA/font sequence. Chaining it behind
    // the update check delayed the install event behind a network round trip,
    // and a fetched update calls reloadAsync() - which killed the session
    // before Meta ever initialized, so the install was never reported.
    (async () => {
      // Meta first: RevenueCat reads the Meta anonymous ID during its own
      // configure step, which only works once the FB SDK is up.
      try {
        await MetaService.initialize();
      } catch (e) {
        console.error('Meta initialization failed', e);
      }

      try {
        await IAPService.initialize();
      } catch (e) {
        console.error('IAP initialization failed', e);
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.primaryDark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}
