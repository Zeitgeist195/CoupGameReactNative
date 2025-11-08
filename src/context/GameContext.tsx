import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, ActionType, CardType, GamePhase } from '../types';
import { CoupGame } from '../engine/CoupGame';

interface GameContextType {
  gameState: GameState;
  game: CoupGame;
  dispatch: React.Dispatch<GameAction>;
}

type GameAction =
  | { type: 'INIT_GAME'; payload: string[] }
  | { type: 'EXECUTE_ACTION'; payload: { action: ActionType; targetId?: string } }
  | { type: 'CHALLENGE_ACTION'; payload: string }
  | { type: 'BLOCK_ACTION'; payload: { blockerId: string; blockingCard: CardType } }
  | { type: 'SKIP_CHALLENGE' }
  | { type: 'SKIP_BLOCK' }
  | { type: 'SELECT_CARD_TO_LOSE'; payload: { playerId: string; cardIndex: number } }
  | { type: 'RESET_GAME' };

const GameContext = createContext<GameContextType | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  const game = new CoupGame(state);

  switch (action.type) {
    case 'INIT_GAME':
      return game.initGame(action.payload);

    case 'EXECUTE_ACTION':
      return game.executeAction(action.payload.action, action.payload.targetId);

    case 'CHALLENGE_ACTION':
      return game.challengeAction(action.payload);

    case 'BLOCK_ACTION':
      return game.blockAction(action.payload.blockerId, action.payload.blockingCard);

    case 'SKIP_CHALLENGE':
      return game.skipChallenge();

    case 'SKIP_BLOCK':
      return game.skipBlock();

    case 'SELECT_CARD_TO_LOSE':
      return game.selectCardToLose(action.payload.playerId, action.payload.cardIndex);

    case 'RESET_GAME':
      return new CoupGame().getState();

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, new CoupGame().getState());
  const game = new CoupGame(gameState);

  return (
    <GameContext.Provider value={{ gameState, game, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

