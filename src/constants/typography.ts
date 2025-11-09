import { COLORS } from './colors';

export const TYPOGRAPHY = {
  cardName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  
  abilityName: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: COLORS.textAccent,
  },
  
  abilityDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  
  gameLog: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.textPrimary,
  },
  
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  body: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
};

