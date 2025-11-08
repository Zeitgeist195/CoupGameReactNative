import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Modal,
  Card,
  Text,
  Button,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { GamePhase, CardType, Player } from '../types';
import { CHALLENGE_TIMER, BLOCK_TIMER } from '../constants/rules';

interface ChallengeBlockModalProps {
  visible: boolean;
  gamePhase: GamePhase;
  pendingAction: any;
  currentPlayer: Player | null;
  allPlayers: Player[];
  onChallenge: (challengerId: string) => void;
  onBlock: (blockerId: string, blockingCard: CardType) => void;
  onSkip: () => void;
}

export default function ChallengeBlockModal({
  visible,
  gamePhase,
  pendingAction,
  currentPlayer,
  allPlayers,
  onChallenge,
  onBlock,
  onSkip,
}: ChallengeBlockModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [selectedBlockingCard, setSelectedBlockingCard] = useState<CardType | null>(null);

  const timer = gamePhase === GamePhase.WAITING_CHALLENGE
    ? CHALLENGE_TIMER
    : BLOCK_TIMER;

  useEffect(() => {
    if (visible) {
      setTimeRemaining(10);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0.1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [visible, gamePhase]);

  useEffect(() => {
    if (timeRemaining <= 0 && visible) {
      onSkip();
    }
  }, [timeRemaining, visible, onSkip]);

  if (!pendingAction) {
    return null;
  }

  const actionPlayer = allPlayers.find((p) => p.id === pendingAction.playerId);
  const canChallengePlayers = allPlayers.filter(
    (p) => p.id !== pendingAction.playerId && p.isAlive
  );
  const canBlockPlayers = allPlayers.filter(
    (p) => p.id !== pendingAction.playerId && p.isAlive
  );

  const getActionLabel = (actionType: string): string => {
    return actionType.replace(/_/g, ' ');
  };

  const getBlockingCards = (): CardType[] => {
    return pendingAction.blockingCards || [];
  };

  const progress = timeRemaining / 10;

  return (
    <Modal
      visible={visible}
      onDismiss={onSkip}
      contentContainerStyle={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {gamePhase === GamePhase.WAITING_CHALLENGE
              ? 'Challenge Phase'
              : 'Block Phase'}
          </Text>

          <Text variant="bodyLarge" style={styles.actionText}>
            {actionPlayer?.name} performed:{' '}
            {getActionLabel(pendingAction.type)}
          </Text>

          {pendingAction.targetPlayerId && (
            <Text variant="bodyMedium" style={styles.targetText}>
              Target:{' '}
              {allPlayers.find((p) => p.id === pendingAction.targetPlayerId)?.name}
            </Text>
          )}

          <View style={styles.timerContainer}>
            <ProgressBar progress={progress} color="#F44336" />
            <Text variant="bodySmall" style={styles.timerText}>
              {Math.ceil(timeRemaining)}s remaining
            </Text>
          </View>

          {gamePhase === GamePhase.WAITING_CHALLENGE && (
            <View style={styles.actionsContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Challenge this action?
              </Text>
              {canChallengePlayers.map((player) => (
                <Button
                  key={player.id}
                  mode="contained"
                  onPress={() => onChallenge(player.id)}
                  style={styles.actionButton}
                >
                  {player.name} Challenges
                </Button>
              ))}
            </View>
          )}

          {gamePhase === GamePhase.WAITING_BLOCK && (
            <View style={styles.actionsContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Block this action?
              </Text>
              {getBlockingCards().map((cardType) => (
                <Chip
                  key={cardType}
                  selected={selectedBlockingCard === cardType}
                  onPress={() => setSelectedBlockingCard(cardType)}
                  style={styles.chip}
                >
                  {cardType}
                </Chip>
              ))}
              {canBlockPlayers.map((player) => (
                <Button
                  key={player.id}
                  mode="contained"
                  onPress={() => {
                    if (selectedBlockingCard) {
                      onBlock(player.id, selectedBlockingCard);
                    }
                  }}
                  disabled={!selectedBlockingCard}
                  style={styles.actionButton}
                >
                  {player.name} Blocks
                </Button>
              ))}
            </View>
          )}

          <Button
            mode="outlined"
            onPress={onSkip}
            style={styles.skipButton}
          >
            Skip
          </Button>
        </Card.Content>
      </Card>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    elevation: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  actionText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  targetText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: 8,
  },
  chip: {
    marginBottom: 8,
    marginRight: 8,
  },
  skipButton: {
    marginTop: 8,
  },
});

