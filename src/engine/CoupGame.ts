// src/engine/CoupGame.ts
// Main game engine with official Coup rules correctly implemented

import {
  Character,
  ActionType,
  CounterActionType,
  Player,
  Action,
  CounterAction,
  Challenge,
  GameState,
  GamePhase,
  GameLogEntry,
  Card,
  GAME_CONSTANTS,
  ACTION_CONFIG
} from '../types';
import { uuidv4 } from '../utils/uuid';

export class CoupGame {
  private state: GameState;

  constructor(playerNames: string[]) {
    if (playerNames.length < GAME_CONSTANTS.MIN_PLAYERS || 
        playerNames.length > GAME_CONSTANTS.MAX_PLAYERS) {
      throw new Error(`Game requires ${GAME_CONSTANTS.MIN_PLAYERS}-${GAME_CONSTANTS.MAX_PLAYERS} players`);
    }

    this.state = this.initializeGame(playerNames);
  }

  /**
   * Initialize game state
   */
  private initializeGame(playerNames: string[]): GameState {
    // Create deck with 3 copies of each character
    const deck = this.createShuffledDeck();
    
    // Create players
    const players: Player[] = playerNames.map((name, index) => {
      const influences: Card[] = [
        { character: deck.pop()!, isRevealed: false },
        { character: deck.pop()!, isRevealed: false }
      ];

      // Special case for 2 players: first player gets 1 coin
      const coins = (playerNames.length === 2 && index === 0) 
        ? 1 
        : GAME_CONSTANTS.STARTING_COINS;

      return {
        id: uuidv4(),
        name,
        coins,
        influences,
        isEliminated: false,
        isAI: index > 0  // First player is human, rest are AI
      };
    });

    return {
      players,
      currentPlayerIndex: 0,
      courtDeck: deck,
      phase: {
        type: 'action',
        description: 'Choose an action'
      },
      pendingAction: null,
      gameLog: [{
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'action',
        message: 'Game started!',
        playerId: players[0].id,
        translationKey: 'log.game_started'
      }],
      gameOver: false,
      winnerId: null
    };
  }

  /**
   * Create and shuffle deck
   */
  private createShuffledDeck(): Character[] {
    const deck: Character[] = [];
    
    // Add 3 copies of each character
    Object.values(Character).forEach(character => {
      for (let i = 0; i < GAME_CONSTANTS.CARDS_PER_CHARACTER; i++) {
        deck.push(character);
      }
    });

    // Shuffle using Fisher-Yates algorithm
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return { ...this.state };
  }

  /**
   * Get current player
   */
  public getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /**
   * Perform an action
   */
  public performAction(action: Action): void {
    const actor = this.getPlayerById(action.actorId);
    
    if (!actor || actor.isEliminated) {
      throw new Error('Invalid actor');
    }

    if (actor.id !== this.getCurrentPlayer().id) {
      throw new Error('Not your turn');
    }

    // Validate action
    this.validateAction(action, actor);

    // Check if must Coup (10+ coins)
    if (actor.coins >= GAME_CONSTANTS.MANDATORY_COUP_THRESHOLD && 
        action.type !== ActionType.COUP) {
      throw new Error('Must Coup with 10+ coins');
    }

    // Set pending action
    this.state.pendingAction = {
      action,
      awaitingResponse: true
    };

    // Pay costs immediately
    const config = ACTION_CONFIG[action.type];
    if (config.cost > 0) {
      actor.coins -= config.cost;
      this.addLog({
        type: 'action',
        message: `Paid ${config.cost} coins`,
        playerId: actor.id,
        translationKey: 'log.coins_paid',
        translationParams: { 
          playerName: actor.name, 
          coins: config.cost 
        }
      });
    }

    // Log action
    if (action.targetId) {
      const target = this.getPlayerById(action.targetId);
      this.addLog({
        type: 'action',
        message: `${actor.name} uses ${action.type} on ${target?.name}`,
        playerId: actor.id,
        translationKey: 'log.action_targeted',
        translationParams: {
          playerName: actor.name,
          action: action.type,
          targetName: target?.name
        }
      });
    } else {
      this.addLog({
        type: 'action',
        message: `${actor.name} takes ${action.type}`,
        playerId: actor.id,
        translationKey: 'log.action_taken',
        translationParams: {
          playerName: actor.name,
          action: action.type
        }
      });
    }

    // Determine next phase
    if (config.canBeChallenged) {
      this.state.phase = {
        type: 'challenge',
        description: 'Other players can challenge'
      };
    } else if (config.canBeBlocked) {
      this.state.phase = {
        type: 'counteraction',
        description: 'Target can block'
      };
    } else {
      // Cannot be challenged or blocked - execute immediately
      this.resolveAction();
    }
  }

  /**
   * Issue a challenge
   */
  public challenge(challengerId: string, isForAction: boolean = true): void {
    if (!this.state.pendingAction) {
      throw new Error('No pending action to challenge');
    }

    const challenger = this.getPlayerById(challengerId);
    if (!challenger || challenger.isEliminated) {
      throw new Error('Invalid challenger');
    }

    const targetId = isForAction 
      ? this.state.pendingAction.action.actorId
      : this.state.pendingAction.counterAction!.actorId;

    const target = this.getPlayerById(targetId);
    if (!target) {
      throw new Error('Invalid target');
    }

    this.addLog({
      type: 'challenge',
      message: `${challenger.name} challenges ${target.name}`,
      playerId: challenger.id,
      translationKey: 'log.challenge_issued',
      translationParams: {
        challengerName: challenger.name,
        targetName: target.name
      }
    });

    // Determine which character is being challenged
    const claimedCharacter = isForAction
      ? this.state.pendingAction.action.claimedCharacter
      : this.state.pendingAction.counterAction!.claimedCharacter;

    if (!claimedCharacter) {
      throw new Error('No character to challenge');
    }

    // Check if target has the card
    const hasCard = target.influences.some(
      card => !card.isRevealed && card.character === claimedCharacter
    );

    if (hasCard) {
      // CHALLENGE FAILED - Challenger loses influence
      this.handleFailedChallenge(challenger, target, claimedCharacter, isForAction);
    } else {
      // CHALLENGE SUCCEEDED - Target loses influence, action fails
      this.handleSuccessfulChallenge(challenger, target, claimedCharacter, isForAction);
    }
  }

  /**
   * Handle failed challenge (defender has the card)
   * OFFICIAL RULE:
   * 1. Defender reveals the character card to all players (automatic)
   * 2. Revealed card is shuffled back into Court Deck
   * 3. Defender draws a new card from Court Deck
   * 4. Challenger loses 1 influence (penalty for wrong challenge)
   * 5. Original action succeeds as planned
   */
  private handleFailedChallenge(
    challenger: Player,
    defender: Player,
    claimedCharacter: Character,
    isForAction: boolean
  ): void {
    this.addLog({
      type: 'challenge',
      message: `Challenge failed! ${defender.name} had ${claimedCharacter}`,
      playerId: challenger.id,
      translationKey: 'log.challenge_failed',
      translationParams: {
        challengerName: challenger.name,
        targetName: defender.name,
        character: claimedCharacter
      }
    });

    // 1. Defender reveals the claimed character card automatically
    const defenderCard = defender.influences.find(
      c => !c.isRevealed && c.character === claimedCharacter
    );
    
    if (!defenderCard) {
      throw new Error('Defender should have the claimed card');
    }

    // Reveal the card
    defenderCard.isRevealed = true;

    this.addLog({
      type: 'resolution',
      message: `${defender.name} reveals ${claimedCharacter}`,
      playerId: defender.id,
      translationKey: 'log.card_revealed',
      translationParams: {
        playerName: defender.name,
        character: claimedCharacter
      }
    });

    // 2. Return revealed card to deck and draw new one
    this.returnCardAndDrawNew(defender, defenderCard);

    // 3. Wait for narrative modal to be dismissed before showing card selection
    this.state.phase = {
      type: 'narrative',
      description: 'Challenge failed - waiting for narrative modal'
    };
    
    // Store who needs to lose influence
    this.state.pendingAction!.challenge = {
      challengerId: challenger.id,
      targetId: defender.id,
      isForAction
    };

    // After narrative modal is dismissed, will transition to card_selection
  }

  /**
   * Handle successful challenge (defender doesn't have the card)
   */
  private handleSuccessfulChallenge(
    challenger: Player,
    defender: Player,
    claimedCharacter: Character,
    isForAction: boolean
  ): void {
    this.addLog({
      type: 'challenge',
      message: `Challenge succeeded! ${defender.name} didn't have ${claimedCharacter}`,
      playerId: challenger.id,
      translationKey: 'log.challenge_success',
      translationParams: {
        challengerName: challenger.name,
        targetName: defender.name,
        character: claimedCharacter
      }
    });

    // Wait for narrative modal to be dismissed before showing card selection
    this.state.phase = {
      type: 'narrative',
      description: 'Challenge succeeded - waiting for narrative modal'
    };

    // ACTION FAILS - will not be executed
    this.state.pendingAction!.challenge = {
      challengerId: challenger.id,
      targetId: defender.id,
      isForAction
    };
  }

  /**
   * Advance from narrative phase to card selection phase
   * Called after narrative modal is dismissed
   */
  public advanceFromNarrative(): void {
    if (this.state.phase.type !== 'narrative') {
      throw new Error('Not in narrative phase');
    }

    if (!this.state.pendingAction?.challenge) {
      throw new Error('No challenge pending');
    }

    const challenge = this.state.pendingAction.challenge;
    
    // Determine who should lose influence based on challenge outcome
    const isFailedChallenge = this.state.phase.description.includes('failed');
    const playerIdToLose = isFailedChallenge ? challenge.challengerId : challenge.targetId;
    const player = this.getPlayerById(playerIdToLose);

    if (!player) {
      throw new Error('Player not found');
    }

    // Check if player has only 1 unrevealed card - auto-lose it
    const unrevealedCards = player.influences.filter(c => !c.isRevealed);
    if (unrevealedCards.length === 1) {
      // Auto-lose the only card
      this.autoLoseInfluence(player, 'challenge');
      return;
    }

    // Transition to card selection phase
    this.state.phase = {
      type: 'card_selection',
      description: `${player.name} must lose an influence`
    };
  }

  /**
   * Automatically lose influence when player has only 1 card
   * @param player - Player who loses influence
   * @param reason - Reason for losing: 'coup', 'assassination', or 'challenge'
   */
  private autoLoseInfluence(player: Player, reason: 'coup' | 'assassination' | 'challenge'): void {
    // Find the only unrevealed card
    const unrevealedCard = player.influences.find(c => !c.isRevealed);
    if (!unrevealedCard) {
      throw new Error('Player should have at least one unrevealed card');
    }

    // Reveal the card
    unrevealedCard.isRevealed = true;

    // Add log with special translation key for narrative modal
    let translationKey = 'log.auto_influence_lost';
    let translationParams: Record<string, any> = {
      playerName: player.name,
      character: unrevealedCard.character
    };

    if (reason === 'coup') {
      translationKey = 'log.auto_influence_lost_coup';
    } else if (reason === 'assassination') {
      translationKey = 'log.auto_influence_lost_assassination';
    } else if (reason === 'challenge') {
      translationKey = 'log.auto_influence_lost_challenge';
    }

    this.addLog({
      type: 'resolution',
      message: `${player.name} automatically loses influence: ${unrevealedCard.character}`,
      playerId: player.id,
      translationKey,
      translationParams
    });

    // Check if player is eliminated
    const allRevealed = player.influences.every(c => c.isRevealed);
    if (allRevealed) {
      player.isEliminated = true;
      this.addLog({
        type: 'elimination',
        message: `${player.name} has been eliminated!`,
        playerId: player.id,
        translationKey: 'log.player_eliminated',
        translationParams: { playerName: player.name }
      });

      // Check for game over
      this.checkGameOver();
    }

    // Handle post-influence-loss logic based on pending action
    if (this.state.pendingAction?.challenge) {
      const challenge = this.state.pendingAction.challenge;
      
      if (player.id === challenge.challengerId) {
        // Challenger lost influence (failed challenge)
        if (challenge.isForAction) {
          this.state.pendingAction.challenge = undefined;
          this.resolveAction();
        } else {
          this.state.pendingAction = null;
          this.nextTurn();
        }
      } else if (player.id === challenge.targetId) {
        // Defender lost influence (successful challenge)
        if (challenge.isForAction) {
          this.state.pendingAction = null;
          this.nextTurn();
        } else {
          this.state.pendingAction.counterAction = undefined;
          this.state.pendingAction.challenge = undefined;
          this.resolveAction();
        }
      }
    } else if (this.state.pendingAction?.action.type === ActionType.ASSASSINATE || 
               this.state.pendingAction?.action.type === ActionType.COUP) {
      // Action already executed, just need to advance turn
      this.state.pendingAction = null;
      this.nextTurn();
    } else {
      // Other actions that might need resolution
      this.resolveAction();
    }
  }

  /**
   * Player loses an influence (selects which card to reveal)
   */
  public loseInfluence(playerId: string, cardIndex: number): void {
    const player = this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Invalid player');
    }

    if (cardIndex < 0 || cardIndex >= player.influences.length) {
      throw new Error('Invalid card index');
    }

    const card = player.influences[cardIndex];
    if (card.isRevealed) {
      throw new Error('Card already revealed');
    }

    // Reveal the card
    card.isRevealed = true;

    this.addLog({
      type: 'resolution',
      message: `${player.name} loses influence: ${card.character}`,
      playerId: player.id,
      translationKey: 'log.influence_lost',
      translationParams: {
        playerName: player.name,
        character: card.character
      }
    });

    // Check if player is eliminated
    const allRevealed = player.influences.every(c => c.isRevealed);
    if (allRevealed) {
      player.isEliminated = true;
      this.addLog({
        type: 'elimination',
        message: `${player.name} has been eliminated!`,
        playerId: player.id,
        translationKey: 'log.player_eliminated',
        translationParams: { playerName: player.name }
      });

      // Check for game over
      this.checkGameOver();
    }

    // Handle post-influence-loss logic
    if (this.state.pendingAction?.challenge) {
      const challenge = this.state.pendingAction.challenge;
      
      if (playerId === challenge.challengerId) {
        // Challenger lost influence (failed challenge)
        if (challenge.isForAction) {
          // Failed challenge to action: defender already revealed card and drew new one
          // Now continue with original action resolution
          // BUT: Only if the action wasn't already executed
          // Clear challenge info before resolving
          this.state.pendingAction.challenge = undefined;
          this.resolveAction();
        } else {
          // Failed challenge to counteraction: counteraction succeeds, action is blocked
          this.state.pendingAction = null;
          this.nextTurn();
        }
      } else if (playerId === challenge.targetId) {
        // Defender lost influence (successful challenge)
        if (challenge.isForAction) {
          // Successful challenge to action: action FAILS
          // Coins paid are NOT refunded (already paid in performAction)
          // IMPORTANT: Action should NOT execute - it was successfully challenged
          this.state.pendingAction = null;
          this.nextTurn();
        } else {
          // Successful challenge to counteraction: counteraction fails, action SUCCEEDS
          // Remove the counteraction so action can proceed
          this.state.pendingAction.counterAction = undefined;
          this.state.pendingAction.challenge = undefined;
          this.resolveAction();
        }
      }
    } else {
      // Normal influence loss from assassination or coup
      // Check if this is from an action that requires target to lose influence
      if (this.state.pendingAction?.action.type === ActionType.ASSASSINATE || 
          this.state.pendingAction?.action.type === ActionType.COUP) {
        // Action already executed, just need to advance turn
        this.state.pendingAction = null;
        this.nextTurn();
      } else {
        // Other actions that might need resolution
        this.resolveAction();
      }
    }
  }

  /**
   * Return card to deck and draw new one
   */
  private returnCardAndDrawNew(player: Player, card: Card): void {
    // Add card back to deck
    this.state.courtDeck.push(card.character);
    
    // Shuffle deck
    this.shuffleDeck();
    
    // Draw new card
    if (this.state.courtDeck.length > 0) {
      card.character = this.state.courtDeck.pop()!;
      card.isRevealed = false;
    }
  }

  /**
   * Shuffle the court deck
   */
  private shuffleDeck(): void {
    const deck = this.state.courtDeck;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * Counteraction
   */
  public counteract(counterAction: CounterAction): void {
    if (!this.state.pendingAction) {
      throw new Error('No action to counteract');
    }

    const actor = this.getPlayerById(counterAction.actorId);
    if (!actor || actor.isEliminated) {
      throw new Error('Invalid actor');
    }

    // Validate counteraction
    this.validateCounterAction(counterAction);

    this.state.pendingAction.counterAction = counterAction;

    this.addLog({
      type: 'counteraction',
      message: `${actor.name} blocks with ${counterAction.claimedCharacter}`,
      playerId: actor.id,
      translationKey: 'log.counteraction',
      translationParams: {
        playerName: actor.name,
        character: counterAction.claimedCharacter
      }
    });

    // Move to challenge phase for counteraction
    this.state.phase = {
      type: 'challenge_counteraction',
      description: 'Can challenge the block'
    };
  }

  /**
   * Allow action (don't challenge or counteract)
   */
  public allowAction(): void {
    if (this.state.phase.type === 'challenge') {
      // No one challenged - move to counteraction or resolution
      const config = ACTION_CONFIG[this.state.pendingAction!.action.type];
      if (config.canBeBlocked) {
        this.state.phase = {
          type: 'counteraction',
          description: 'Target can block'
        };
      } else {
        this.resolveAction();
      }
    } else if (this.state.phase.type === 'counteraction') {
      // No one blocked - resolve action
      this.resolveAction();
    } else if (this.state.phase.type === 'challenge_counteraction') {
      // No one challenged the block - action is blocked
      this.state.pendingAction = null;
      this.nextTurn();
    }
  }

  /**
   * Resolve the pending action
   */
  private resolveAction(): void {
    if (!this.state.pendingAction) {
      return;
    }

    const action = this.state.pendingAction.action;
    const actor = this.getPlayerById(action.actorId);
    
    if (!actor) {
      return;
    }

    // Check if action was blocked
    if (this.state.pendingAction.counterAction) {
      this.addLog({
        type: 'resolution',
        message: 'Action was blocked',
        playerId: actor.id,
        translationKey: 'log.action_blocked'
      });
      this.state.pendingAction = null;
      this.nextTurn();
      return;
    }

    // Execute action based on type
    switch (action.type) {
      case ActionType.INCOME:
        this.executeIncome(actor);
        break;
      case ActionType.FOREIGN_AID:
        this.executeForeignAid(actor);
        break;
      case ActionType.COUP:
        this.executeCoup(actor, action.targetId!);
        return; // Don't advance turn yet - target must choose card
      case ActionType.TAX:
        this.executeTax(actor);
        break;
      case ActionType.ASSASSINATE:
        this.executeAssassinate(actor, action.targetId!);
        return; // Don't advance turn yet - target must choose card
      case ActionType.STEAL:
        this.executeSteal(actor, action.targetId!);
        break;
      case ActionType.EXCHANGE:
        this.executeExchange(actor);
        return; // Special handling for exchange
    }

    this.state.pendingAction = null;
    this.nextTurn();
  }

  /**
   * Execute Income action
   */
  private executeIncome(actor: Player): void {
    actor.coins += 1;
    this.addLog({
      type: 'resolution',
      message: `${actor.name} gains 1 coin`,
      playerId: actor.id,
      translationKey: 'log.coins_gained',
      translationParams: { playerName: actor.name, coins: 1 }
    });
  }

  /**
   * Execute Foreign Aid action
   */
  private executeForeignAid(actor: Player): void {
    actor.coins += 2;
    this.addLog({
      type: 'resolution',
      message: `${actor.name} gains 2 coins`,
      playerId: actor.id,
      translationKey: 'log.coins_gained',
      translationParams: { playerName: actor.name, coins: 2 }
    });
  }

  /**
   * Execute Coup action
   */
  private executeCoup(actor: Player, targetId: string): void {
    const target = this.getPlayerById(targetId);
    if (!target) {
      return;
    }

    // Check if target has only 1 unrevealed card - auto-lose it
    const unrevealedCards = target.influences.filter(c => !c.isRevealed);
    if (unrevealedCards.length === 1) {
      // Auto-lose the only card
      this.autoLoseInfluence(target, 'coup');
      return;
    }

    // Target must lose an influence (has multiple cards to choose from)
    this.state.phase = {
      type: 'card_selection',
      description: 'Target must lose an influence'
    };
  }

  /**
   * Execute Tax action
   */
  private executeTax(actor: Player): void {
    actor.coins += 3;
    this.addLog({
      type: 'resolution',
      message: `${actor.name} gains 3 coins`,
      playerId: actor.id,
      translationKey: 'log.coins_gained',
      translationParams: { playerName: actor.name, coins: 3 }
    });
  }

  /**
   * Execute Assassinate action
   */
  private executeAssassinate(actor: Player, targetId: string): void {
    const target = this.getPlayerById(targetId);
    if (!target) {
      return;
    }

    // Check if target has only 1 unrevealed card - auto-lose it
    const unrevealedCards = target.influences.filter(c => !c.isRevealed);
    if (unrevealedCards.length === 1) {
      // Auto-lose the only card
      this.autoLoseInfluence(target, 'assassination');
      return;
    }

    // Target must lose an influence (has multiple cards to choose from)
    this.state.phase = {
      type: 'card_selection',
      description: 'Target must lose an influence'
    };
  }

  /**
   * Execute Steal action
   */
  private executeSteal(actor: Player, targetId: string): void {
    const target = this.getPlayerById(targetId);
    if (!target) {
      return;
    }

    const stolenCoins = Math.min(2, target.coins);
    target.coins -= stolenCoins;
    actor.coins += stolenCoins;

    this.addLog({
      type: 'resolution',
      message: `${actor.name} steals ${stolenCoins} coins from ${target.name}`,
      playerId: actor.id,
      translationKey: 'log.coins_stolen',
      translationParams: {
        playerName: actor.name,
        coins: stolenCoins,
        targetName: target.name
      }
    });
  }

  /**
   * Execute Exchange action (Ambassador)
   * OFFICIAL RULE: Draw 2 cards, have original + 2 new, choose same number as original to keep
   * Example: If player has 1 card, draws 2, chooses 1 of 3 to keep
   */
  private executeExchange(actor: Player): void {
    // Count how many unrevealed cards the player currently has
    const unrevealedCards = actor.influences.filter(c => !c.isRevealed);
    const originalCardCount = unrevealedCards.length;

    // Draw 2 cards from deck
    const drawnCards: Character[] = [];
    for (let i = 0; i < GAME_CONSTANTS.AMBASSADOR_DRAW_COUNT; i++) {
      if (this.state.courtDeck.length > 0) {
        drawnCards.push(this.state.courtDeck.pop()!);
      }
    }

    // Create array with all cards (original unrevealed + 2 drawn)
    const allCards: Card[] = [
      ...unrevealedCards,
      ...drawnCards.map(char => ({ character: char, isRevealed: false }))
    ];

    // Store in pendingAction for UI to access
    if (this.state.pendingAction) {
      this.state.pendingAction.ambassadorDrawnCards = drawnCards;
      this.state.pendingAction.ambassadorAllCards = allCards;
    }
    
    this.addLog({
      type: 'resolution',
      message: `${actor.name} exchanges cards with the deck`,
      playerId: actor.id,
      translationKey: 'log.ambassador_exchange',
      translationParams: { playerName: actor.name }
    });

    // Phase will be 'card_selection' for choosing cards
    const totalCards = allCards.length;
    this.state.phase = {
      type: 'card_selection',
      description: `Choose ${originalCardCount} card(s) to keep from ${totalCards} available`
    };
  }

  /**
   * Complete Ambassador Exchange - player chooses cards to keep
   * @param playerId - ID of player doing exchange
   * @param cardIndices - Indices of cards to keep (number equals original card count)
   */
  public completeExchange(playerId: string, cardIndices: number[]): void {
    if (!this.state.pendingAction || 
        this.state.pendingAction.action.type !== ActionType.EXCHANGE ||
        !this.state.pendingAction.ambassadorAllCards) {
      throw new Error('No pending exchange action');
    }

    const actor = this.getPlayerById(playerId);
    if (!actor || actor.id !== this.state.pendingAction.action.actorId) {
      throw new Error('Invalid player');
    }

    // Calculate how many cards the player should keep (same as original unrevealed count)
    const originalCardCount = actor.influences.filter(c => !c.isRevealed).length;
    
    if (cardIndices.length !== originalCardCount) {
      throw new Error(`Must select exactly ${originalCardCount} card(s)`);
    }

    const allCards = this.state.pendingAction.ambassadorAllCards;
    const cardsToKeep = cardIndices.map(idx => allCards[idx]);
    const cardsToReturn = allCards.filter((_, idx) => !cardIndices.includes(idx));

    // Remove old unrevealed influences and add new ones, keeping revealed cards
    const revealedCards = actor.influences.filter(c => c.isRevealed);
    actor.influences = [
      ...revealedCards,
      ...cardsToKeep.map(card => ({ ...card, isRevealed: false }))
    ];

    // Return the other 2 cards to deck
    cardsToReturn.forEach(card => {
      this.state.courtDeck.push(card.character);
    });

    // Shuffle deck
    this.shuffleDeck();

    this.addLog({
      type: 'resolution',
      message: `${actor.name} completed exchange`,
      playerId: actor.id,
      translationKey: 'log.exchange_completed',
      translationParams: { playerName: actor.name }
    });

    // Clear pending action and move to next turn
    this.state.pendingAction = null;
    this.nextTurn();
  }

  /**
   * Validate action
   */
  private validateAction(action: Action, actor: Player): void {
    const config = ACTION_CONFIG[action.type];

    // Check coins
    if (config.cost > actor.coins) {
      throw new Error('Not enough coins');
    }

    // Check target
    if (config.requiresTarget && !action.targetId) {
      throw new Error('Action requires a target');
    }

    if (action.targetId) {
      const target = this.getPlayerById(action.targetId);
      if (!target || target.isEliminated || target.id === actor.id) {
        throw new Error('Invalid target');
      }
    }
  }

  /**
   * Validate counteraction
   */
  private validateCounterAction(counterAction: CounterAction): void {
    // TODO: Implement validation
  }

  /**
   * Move to next turn
   */
  private nextTurn(): void {
    do {
      this.state.currentPlayerIndex = 
        (this.state.currentPlayerIndex + 1) % this.state.players.length;
    } while (this.getCurrentPlayer().isEliminated);

    this.state.phase = {
      type: 'action',
      description: 'Choose an action'
    };

    this.addLog({
      type: 'action',
      message: `${this.getCurrentPlayer().name}'s turn`,
      playerId: this.getCurrentPlayer().id,
      translationKey: 'log.player_turn',
      translationParams: { playerName: this.getCurrentPlayer().name }
    });
  }

  /**
   * Check if game is over
   */
  private checkGameOver(): void {
    const remainingPlayers = this.state.players.filter(p => !p.isEliminated);
    
    if (remainingPlayers.length === 1) {
      this.state.gameOver = true;
      this.state.winnerId = remainingPlayers[0].id;
      
      this.addLog({
        type: 'resolution',
        message: `${remainingPlayers[0].name} wins!`,
        playerId: remainingPlayers[0].id,
        translationKey: 'log.game_won',
        translationParams: { playerName: remainingPlayers[0].name }
      });
    }
  }

  /**
   * Get player by ID
   */
  private getPlayerById(id: string): Player | undefined {
    return this.state.players.find(p => p.id === id);
  }

  /**
   * Add log entry
   */
  private addLog(entry: Omit<GameLogEntry, 'id' | 'timestamp'>): void {
    this.state.gameLog.push({
      ...entry,
      id: uuidv4(),
      timestamp: Date.now()
    });
  }
}
