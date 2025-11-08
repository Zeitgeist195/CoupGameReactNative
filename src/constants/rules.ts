import { CardType, ActionType, ActionRule } from '../types';

export const ACTION_RULES: Record<ActionType, ActionRule> = {
  [ActionType.INCOME]: {
    cost: 0,
    canBeBlocked: false,
    canBeChallenged: false,
    requiresTarget: false,
  },
  [ActionType.FOREIGN_AID]: {
    cost: 0,
    canBeBlocked: true,
    blockingCards: [CardType.DUKE],
    canBeChallenged: false,
    requiresTarget: false,
  },
  [ActionType.COUP]: {
    cost: 7,
    canBeBlocked: false,
    canBeChallenged: false,
    requiresTarget: true,
  },
  [ActionType.DUKE_TAX]: {
    cost: 0,
    canBeBlocked: false,
    canBeChallenged: true,
    requiredCard: CardType.DUKE,
    requiresTarget: false,
  },
  [ActionType.CAPTAIN_STEAL]: {
    cost: 0,
    canBeBlocked: true,
    blockingCards: [CardType.CAPTAIN, CardType.AMBASSADOR],
    canBeChallenged: true,
    requiredCard: CardType.CAPTAIN,
    requiresTarget: true,
  },
  [ActionType.ASSASSIN_KILL]: {
    cost: 3,
    canBeBlocked: true,
    blockingCards: [CardType.CONTESSA],
    canBeChallenged: true,
    requiredCard: CardType.ASSASSIN,
    requiresTarget: true,
  },
  [ActionType.AMBASSADOR_EXCHANGE]: {
    cost: 0,
    canBeBlocked: false,
    canBeChallenged: true,
    requiredCard: CardType.AMBASSADOR,
    requiresTarget: false,
  },
};

export const INITIAL_COINS = 2;
export const INITIAL_CARDS = 2;
export const COUP_COST = 7;
export const ASSASSIN_COST = 3;
export const STEAL_AMOUNT = 2;
export const TAX_AMOUNT = 3;
export const FOREIGN_AID_AMOUNT = 2;
export const INCOME_AMOUNT = 1;

export const CHALLENGE_TIMER = 10000; // 10 seconds
export const BLOCK_TIMER = 10000; // 10 seconds

