// src/types/index.ts
// All game types and interfaces in English

export enum Character {
  DUKE = 'duke',
  ASSASSIN = 'assassin',
  CAPTAIN = 'captain',
  AMBASSADOR = 'ambassador',
  CONTESSA = 'contessa'
}

export enum ActionType {
  // General actions (cannot be challenged)
  INCOME = 'income',
  FOREIGN_AID = 'foreign_aid',
  COUP = 'coup',
  
  // Character actions (can be challenged)
  TAX = 'tax',                    // Duke
  ASSASSINATE = 'assassinate',    // Assassin
  STEAL = 'steal',                // Captain
  EXCHANGE = 'exchange'           // Ambassador
}

export enum CounterActionType {
  BLOCK_FOREIGN_AID = 'block_foreign_aid',      // Duke
  BLOCK_ASSASSINATION = 'block_assassination',  // Contessa
  BLOCK_STEALING = 'block_stealing'             // Captain or Ambassador
}

export interface Card {
  character: Character;
  isRevealed: boolean;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  influences: Card[];  // Always 2 cards (or less when eliminated)
  isEliminated: boolean;
  isAI: boolean;
}

export interface Action {
  type: ActionType;
  actorId: string;
  targetId?: string;
  claimedCharacter?: Character;  // For character actions
}

export interface CounterAction {
  type: CounterActionType;
  actorId: string;
  claimedCharacter: Character;
}

export interface Challenge {
  challengerId: string;
  targetId: string;
  isForAction: boolean;  // true = challenging action, false = challenging counteraction
}

export interface GamePhase {
  type: 'action' | 'challenge' | 'counteraction' | 'challenge_counteraction' | 'resolution' | 'card_selection';
  description: string;
}

export interface PendingAction {
  action: Action;
  counterAction?: CounterAction;
  challenge?: Challenge;
  awaitingResponse: boolean;
  // For Ambassador Exchange: temporary storage of drawn cards
  ambassadorDrawnCards?: Character[];  // The 2 cards drawn from deck
  ambassadorAllCards?: Card[];  // All 4 cards (2 original + 2 drawn) for selection
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  courtDeck: Character[];  // Remaining cards in deck
  phase: GamePhase;
  pendingAction: PendingAction | null;
  gameLog: GameLogEntry[];
  gameOver: boolean;
  winnerId: string | null;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type: 'action' | 'challenge' | 'counteraction' | 'resolution' | 'elimination';
  message: string;  // Will be translated in UI
  playerId: string;
  translationKey: string;  // Key for i18n
  translationParams?: Record<string, any>;  // Parameters for translation
}

export interface CharacterAbility {
  character: Character;
  action?: ActionType;
  counterActions: CounterActionType[];
}

// Character abilities mapping
export const CHARACTER_ABILITIES: Record<Character, CharacterAbility> = {
  [Character.DUKE]: {
    character: Character.DUKE,
    action: ActionType.TAX,
    counterActions: [CounterActionType.BLOCK_FOREIGN_AID]
  },
  [Character.ASSASSIN]: {
    character: Character.ASSASSIN,
    action: ActionType.ASSASSINATE,
    counterActions: []
  },
  [Character.CAPTAIN]: {
    character: Character.CAPTAIN,
    action: ActionType.STEAL,
    counterActions: [CounterActionType.BLOCK_STEALING]
  },
  [Character.AMBASSADOR]: {
    character: Character.AMBASSADOR,
    action: ActionType.EXCHANGE,
    counterActions: [CounterActionType.BLOCK_STEALING]
  },
  [Character.CONTESSA]: {
    character: Character.CONTESSA,
    action: undefined,  // Contessa has no action
    counterActions: [CounterActionType.BLOCK_ASSASSINATION]
  }
};

// Action costs and effects
export const ACTION_CONFIG = {
  [ActionType.INCOME]: {
    cost: 0,
    gain: 1,
    canBeBlocked: false,
    canBeChallenged: false,
    requiresTarget: false
  },
  [ActionType.FOREIGN_AID]: {
    cost: 0,
    gain: 2,
    canBeBlocked: true,
    canBeChallenged: false,
    requiresTarget: false
  },
  [ActionType.COUP]: {
    cost: 7,
    gain: 0,
    canBeBlocked: false,
    canBeChallenged: false,
    requiresTarget: true
  },
  [ActionType.TAX]: {
    cost: 0,
    gain: 3,
    canBeBlocked: false,
    canBeChallenged: true,
    requiresTarget: false,
    requiredCharacter: Character.DUKE
  },
  [ActionType.ASSASSINATE]: {
    cost: 3,
    gain: 0,
    canBeBlocked: true,
    canBeChallenged: true,
    requiresTarget: true,
    requiredCharacter: Character.ASSASSIN
  },
  [ActionType.STEAL]: {
    cost: 0,
    gain: 2,  // Takes from target
    canBeBlocked: true,
    canBeChallenged: true,
    requiresTarget: true,
    requiredCharacter: Character.CAPTAIN
  },
  [ActionType.EXCHANGE]: {
    cost: 0,
    gain: 0,
    canBeBlocked: false,
    canBeChallenged: true,
    requiresTarget: false,
    requiredCharacter: Character.AMBASSADOR
  }
};

// Game constants
export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  STARTING_COINS: 2,
  STARTING_INFLUENCES: 2,
  CARDS_PER_CHARACTER: 3,
  COUP_COST: 7,
  ASSASSINATE_COST: 3,
  MANDATORY_COUP_THRESHOLD: 10,
  AMBASSADOR_DRAW_COUNT: 2,  // Ambassador draws 2, has 4 total
  CHALLENGE_TIMER: 10,  // seconds
  COUNTERACTION_TIMER: 10  // seconds
};

export type GameEvent = 
  | { type: 'PLAYER_ACTION'; action: Action }
  | { type: 'CHALLENGE'; challenge: Challenge }
  | { type: 'COUNTERACTION'; counterAction: CounterAction }
  | { type: 'REVEAL_CARD'; playerId: string; character: Character }
  | { type: 'LOSE_INFLUENCE'; playerId: string; cardIndex: number }
  | { type: 'DRAW_CARD'; playerId: string }
  | { type: 'NEXT_TURN' }
  | { type: 'GAME_OVER'; winnerId: string };

// Legacy compatibility - map old CardType to new Character
export enum CardType {
  DUKE = 'DUKE',
  CAPTAIN = 'CAPTAIN',
  ASSASSIN = 'ASSASSIN',
  AMBASSADOR = 'AMBASSADOR',
  CONTESSA = 'CONTESSA',
}

// Legacy CardState interface for backward compatibility
export interface CardState {
  type: CardType;
  revealed: boolean;
}

// Helper function to convert CardType to Character
export function cardTypeToCharacter(cardType: CardType): Character {
  const mapping: Record<CardType, Character> = {
    [CardType.DUKE]: Character.DUKE,
    [CardType.CAPTAIN]: Character.CAPTAIN,
    [CardType.ASSASSIN]: Character.ASSASSIN,
    [CardType.AMBASSADOR]: Character.AMBASSADOR,
    [CardType.CONTESSA]: Character.CONTESSA,
  };
  return mapping[cardType];
}

// Helper function to convert Character to CardType
export function characterToCardType(character: Character): CardType {
  const mapping: Record<Character, CardType> = {
    [Character.DUKE]: CardType.DUKE,
    [Character.CAPTAIN]: CardType.CAPTAIN,
    [Character.ASSASSIN]: CardType.ASSASSIN,
    [Character.AMBASSADOR]: CardType.AMBASSADOR,
    [Character.CONTESSA]: CardType.CONTESSA,
  };
  return mapping[character];
}
