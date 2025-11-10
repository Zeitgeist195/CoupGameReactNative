import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, ActionType, Character, CounterActionType } from '../types';
import { CoupGame } from '../engine/CoupGame';

interface GameContextType {
  gameState: GameState;
  game: CoupGame;
  dispatch: React.Dispatch<GameAction>;
}

type GameAction =
  | { type: 'INIT_GAME'; payload: string[] }
  | { type: 'EXECUTE_ACTION'; payload: { action: ActionType; targetId?: string; claimedCharacter?: Character } }
  | { type: 'CHALLENGE_ACTION'; payload: string }
  | { type: 'BLOCK_ACTION'; payload: { blockerId: string; blockingCharacter: Character } }
  | { type: 'SKIP_CHALLENGE' }
  | { type: 'SKIP_BLOCK' }
  | { type: 'SELECT_CARD_TO_LOSE'; payload: { playerId: string; cardIndex: number } }
  | { type: 'COMPLETE_EXCHANGE'; payload: { playerId: string; cardIndices: number[] } }
  | { type: 'RESET_GAME' };

const GameContext = createContext<GameContextType | undefined>(undefined);

function gameReducer(state: GameState | null, action: GameAction): GameState {
  let game: CoupGame;

  try {
    switch (action.type) {
      case 'INIT_GAME':
        if (!action.payload || action.payload.length < 2 || action.payload.length > 6) {
          throw new Error('O jogo requer 2-6 jogadores');
        }
        game = new CoupGame(action.payload);
        return game.getState();

      case 'EXECUTE_ACTION': {
        if (!state) {
          throw new Error('Game not initialized');
        }
        // Create game instance from current state
        // Note: The new engine doesn't support state restoration, so we need to work around this
        // For now, we'll create a new game and manually set state (this is a limitation)
        game = new CoupGame(state.players.map(p => p.name));
        // Copy state to game instance (this is a workaround - ideally engine should support state restoration)
        (game as any).state = { ...state };
        
        const currentPlayer = game.getCurrentPlayer();
        game.performAction({
          type: action.payload.action,
          actorId: currentPlayer.id,
          targetId: action.payload.targetId,
          claimedCharacter: action.payload.claimedCharacter
        });
        return game.getState();
      }

      case 'CHALLENGE_ACTION': {
        if (!state) {
          throw new Error('Game not initialized');
        }
        game = new CoupGame(state.players.map(p => p.name));
        (game as any).state = { ...state };
        
        game.challenge(action.payload, true);
        return game.getState();
      }

      case 'BLOCK_ACTION': {
        if (!state) {
          throw new Error('Game not initialized');
        }
        game = new CoupGame(state.players.map(p => p.name));
        (game as any).state = { ...state };
        
        const blocker = state.players.find(p => p.id === action.payload.blockerId);
        if (!blocker) {
          throw new Error('Blocker not found');
        }
        
        // Determine counteraction type based on blocking character
        let counterActionType: CounterActionType;
        if (action.payload.blockingCharacter === Character.DUKE) {
          counterActionType = CounterActionType.BLOCK_FOREIGN_AID;
        } else if (action.payload.blockingCharacter === Character.CONTESSA) {
          counterActionType = CounterActionType.BLOCK_ASSASSINATION;
        } else {
          counterActionType = CounterActionType.BLOCK_STEALING;
        }
        
        game.counteract({
          type: counterActionType,
          actorId: action.payload.blockerId,
          claimedCharacter: action.payload.blockingCharacter
        });
        return game.getState();
      }

      case 'SKIP_CHALLENGE':
      case 'SKIP_BLOCK': {
        if (!state) {
          throw new Error('Game not initialized');
        }
        game = new CoupGame(state.players.map(p => p.name));
        (game as any).state = { ...state };
        
        game.allowAction();
        return game.getState();
      }

      case 'SELECT_CARD_TO_LOSE': {
        if (!state) {
          throw new Error('Game not initialized');
        }
        game = new CoupGame(state.players.map(p => p.name));
        (game as any).state = { ...state };
        
        game.loseInfluence(action.payload.playerId, action.payload.cardIndex);
        return game.getState();
      }

      case 'COMPLETE_EXCHANGE': {
        if (!state) {
          throw new Error('Game not initialized');
        }
        game = new CoupGame(state.players.map(p => p.name));
        (game as any).state = { ...state };
        
        game.completeExchange(action.payload.playerId, action.payload.cardIndices);
        return game.getState();
      }

      case 'RESET_GAME':
        // Return null state - will be initialized by INIT_GAME
        return null as any;

      default:
        return state || (new CoupGame(['Player 1', 'Player 2']).getState());
    }
  } catch (error: any) {
    // Log error but don't crash the app
    console.error('Game action error:', error);
    // Return current state to prevent crashes
    return state || (new CoupGame(['Player 1', 'Player 2']).getState());
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const initialState = new CoupGame(['Player 1', 'Player 2']).getState();
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  
  // Create game instance that stays in sync with state
  const game = React.useMemo(() => {
    if (!gameState || !gameState.players || gameState.players.length === 0) {
      return new CoupGame(['Player 1', 'Player 2']);
    }
    const gameInstance = new CoupGame(gameState.players.map(p => p.name));
    // Copy state to game instance
    (gameInstance as any).state = { ...gameState };
    return gameInstance;
  }, [gameState]);

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
