// Vinylia Design System - Colors
// Based on warm, light, tactile design principles

export const colors = {
  brand: {
    primary: '#1E1B18',
    secondary: '#F5F1EC',
    accent: '#E63946',
  },
  background: {
    base: '#FAF7F2',
    surface: '#FFFFFF',
    elevated: '#F1ECE6',
  },
  text: {
    primary: '#1E1B18',
    secondary: '#5C5853',
    muted: '#9A958F',
    inverse: '#FFFFFF',
  },
  interactive: {
    primary: '#E63946',
    primaryHover: '#CC3240',
    secondary: '#2A7FFF',
    secondaryHover: '#1F63CC',
    focus: '#FFD166',
  },
  states: {
    success: '#2F9E44',
    warning: '#F59F00',
    error: '#D00000',
    info: '#2A7FFF',
  },
  mood: {
    warm: '#C97C5D',
    nostalgic: '#A26769',
    night: '#2B2E4A',
    calm: '#6D9DC5',
    energy: '#F77F00',
  },
  divider: {
    light: '#E5E0DA',
    dark: '#2A2623',
  },
  shadow: {
    soft: 'rgba(0, 0, 0, 0.08)',
    medium: 'rgba(0, 0, 0, 0.16)',
  },
} as const;

export type MoodType = keyof typeof colors.mood;
