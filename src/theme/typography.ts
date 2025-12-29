// Vinylia Design System - Typography
// Humanist, warm, readable type system

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
} as const;
