// Vinylia Design System - Main Export

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

// Re-export individual modules
export { colors } from './colors';
export type { MoodType } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { shadows } from './shadows';
export { borderRadius } from './borderRadius';

// Complete theme object
export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
} as const;

export type Theme = typeof theme;
