// Card Types
export enum CardType {
  DUKE = 'DUKE', // Conde
  CAPTAIN = 'CAPTAIN', // Pirata
  ASSASSIN = 'ASSASSIN', // Mercenário
  AMBASSADOR = 'AMBASSADOR', // Diplomata
  CONTESSA = 'CONTESSA', // Cortesã
}

// Função para obter o nome em português
export function getCardTypeName(cardType: CardType): string {
  switch (cardType) {
    case CardType.DUKE:
      return 'CONDE';
    case CardType.CAPTAIN:
      return 'PIRATA';
    case CardType.ASSASSIN:
      return 'MERCENÁRIO';
    case CardType.AMBASSADOR:
      return 'DIPLOMATA';
    case CardType.CONTESSA:
      return 'CORTESÃ';
    default:
      return cardType;
  }
}

// Card State
export interface CardState {
  type: CardType;
  revealed: boolean;
}

// Player State
export interface Player {
  id: string;
  name: string;
  coins: number;
  cards: CardState[]; // 2 cards
  isAlive: boolean;
  isCurrentPlayer: boolean;
}

// Available Actions
export enum ActionType {
  // Basic
  INCOME = 'INCOME',
  FOREIGN_AID = 'FOREIGN_AID',
  COUP = 'COUP',
  // Character
  DUKE_TAX = 'DUKE_TAX',
  CAPTAIN_STEAL = 'CAPTAIN_STEAL',
  ASSASSIN_KILL = 'ASSASSIN_KILL',
  AMBASSADOR_EXCHANGE = 'AMBASSADOR_EXCHANGE',
}

// Game Phase
export enum GamePhase {
  SETUP = 'SETUP',
  ACTION_SELECTION = 'ACTION_SELECTION',
  WAITING_CHALLENGE = 'WAITING_CHALLENGE',
  WAITING_BLOCK = 'WAITING_BLOCK',
  RESOLVING_ACTION = 'RESOLVING_ACTION',
  CARD_LOSS_SELECTION = 'CARD_LOSS_SELECTION',
  GAME_OVER = 'GAME_OVER',
}

// Pending Action (for challenging or blocking)
export interface PendingAction {
  type: ActionType;
  playerId: string;
  targetPlayerId?: string;
  canBeBlocked: boolean;
  canBeChallenged: boolean;
  blockingCards?: CardType[];
}

// Game State
export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: CardType[];
  gamePhase: GamePhase;
  pendingAction: PendingAction | null;
  winner: Player | null;
  gameLog: string[];
}

// Action Rules
export interface ActionRule {
  cost: number;
  canBeBlocked: boolean;
  blockingCards?: CardType[];
  canBeChallenged: boolean;
  requiredCard?: CardType;
  requiresTarget: boolean;
}

