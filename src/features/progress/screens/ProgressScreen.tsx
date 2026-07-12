import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';

export const ProgressScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your language learning journey here.</Text>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primaryDark },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 28,
    color: theme.colors.textPrimary,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
  }
});
