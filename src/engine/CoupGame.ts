import {
  GameState,
  Player,
  Card,
  CardType,
  ActionType,
  GamePhase,
  PendingAction,
} from '../types';
import { ACTION_RULES, INITIAL_COINS, INITIAL_CARDS } from '../constants/rules';
import { createDeck, shuffleDeck, drawCard } from '../utils/deck';

export class CoupGame {
  private state: GameState;

  constructor(state?: GameState) {
    this.state = state || this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      players: [],
      currentPlayerIndex: 0,
      deck: [],
      gamePhase: GamePhase.SETUP,
      pendingAction: null,
      winner: null,
      gameLog: [],
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  // Initialization
  initGame(playerNames: string[]): GameState {
    if (playerNames.length < 2 || playerNames.length > 6) {
      throw new Error('Game requires 2-6 players');
    }

    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      coins: INITIAL_COINS,
      cards: [],
      isAlive: true,
      isCurrentPlayer: index === 0,
    }));

    let deck = shuffleDeck(createDeck());

    // Deal 2 cards to each player
    players.forEach((player) => {
      for (let i = 0; i < INITIAL_CARDS; i++) {
        const { card, newDeck } = drawCard(deck);
        player.cards.push({
          type: card,
          revealed: false,
        });
        deck = newDeck;
      }
    });

    this.state = {
      players,
      currentPlayerIndex: 0,
      deck,
      gamePhase: GamePhase.ACTION_SELECTION,
      pendingAction: null,
      winner: null,
      gameLog: [`Game started with ${playerNames.length} players`],
    };

    return this.getState();
  }

  // Actions
  executeAction(actionType: ActionType, targetPlayerId?: string): GameState {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      throw new Error('No current player');
    }

    const rule = ACTION_RULES[actionType];
    if (!this.canPerformAction(currentPlayer.id, actionType)) {
      throw new Error(`Cannot perform action: ${actionType}`);
    }

    // Check if action requires target
    if (rule.requiresTarget && !targetPlayerId) {
      throw new Error(`Action ${actionType} requires a target`);
    }

    // Check if player has enough coins
    if (currentPlayer.coins < rule.cost) {
      throw new Error(`Not enough coins. Need ${rule.cost}, have ${currentPlayer.coins}`);
    }

    // Deduct cost immediately for COUP and ASSASSIN_KILL
    if (actionType === ActionType.COUP || actionType === ActionType.ASSASSIN_KILL) {
      currentPlayer.coins -= rule.cost;
    }

    // Create pending action
    const pendingAction: PendingAction = {
      type: actionType,
      playerId: currentPlayer.id,
      targetPlayerId,
      canBeBlocked: rule.canBeBlocked,
      canBeChallenged: rule.canBeChallenged,
      blockingCards: rule.blockingCards,
    };

    this.state.pendingAction = pendingAction;
    this.addLog(`${currentPlayer.name} performs ${actionType}${targetPlayerId ? ` on ${this.getPlayer(targetPlayerId)?.name}` : ''}`);

    // If action can be challenged, go to challenge phase
    if (rule.canBeChallenged) {
      this.state.gamePhase = GamePhase.WAITING_CHALLENGE;
    } else if (rule.canBeBlocked) {
      // If can't be challenged but can be blocked, go to block phase
      this.state.gamePhase = GamePhase.WAITING_BLOCK;
    } else {
      // Otherwise, resolve immediately
      this.resolveAction();
    }

    return this.getState();
  }

  // Challenges
  challengeAction(challengerId: string): GameState {
    if (this.state.gamePhase !== GamePhase.WAITING_CHALLENGE) {
      throw new Error('Not in challenge phase');
    }

    const pendingAction = this.state.pendingAction;
    if (!pendingAction) {
      throw new Error('No pending action');
    }

    const challenger = this.getPlayer(challengerId);
    const actionPlayer = this.getPlayer(pendingAction.playerId);
    if (!challenger || !actionPlayer) {
      throw new Error('Player not found');
    }

    const rule = ACTION_RULES[pendingAction.type];
    const hasCard = actionPlayer.cards.some(
      (card) => !card.revealed && card.type === rule.requiredCard
    );

    this.addLog(`${challenger.name} challenges ${actionPlayer.name}'s ${pendingAction.type}`);

    if (hasCard) {
      // Challenger loses influence
      this.addLog(`${challenger.name} loses the challenge!`);
      this.loseInfluence(challengerId);
      // If we're in card selection phase, wait for selection
      if (this.state.gamePhase === GamePhase.CARD_LOSS_SELECTION) {
        return this.getState();
      }
      // Action proceeds
      if (rule.canBeBlocked) {
        this.state.gamePhase = GamePhase.WAITING_BLOCK;
      } else {
        this.resolveAction();
      }
    } else {
      // Action player loses influence
      this.addLog(`${actionPlayer.name} loses the challenge!`);
      this.loseInfluence(pendingAction.playerId);
      // If we're in card selection phase, wait for selection
      if (this.state.gamePhase === GamePhase.CARD_LOSS_SELECTION) {
        return this.getState();
      }
      // Action fails
      this.state.pendingAction = null;
      this.nextPlayer();
    }

    return this.getState();
  }

  // Blocks
  blockAction(blockerId: string, blockingCard: CardType): GameState {
    if (this.state.gamePhase !== GamePhase.WAITING_BLOCK) {
      throw new Error('Not in block phase');
    }

    const pendingAction = this.state.pendingAction;
    if (!pendingAction) {
      throw new Error('No pending action');
    }

    const blocker = this.getPlayer(blockerId);
    if (!blocker) {
      throw new Error('Player not found');
    }

    const rule = ACTION_RULES[pendingAction.type];
    if (!rule.blockingCards?.includes(blockingCard)) {
      throw new Error(`Invalid blocking card for ${pendingAction.type}`);
    }

    this.addLog(`${blocker.name} blocks ${pendingAction.type} with ${blockingCard}`);

    // Block can be challenged
    this.state.gamePhase = GamePhase.WAITING_CHALLENGE;
    // Update pending action to reflect block
    this.state.pendingAction = {
      ...pendingAction,
      playerId: blockerId, // Now challenging the blocker
    };

    return this.getState();
  }

  // Skip challenge/block
  skipChallenge(): GameState {
    if (this.state.gamePhase !== GamePhase.WAITING_CHALLENGE) {
      throw new Error('Not in challenge phase');
    }

    const pendingAction = this.state.pendingAction;
    if (!pendingAction) {
      throw new Error('No pending action');
    }

    this.addLog('No challenge made');

    if (ACTION_RULES[pendingAction.type].canBeBlocked) {
      this.state.gamePhase = GamePhase.WAITING_BLOCK;
    } else {
      this.resolveAction();
    }

    return this.getState();
  }

  skipBlock(): GameState {
    if (this.state.gamePhase !== GamePhase.WAITING_BLOCK) {
      throw new Error('Not in block phase');
    }

    this.addLog('No block made');
    this.resolveAction();

    return this.getState();
  }

  // Resolution
  private resolveAction(): void {
    const pendingAction = this.state.pendingAction;
    if (!pendingAction) {
      return;
    }

    const actionPlayer = this.getPlayer(pendingAction.playerId);
    if (!actionPlayer) {
      return;
    }

    const rule = ACTION_RULES[pendingAction.type];

    switch (pendingAction.type) {
      case ActionType.INCOME:
        actionPlayer.coins += 1;
        this.addLog(`${actionPlayer.name} gains 1 coin`);
        break;

      case ActionType.FOREIGN_AID:
        actionPlayer.coins += 2;
        this.addLog(`${actionPlayer.name} gains 2 coins`);
        break;

      case ActionType.COUP:
        if (pendingAction.targetPlayerId) {
          this.loseInfluence(pendingAction.targetPlayerId);
          // If we're in card selection phase, wait for selection
          if (this.state.gamePhase === GamePhase.CARD_LOSS_SELECTION) {
            return;
          }
        }
        break;

      case ActionType.DUKE_TAX:
        actionPlayer.coins += 3;
        this.addLog(`${actionPlayer.name} gains 3 coins`);
        break;

      case ActionType.CAPTAIN_STEAL:
        if (pendingAction.targetPlayerId) {
          const target = this.getPlayer(pendingAction.targetPlayerId);
          if (target) {
            const stealAmount = Math.min(2, target.coins);
            target.coins -= stealAmount;
            actionPlayer.coins += stealAmount;
            this.addLog(`${actionPlayer.name} steals ${stealAmount} coins from ${target.name}`);
          }
        }
        break;

      case ActionType.ASSASSIN_KILL:
        if (pendingAction.targetPlayerId) {
          this.loseInfluence(pendingAction.targetPlayerId);
          // If we're in card selection phase, wait for selection
          if (this.state.gamePhase === GamePhase.CARD_LOSS_SELECTION) {
            return;
          }
        }
        break;

      case ActionType.AMBASSADOR_EXCHANGE:
        // Exchange cards (simplified - draw 2, return 2)
        const { card: card1, newDeck: deck1 } = drawCard(this.state.deck);
        const { card: card2, newDeck: deck2 } = drawCard(deck1);
        this.state.deck = deck2;

        // Return 2 cards to deck and give 2 new ones
        const cardsToReturn = actionPlayer.cards.filter((c) => !c.revealed).slice(0, 2);
        cardsToReturn.forEach((card) => {
          this.state.deck.push(card.type);
        });
        this.state.deck = shuffleDeck(this.state.deck);

        // Replace cards
        actionPlayer.cards = actionPlayer.cards.filter((c) => c.revealed);
        actionPlayer.cards.push(
          { type: card1, revealed: false },
          { type: card2, revealed: false }
        );
        this.addLog(`${actionPlayer.name} exchanges cards`);
        break;
    }

    this.state.pendingAction = null;
    this.state.gamePhase = GamePhase.ACTION_SELECTION;

    if (this.isGameOver()) {
      this.state.gamePhase = GamePhase.GAME_OVER;
      this.state.winner = this.state.players.find((p) => p.isAlive);
    } else {
      this.nextPlayer();
    }
  }

  loseInfluence(playerId: string, cardIndex?: number): void {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const aliveCards = player.cards.filter((c) => !c.revealed);
    if (aliveCards.length === 0) {
      player.isAlive = false;
      this.addLog(`${player.name} is eliminated!`);
      return;
    }

    // If cardIndex provided, reveal that card
    if (cardIndex !== undefined && cardIndex < player.cards.length) {
      player.cards[cardIndex].revealed = true;
      this.addLog(`${player.name} loses ${player.cards[cardIndex].type}`);
    } else {
      // If player has multiple cards, they need to choose
      if (aliveCards.length > 1) {
        this.state.gamePhase = GamePhase.CARD_LOSS_SELECTION;
        return;
      }
      // Otherwise, reveal first alive card
      const firstAliveIndex = player.cards.findIndex((c) => !c.revealed);
      if (firstAliveIndex !== -1) {
        player.cards[firstAliveIndex].revealed = true;
        this.addLog(`${player.name} loses ${player.cards[firstAliveIndex].type}`);
      }
    }

    // Check if player is eliminated
    const remainingCards = player.cards.filter((c) => !c.revealed);
    if (remainingCards.length === 0) {
      player.isAlive = false;
      this.addLog(`${player.name} is eliminated!`);
    }
  }

  selectCardToLose(playerId: string, cardIndex: number): GameState {
    if (this.state.gamePhase !== GamePhase.CARD_LOSS_SELECTION) {
      throw new Error('Not in card loss selection phase');
    }

    // Reveal the selected card
    const player = this.getPlayer(playerId);
    if (player && cardIndex < player.cards.length) {
      player.cards[cardIndex].revealed = true;
      this.addLog(`${player.name} loses ${player.cards[cardIndex].type}`);
    }

    // Check if player is eliminated
    if (player) {
      const remainingCards = player.cards.filter((c) => !c.revealed);
      if (remainingCards.length === 0) {
        player.isAlive = false;
        this.addLog(`${player.name} is eliminated!`);
      }
    }

    this.state.gamePhase = GamePhase.ACTION_SELECTION;

    // If there was a pending action, continue resolving it
    if (this.state.pendingAction) {
      const rule = ACTION_RULES[this.state.pendingAction.type];
      // If action was COUP or ASSASSIN_KILL, it's already resolved
      // Otherwise, continue with the action flow
      if (this.state.pendingAction.type === ActionType.COUP || 
          this.state.pendingAction.type === ActionType.ASSASSIN_KILL) {
        this.state.pendingAction = null;
      }
    }

    if (this.isGameOver()) {
      this.state.gamePhase = GamePhase.GAME_OVER;
      this.state.winner = this.state.players.find((p) => p.isAlive);
    } else {
      // Only move to next player if action is complete
      if (!this.state.pendingAction) {
        this.nextPlayer();
      }
    }

    return this.getState();
  }

  // Validations
  canPerformAction(playerId: string, actionType: ActionType): boolean {
    const player = this.getPlayer(playerId);
    if (!player || !player.isAlive) {
      return false;
    }

    if (player.id !== this.getCurrentPlayer()?.id) {
      return false;
    }

    if (this.state.gamePhase !== GamePhase.ACTION_SELECTION) {
      return false;
    }

    const rule = ACTION_RULES[actionType];
    return player.coins >= rule.cost;
  }

  canBlock(playerId: string, actionType: ActionType): boolean {
    const player = this.getPlayer(playerId);
    if (!player || !player.isAlive) {
      return false;
    }

    const rule = ACTION_RULES[actionType];
    if (!rule.canBeBlocked) {
      return false;
    }

    // Check if player has a blocking card
    return player.cards.some(
      (card) => !card.revealed && rule.blockingCards?.includes(card.type)
    );
  }

  isGameOver(): boolean {
    const alivePlayers = this.state.players.filter((p) => p.isAlive);
    return alivePlayers.length <= 1;
  }

  // Helpers
  nextPlayer(): void {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      currentPlayer.isCurrentPlayer = false;
    }

    // Find next alive player
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while (!this.state.players[nextIndex].isAlive && attempts < this.state.players.length) {
      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }

    this.state.currentPlayerIndex = nextIndex;
    const nextPlayer = this.state.players[nextIndex];
    if (nextPlayer) {
      nextPlayer.isCurrentPlayer = true;
    }

    this.state.gamePhase = GamePhase.ACTION_SELECTION;
  }

  getAvailableActions(playerId: string): ActionType[] {
    const player = this.getPlayer(playerId);
    if (!player) {
      return [];
    }

    return Object.values(ActionType).filter((action) =>
      this.canPerformAction(playerId, action)
    );
  }

  getCurrentPlayer(): Player | null {
    return this.state.players[this.state.currentPlayerIndex] || null;
  }

  getPlayer(playerId: string): Player | null {
    return this.state.players.find((p) => p.id === playerId) || null;
  }

  private addLog(message: string): void {
    this.state.gameLog.push(message);
    // Keep only last 50 log entries
    if (this.state.gameLog.length > 50) {
      this.state.gameLog.shift();
    }
  }
}

