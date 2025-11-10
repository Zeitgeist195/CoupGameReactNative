import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Modal,
  Card,
  Text,
  Button,
  ProgressBar,
} from 'react-native-paper';
import { CardType, Player, ActionType, Character, CounterActionType } from '../types';
import { characterToCardType } from '../types';
import { CHALLENGE_TIMER, BLOCK_TIMER } from '../constants/rules';
import { getCardColor } from '../utils/cardTranslations';
import { getCharacterName, getActionName } from '../i18n';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';

interface ChallengeBlockModalProps {
  visible: boolean;
  gamePhase: string; // 'challenge' | 'counteraction' | 'challenge_counteraction'
  pendingAction: any;
  currentPlayer: Player | null;
  allPlayers: Player[];
  onChallenge: (challengerId: string) => void;
  onBlock: (blockerId: string, blockingCharacter: Character) => void;
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
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [selectedBlockingCharacter, setSelectedBlockingCharacter] = useState<Character | null>(null);

  const timer = gamePhase === 'challenge'
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

  const actionPlayer = allPlayers.find((p) => p.id === pendingAction?.action?.actorId);
  const canChallengePlayers = allPlayers.filter(
    (p) => p.id !== pendingAction?.action?.actorId && !p.isEliminated
  );
  const canBlockPlayers = allPlayers.filter(
    (p) => p.id !== pendingAction?.action?.targetId && !p.isEliminated
  );

  const getActionLabel = (actionType: string): string => {
    try {
      return getActionName(actionType as ActionType);
    } catch {
      return actionType.replace(/_/g, ' ');
    }
  };

  const getBlockingCharacters = (): Character[] => {
    if (!pendingAction?.action) return [];
    const actionType = pendingAction.action.type;
    
    // Determine which characters can block this action
    if (actionType === ActionType.FOREIGN_AID) {
      return [Character.DUKE];
    } else if (actionType === ActionType.ASSASSINATE) {
      return [Character.CONTESSA];
    } else if (actionType === ActionType.STEAL) {
      return [Character.CAPTAIN, Character.AMBASSADOR];
    }
    return [];
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
            {gamePhase === 'challenge'
              ? t('phases.challenge')
              : t('phases.counteraction')}
          </Text>

          <Text variant="bodyLarge" style={styles.actionText}>
            {t('log.action_taken', { 
              playerName: actionPlayer?.name || '',
              action: getActionLabel(pendingAction?.action?.type || '')
            })}
          </Text>

          {pendingAction?.action?.targetId && (
            <Text variant="bodyMedium" style={styles.targetText}>
              {t('game.selectTarget')}:{' '}
              {allPlayers.find((p) => p.id === pendingAction.action.targetId)?.name}
            </Text>
          )}

          <View style={styles.timerContainer}>
            <ProgressBar progress={progress} color={COLORS.danger} />
            <Text variant="bodySmall" style={styles.timerText}>
              {Math.ceil(timeRemaining)}s {t('game.remaining', { defaultValue: 'restantes' })}
            </Text>
          </View>

          {gamePhase === 'challenge' && (
            <View style={styles.actionsContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('game.challenge')} {t('game.thisAction', { defaultValue: 'esta ação' })}?
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

          {(gamePhase === 'counteraction' || gamePhase === 'challenge_counteraction') && (
            <View style={styles.actionsContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('game.block')} {t('game.thisAction', { defaultValue: 'esta ação' })}?
              </Text>
              {getBlockingCharacters().map((character) => (
                <TouchableOpacity
                  key={character}
                  onPress={() => setSelectedBlockingCharacter(character)}
                  style={[
                    styles.chipButton,
                    selectedBlockingCharacter === character && styles.chipButtonSelected,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    selectedBlockingCharacter === character && styles.chipTextSelected,
                  ]}>
                    {getCharacterName(character)}
                  </Text>
                </TouchableOpacity>
              ))}
              {canBlockPlayers.map((player) => (
                <Button
                  key={player.id}
                  mode="contained"
                  onPress={() => {
                    if (selectedBlockingCharacter) {
                      onBlock(player.id, selectedBlockingCharacter);
                    }
                  }}
                  disabled={!selectedBlockingCharacter}
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
            {t('game.allowAction')}
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

