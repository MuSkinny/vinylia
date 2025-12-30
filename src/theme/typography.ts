// Vinylia Design System - Typography
// Humanist, warm, readable type system with refined spacing

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 29, // 1.6x for better readability
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 26, // 1.625x for better readability
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 22, // 1.57x for better readability
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18, // 1.5x for better readability
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
} as const;
