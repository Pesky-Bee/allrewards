export const Colors = {
  // Primary palette - matching the logo's vibrant colors
  primary: '#4CAF50',        // Green from logo
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Secondary accent
  accent: '#FF9800',         // Orange from "rewards" text
  accentLight: '#FFB74D',
  
  // Background colors - light theme to match logo style
  background: '#FFFFFF',
  backgroundSecondary: '#F5F7FA',
  backgroundTertiary: '#E8ECF0',
  
  // Surface colors for cards
  surface: '#FFFFFF',
  surfaceHover: '#F0F4F8',
  
  // Text colors
  text: '#2D3748',
  textSecondary: '#718096',
  textMuted: '#A0AEC0',
  textOnPrimary: '#FFFFFF',
  
  // Card colors from logo
  cardBlue: '#2196F3',
  cardGreen: '#4CAF50',
  cardOrange: '#FF9800',
  cardRed: '#F44336',
  
  // Accent colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border colors
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  
  // Star/highlight color
  star: '#FFD700',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
