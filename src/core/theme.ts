export const theme = {
  colors: {
    primaryDark: '#0F0F1A',
    surfaceDark: '#1A1A2E',
    accentPrimary: '#E8B059',
    accentSecondary: '#4ECDC4',
    textPrimary: '#F0EDE8',
    textSecondary: '#8A8A9A',
    error: '#E85D75',
    success: '#7BC67E',
    transparent: 'transparent',
    white: '#FFFFFF',
  },
  typography: {
    fonts: {
      headline: 'Outfit',
      body: 'Inter',
      spanish: 'Lora',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      hero: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    round: 9999,
  },
};

export type Theme = typeof theme;
