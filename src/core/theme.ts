export const theme = {
  colors: {
    primaryDark: '#FFFFFF', // Main background is now pristine white
    surfaceDark: '#F8F9FA', // Secondary background for cards/sections
    accentPrimary: '#C1272D', // The brand red is now the absolute primary CTA
    accentSecondary: '#E8B059', // Gold for highlights/streaks
    textPrimary: '#1A1A1A', // Sharp dark text
    textSecondary: '#666666',
    error: '#FF3B30',
    success: '#34C759',
    transparent: 'transparent',
    white: '#FFFFFF',
    brandRed: '#C1272D',
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
