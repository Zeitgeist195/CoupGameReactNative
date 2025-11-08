import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Button, Portal } from 'react-native-paper';
import { useGame } from '../context/GameContext';
import PlayerCard from '../components/PlayerCard';
import ActionButtons from '../components/ActionButtons';
import ChallengeBlockModal from '../components/ChallengeBlockModal';
import CardSelectionModal from '../components/CardSelectionModal';
import GameLog from '../components/GameLog';
import { GamePhase } from '../types';

export default function GameScreen({ navigation }: any) {
  const { gameState, game, dispatch } = useGame();
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (gameState.gamePhase === GamePhase.GAME_OVER) {
      navigation.navigate('GameOver');
    }
  }, [gameState.gamePhase, navigation]);

  const currentPlayer = game.getCurrentPlayer();
  const otherPlayers = gameState.players.filter(
    (p) => p.id !== currentPlayer?.id
  );

  const handleAction = (action: any, targetId?: string) => {
    try {
      dispatch({ type: 'EXECUTE_ACTION', payload: { action, targetId } });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChallenge = (challengerId: string) => {
    try {
      dispatch({ type: 'CHALLENGE_ACTION', payload: challengerId });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleBlock = (blockerId: string, blockingCard: any) => {
    try {
      dispatch({
        type: 'BLOCK_ACTION',
        payload: { blockerId, blockingCard },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSkipChallenge = () => {
    try {
      dispatch({ type: 'SKIP_CHALLENGE' });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSkipBlock = () => {
    try {
      dispatch({ type: 'SKIP_BLOCK' });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSelectCard = (cardIndex: number) => {
    // Find the player who needs to select a card
    const playerSelectingCard = gameState.players.find((p) => {
      if (!p.isAlive) return false;
      const aliveCards = p.cards.filter((c) => !c.revealed);
      return aliveCards.length > 1;
    });

    const targetPlayer = playerSelectingCard || currentPlayer;
    if (targetPlayer) {
      try {
        dispatch({
          type: 'SELECT_CARD_TO_LOSE',
          payload: { playerId: targetPlayer.id, cardIndex },
        });
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  const showChallengeBlockModal =
    gameState.gamePhase === GamePhase.WAITING_CHALLENGE ||
    gameState.gamePhase === GamePhase.WAITING_BLOCK;

  const showCardSelectionModal =
    gameState.gamePhase === GamePhase.CARD_LOSS_SELECTION;

  // Find the player who needs to select a card to lose
  const playerSelectingCard = gameState.players.find((p) => {
    if (!p.isAlive) return false;
    const aliveCards = p.cards.filter((c) => !c.revealed);
    return aliveCards.length > 1;
  });

  if (!currentPlayer) {
    return (
      <View style={styles.container}>
        <Text>No current player</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Coup Game
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowCards(!showCards)}
            style={styles.toggleButton}
          >
            {showCards ? 'Hide' : 'Show'} Cards
          </Button>
        </View>

        <View style={styles.playersSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Players
          </Text>
          {gameState.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={player.isCurrentPlayer}
              showCards={showCards && player.id === currentPlayer.id}
            />
          ))}
        </View>

        {gameState.gamePhase === GamePhase.ACTION_SELECTION &&
          currentPlayer.isCurrentPlayer && (
            <View style={styles.actionsSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Your Turn - Choose an Action
              </Text>
              <ActionButtons
                currentPlayer={currentPlayer}
                otherPlayers={otherPlayers}
                onAction={handleAction}
              />
            </View>
          )}

        {gameState.gamePhase === GamePhase.ACTION_SELECTION &&
          !currentPlayer.isCurrentPlayer && (
            <View style={styles.waitingSection}>
              <Text variant="titleMedium" style={styles.waitingText}>
                Waiting for {currentPlayer.name}...
              </Text>
            </View>
          )}

        <GameLog logs={gameState.gameLog} />
      </ScrollView>

      <Portal>
        <ChallengeBlockModal
          visible={showChallengeBlockModal}
          gamePhase={gameState.gamePhase}
          pendingAction={gameState.pendingAction}
          currentPlayer={currentPlayer}
          allPlayers={gameState.players}
          onChallenge={handleChallenge}
          onBlock={handleBlock}
          onSkip={
            gameState.gamePhase === GamePhase.WAITING_CHALLENGE
              ? handleSkipChallenge
              : handleSkipBlock
          }
        />

        <CardSelectionModal
          visible={showCardSelectionModal}
          player={playerSelectingCard || currentPlayer}
          onSelectCard={(cardIndex) => {
            const player = playerSelectingCard || currentPlayer;
            if (player) {
              handleSelectCard(cardIndex);
            }
          }}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  toggleButton: {
    minWidth: 100,
  },
  playersSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 16,
  },
  waitingSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  waitingText: {
    color: '#666',
  },
});

