import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Modal,
  Card,
  Text,
  Button,
  ProgressBar,
} from 'react-native-paper';
import { GamePhase, CardType, Player, ActionType } from '../types';
import { CHALLENGE_TIMER, BLOCK_TIMER } from '../constants/rules';
import { getCardName, getActionName } from '../utils/cardTranslations';
import { COLORS } from '../constants/colors';

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
    // Usar função utilitária se for um ActionType válido
    try {
      return getActionName(actionType as ActionType);
    } catch {
      // Fallback para strings não mapeadas
      return actionType.replace(/_/g, ' ');
    }
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
              ? 'Fase de Desafio'
              : 'Fase de Bloqueio'}
          </Text>

          <Text variant="bodyLarge" style={styles.actionText}>
            {actionPlayer?.name} executou:{' '}
            {getActionLabel(pendingAction.type)}
          </Text>

          {pendingAction.targetPlayerId && (
            <Text variant="bodyMedium" style={styles.targetText}>
              Alvo:{' '}
              {allPlayers.find((p) => p.id === pendingAction.targetPlayerId)?.name}
            </Text>
          )}

          <View style={styles.timerContainer}>
            <ProgressBar progress={progress} color={COLORS.danger} />
            <Text variant="bodySmall" style={styles.timerText}>
              {Math.ceil(timeRemaining)}s restantes
            </Text>
          </View>

          {gamePhase === GamePhase.WAITING_CHALLENGE && (
            <View style={styles.actionsContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Desafiar esta ação?
              </Text>
              {canChallengePlayers.map((player) => (
                <Button
                  key={player.id}
                  mode="contained"
                  onPress={() => onChallenge(player.id)}
                  style={styles.actionButton}
                >
                  {player.name} Desafia
                </Button>
              ))}
            </View>
          )}

          {gamePhase === GamePhase.WAITING_BLOCK && (
            <View style={styles.actionsContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Bloquear esta ação?
              </Text>
              {getBlockingCards().map((cardType) => (
                <TouchableOpacity
                  key={cardType}
                  onPress={() => setSelectedBlockingCard(cardType)}
                  style={[
                    styles.chipButton,
                    selectedBlockingCard === cardType && styles.chipButtonSelected,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    selectedBlockingCard === cardType && styles.chipTextSelected,
                  ]}>
                    {getCardName(cardType)}
                  </Text>
                </TouchableOpacity>
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
                  {player.name} Bloqueia
                </Button>
              ))}
            </View>
          )}

          <Button
            mode="outlined"
            onPress={onSkip}
            style={styles.skipButton}
          >
            Pular
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
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  actionText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  targetText: {
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.textSecondary,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    textAlign: 'center',
    marginTop: 8,
    color: COLORS.textSecondary,
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
  chipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    backgroundColor: COLORS.cardBackground,
  },
  chipButtonSelected: {
    borderColor: COLORS.buttonPrimary,
    backgroundColor: COLORS.buttonPrimary + '30',
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  chipTextSelected: {
    color: COLORS.buttonPrimary,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 8,
  },
});

