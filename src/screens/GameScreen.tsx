import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Text, Button, Portal, Chip } from 'react-native-paper';
import { useGame } from '../context/GameContext';
import PlayerCard from '../components/PlayerCard';
import ActionButtons from '../components/ActionButtons';
import ChallengeBlockModal from '../components/ChallengeBlockModal';
import CardSelectionModal from '../components/CardSelectionModal';
import AmbassadorExchangeModal from '../components/AmbassadorExchangeModal';
import NarrativeModal from '../components/NarrativeModal';
import GameLog from '../components/GameLog';
import Toast from '../components/Toast';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';
import { Character, ActionType, Player } from '../types';
import { getCharacterName } from '../i18n';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { gameState, game, dispatch } = useGame();
  const [showCards, setShowCards] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [narrativeModal, setNarrativeModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onDismiss: () => void;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });
  const previousLogLength = React.useRef(gameState?.gameLog?.length || 0);

  // Redirect to Setup if gameState is null (game was reset)
  useEffect(() => {
    if (!gameState) {
      navigation.navigate('Setup');
      return;
    }
  }, [gameState, navigation]);

  useEffect(() => {
    if (gameState && gameState.gameOver) {
      navigation.navigate('GameOver');
    }
  }, [gameState?.gameOver, navigation]);

  // Show narrative modal when entering narrative phase or when auto-lose happens
  useEffect(() => {
    if (!gameState) return;
    
    const phaseType = gameState.phase?.type;
    const challenge = gameState.pendingAction?.challenge;
    
    // Check for auto-lose influence events (player has only 1 card)
    if (gameState.gameLog.length > previousLogLength.current) {
      const newLogEntry = gameState.gameLog[gameState.gameLog.length - 1];
      
      if (newLogEntry.translationKey === 'log.auto_influence_lost_coup' ||
          newLogEntry.translationKey === 'log.auto_influence_lost_assassination' ||
          newLogEntry.translationKey === 'log.auto_influence_lost_challenge') {
        const params = newLogEntry.translationParams || {};
        let title = '';
        let message = '';
        
        if (newLogEntry.translationKey === 'log.auto_influence_lost_coup') {
          title = t('narrative.coup.title', { defaultValue: 'Golpe de Estado!' });
          message = t('narrative.coup.message', {
            defaultValue: '{{playerName}} tinha apenas uma carta e perdeu {{character}} automaticamente.',
            playerName: params.playerName,
            character: t(`characters.${params.character}`, { defaultValue: params.character })
          });
        } else if (newLogEntry.translationKey === 'log.auto_influence_lost_assassination') {
          title = t('narrative.assassination.title', { defaultValue: 'Assassinato!' });
          message = t('narrative.assassination.message', {
            defaultValue: '{{playerName}} tinha apenas uma carta e perdeu {{character}} automaticamente.',
            playerName: params.playerName,
            character: t(`characters.${params.character}`, { defaultValue: params.character })
          });
        } else if (newLogEntry.translationKey === 'log.auto_influence_lost_challenge') {
          title = t('narrative.challenge.title', { defaultValue: 'Perda de Influência!' });
          message = t('narrative.challenge.message', {
            defaultValue: '{{playerName}} tinha apenas uma carta e perdeu {{character}} automaticamente.',
            playerName: params.playerName,
            character: t(`characters.${params.character}`, { defaultValue: params.character })
          });
        }
        
        const modalData = {
          visible: true,
          title,
          message,
          onDismiss: () => {
            setNarrativeModal(null);
          }
        };
        setNarrativeModal(modalData);
        previousLogLength.current = gameState.gameLog.length;
        return;
      }
    }
    
    // If we're in narrative phase and don't have a modal yet, create one
    if (phaseType === 'narrative' && !narrativeModal && challenge) {
      // Find the relevant log entry
      const challengeLog = gameState.gameLog
        .slice()
        .reverse()
        .find(log => log.translationKey === 'log.challenge_failed' || log.translationKey === 'log.challenge_success');
      
      if (challengeLog) {
        const params = challengeLog.translationParams || {};
        const isFailed = challengeLog.translationKey === 'log.challenge_failed';
        
        const modalData = {
          visible: true,
          title: isFailed ? 'Desafio Falhou!' : 'Desafio Bem-Sucedido!',
          message: isFailed
            ? `${params.targetName} revelou ${t(`characters.${params.character}`, { defaultValue: params.character })}! ${params.challengerName} perdeu o desafio e deve perder uma influência.`
            : `${params.targetName} não tinha ${t(`characters.${params.character}`, { defaultValue: params.character })}! ${params.targetName} deve perder uma influência.`,
          onDismiss: () => {
            setNarrativeModal(null);
            // Advance from narrative phase to card selection
            dispatch({ type: 'ADVANCE_FROM_NARRATIVE' });
          }
        };
        setNarrativeModal(modalData);
      }
    }
  }, [gameState?.phase?.type, gameState?.pendingAction?.challenge, gameState?.gameLog, narrativeModal, dispatch, t]);

  // Mostrar toast quando há nova entrada no log
  useEffect(() => {
    if (!gameState || !gameState.gameLog) return;
    
    if (gameState.gameLog.length > previousLogLength.current) {
      const newLogEntry = gameState.gameLog[gameState.gameLog.length - 1];
      const logMessage = newLogEntry.message || '';
      const logLower = logMessage.toLowerCase();
      
      // Don't show toast for challenge events or auto-lose events - narrative modal handles those
      if (newLogEntry.translationKey === 'log.challenge_failed' || 
          newLogEntry.translationKey === 'log.challenge_success' ||
          newLogEntry.translationKey === 'log.auto_influence_lost_coup' ||
          newLogEntry.translationKey === 'log.auto_influence_lost_assassination' ||
          newLogEntry.translationKey === 'log.auto_influence_lost_challenge') {
        return;
      }
      
      // Show toast for other events (only if no narrative modal)
      let type: 'success' | 'error' | 'info' | 'warning' = 'info';
      if (logLower.includes('eliminado') || logLower.includes('perde') || logLower.includes('loses')) {
        type = 'error';
      } else if (logLower.includes('ganhou') || logLower.includes('recebeu') || logLower.includes('wins') || logLower.includes('gains')) {
        type = 'success';
      } else if (logLower.includes('desafio') || logLower.includes('bloqueio') || logLower.includes('challenge') || logLower.includes('block')) {
        type = 'warning';
      }

      setToast({
        message: logMessage,
        type,
        visible: true,
      });
    }
    previousLogLength.current = gameState.gameLog.length;
  }, [gameState?.gameLog, t]);

  const currentPlayer = game?.getCurrentPlayer();
  const otherPlayers = (gameState?.players || []).filter(
    (p) => p.id !== currentPlayer?.id
  );

  const handleAction = (action: ActionType, targetId?: string) => {
    try {
      // Determine claimedCharacter based on action type
      let claimedCharacter: Character | undefined;
      if (action === ActionType.TAX) {
        claimedCharacter = Character.DUKE;
      } else if (action === ActionType.STEAL) {
        claimedCharacter = Character.CAPTAIN;
      } else if (action === ActionType.ASSASSINATE) {
        claimedCharacter = Character.ASSASSIN;
      } else if (action === ActionType.EXCHANGE) {
        claimedCharacter = Character.AMBASSADOR;
      }
      
      dispatch({ 
        type: 'EXECUTE_ACTION', 
        payload: { action, targetId, claimedCharacter } 
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível executar a ação');
    }
  };

  const handleChallenge = (challengerId: string) => {
    try {
      // Let the engine handle all the logic
      dispatch({ type: 'CHALLENGE_ACTION', payload: challengerId });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível desafiar a ação');
    }
  };

  const handleBlock = (blockerId: string, blockingCharacter: Character) => {
    try {
      dispatch({
        type: 'BLOCK_ACTION',
        payload: { blockerId, blockingCharacter },
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível bloquear a ação');
    }
  };

  const handleSkipChallenge = () => {
    try {
      dispatch({ type: 'SKIP_CHALLENGE' });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao pular desafio');
    }
  };

  const handleSkipBlock = () => {
    try {
      dispatch({ type: 'SKIP_BLOCK' });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao pular bloqueio');
    }
  };

  const handleSelectCard = (cardIndex: number) => {
    if (!gameState) return;
    
    // Use the playerSelectingCard that was already determined above
    // This uses engine information to correctly identify who should lose
    const targetPlayer = playerSelectingCard || currentPlayer;
    
    if (targetPlayer) {
      try {
        dispatch({
          type: 'SELECT_CARD_TO_LOSE',
          payload: { playerId: targetPlayer.id, cardIndex },
        });
      } catch (error: any) {
        Alert.alert('Erro', error.message || 'Erro ao selecionar carta');
      }
    }
  };

  // Early return if gameState is null (must be after all hooks)
  if (!gameState) {
    return null;
  }

  const phaseType = gameState?.phase?.type || 'action';
  const showChallengeBlockModal =
    phaseType === 'challenge' ||
    phaseType === 'counteraction' ||
    phaseType === 'challenge_counteraction';

  // Don't show card selection modal if we're in narrative phase (waiting for modal to be dismissed)
  const showCardSelectionModal = phaseType === 'card_selection';
  
  // Check if this is an Ambassador Exchange
  const isAmbassadorExchange = 
    phaseType === 'card_selection' &&
    gameState?.pendingAction?.action.type === ActionType.EXCHANGE &&
    gameState?.pendingAction?.ambassadorAllCards;

  // Find the player who needs to select a card to lose (for non-exchange cases)
  // Use engine information from challenge to determine who should lose
  let playerSelectingCard: Player | undefined;
  
  if (gameState?.pendingAction?.challenge) {
    // Use challenge information to determine who should lose
    const challenge = gameState?.pendingAction?.challenge;
    
    // The engine sets phase.description correctly:
    // - Failed challenge: "challenger.name must lose an influence" (challenger was wrong)
    // - Successful challenge: "defender.name must lose an influence" (defender was caught lying)
    
    // Method 1: Parse from phase description (most reliable - engine sets this)
    const description = gameState?.phase?.description || '';
    // Description format: "PlayerName must lose an influence"
    // Extract player name from description
    const mustLoseMatch = description.match(/^(.+?)\s+must\s+lose/i);
    if (mustLoseMatch) {
      const playerNameFromDesc = mustLoseMatch[1].trim();
      playerSelectingCard = (gameState?.players || []).find(p => 
        p.name === playerNameFromDesc && !p.isEliminated
      );
    }
    
    // Method 2: Fallback - find by name inclusion (handles partial matches)
    if (!playerSelectingCard) {
      playerSelectingCard = (gameState?.players || []).find(p => 
        description.includes(p.name) && !p.isEliminated
      );
    }
    
    // Method 3: Ultimate fallback - use challenge object structure
    // This shouldn't be needed if description parsing works, but it's a safety net
    // Note: We can't directly use challenge.challengerId or challenge.targetId
    // because we need to know if challenge failed or succeeded
    // The engine handles this in loseInfluence() method
  }
  
  // Fallback: find player with multiple unrevealed cards
  if (!playerSelectingCard) {
    playerSelectingCard = (gameState?.players || []).find((p) => {
      if (p.isEliminated) return false;
      const aliveCards = p.influences.filter((c) => !c.isRevealed);
      return aliveCards.length > 1;
    });
  }

  const getPhaseLabel = (phaseType: string): string => {
    switch (phaseType) {
      case 'action':
        return t('phases.action');
      case 'challenge':
        return t('phases.challenge');
      case 'counteraction':
        return t('phases.counteraction');
      case 'challenge_counteraction':
        return t('phases.challenge_counteraction', { defaultValue: 'Desafiando Bloqueio' });
      case 'card_selection':
        return t('phases.card_selection');
      case 'resolution':
        return t('phases.resolution');
      default:
        return t('game.inProgress', { defaultValue: 'Jogo em Andamento' });
    }
  };

  const getPhaseColor = (phaseType: string): string => {
    switch (phaseType) {
      case 'action':
        return COLORS.info;
      case 'challenge':
      case 'challenge_counteraction':
        return COLORS.warning;
      case 'counteraction':
        return COLORS.warning;
      case 'card_selection':
        return COLORS.danger;
      case 'resolution':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  if (!currentPlayer) {
    return (
      <View style={styles.container}>
        <Text>{t('game.noCurrentPlayer', { defaultValue: 'No current player' })}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com informações do turno */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineSmall" style={styles.title}>
            🎴 COUP
          </Text>
          <View style={styles.headerActions}>
            <Button
              mode="outlined"
              onPress={() => setShowLogModal(true)}
              style={styles.logButton}
              textColor={COLORS.textPrimary}
              theme={{
                colors: {
                  primary: COLORS.buttonSecondary,
                },
              }}
            >
              📜
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowCards(!showCards)}
              style={styles.toggleButton}
              textColor={COLORS.textPrimary}
              theme={{
                colors: {
                  primary: COLORS.buttonSecondary,
                },
              }}
            >
              {showCards ? '👁️' : '👁️‍🗨️'}
            </Button>
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Chip
            style={[styles.phaseChip, { backgroundColor: getPhaseColor(phaseType) + '30' }]}
            textStyle={{ color: COLORS.textPrimary }}
          >
            {getPhaseLabel(phaseType)}
          </Chip>
          {currentPlayer && (
            <View style={styles.turnInfo}>
              <Text variant="bodyMedium" style={styles.turnText}>
                {t('log.player_turn', { playerName: currentPlayer?.name || '' })}
              </Text>
              <Text variant="bodySmall" style={styles.turnCoins}>
                💰 {currentPlayer?.coins || 0} {t('game.coins')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Área de jogadores */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.playersGrid}>
          {(gameState?.players || []).map((player) => (
            <View key={player.id} style={styles.playerCardWrapper}>
              <PlayerCard
                player={player}
                isCurrentPlayer={player.id === currentPlayer?.id}
                showCards={showCards && player.id === currentPlayer?.id}
              />
            </View>
          ))}
        </View>

        {/* Painel de ações na parte inferior */}
        {phaseType === 'action' &&
          currentPlayer && (
            <View style={styles.actionsPanel}>
              <Text variant="titleMedium" style={styles.actionsTitle}>
                {t('game.yourTurn')} - {t('game.selectAction')}
              </Text>
              <ActionButtons
                currentPlayer={currentPlayer}
                otherPlayers={otherPlayers}
                onAction={handleAction}
              />
            </View>
          )}

        {phaseType === 'action' &&
          !currentPlayer && (
            <View style={styles.waitingPanel}>
              <Text variant="titleMedium" style={styles.waitingText}>
                ⏳ {t('game.waiting')}
              </Text>
            </View>
          )}
      </ScrollView>

      <Portal>
        <ChallengeBlockModal
          visible={showChallengeBlockModal}
          gamePhase={phaseType}
          pendingAction={gameState?.pendingAction}
          currentPlayer={currentPlayer}
          allPlayers={gameState?.players || []}
          onChallenge={handleChallenge}
          onBlock={handleBlock}
          onSkip={
            phaseType === 'challenge'
              ? handleSkipChallenge
              : handleSkipBlock
          }
        />

        {isAmbassadorExchange ? (
          <AmbassadorExchangeModal
            visible={showCardSelectionModal}
            allCards={gameState?.pendingAction?.ambassadorAllCards || []}
            cardsToKeep={currentPlayer?.influences.filter(c => !c.isRevealed).length || 1}
            onComplete={(cardIndices) => {
              try {
                dispatch({
                  type: 'COMPLETE_EXCHANGE',
                  payload: {
                    playerId: currentPlayer?.id || '',
                    cardIndices,
                  },
                });
              } catch (error: any) {
                Alert.alert('Erro', error.message || 'Erro ao completar troca');
              }
            }}
          />
        ) : (
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
        )}

        {/* Game Log Modal */}
        <GameLogModal
          visible={showLogModal}
          logs={gameState?.gameLog || []}
          onDismiss={() => setShowLogModal(false)}
        />

        {/* Narrative Modal - Highest priority, rendered last */}
        {/* Show narrative modal when in narrative phase OR when modal state is set */}
        {(phaseType === 'narrative' || narrativeModal) && narrativeModal && (
          <NarrativeModal
            visible={narrativeModal.visible}
            title={narrativeModal.title}
            message={narrativeModal.message}
            onDismiss={narrativeModal.onDismiss}
          />
        )}
      </Portal>

      {/* Toast para feedback visual */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </View>
  );
}

// Componente Modal para Game Log
function GameLogModal({ visible, logs, onDismiss }: { visible: boolean; logs: any[]; onDismiss: () => void }) {
  const { t } = useTranslation();
  if (!visible) return null;
  
  return (
    <Portal>
      <View style={styles.modalOverlay} onTouchEnd={onDismiss}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              📜 {t('game.gameLog', { defaultValue: 'Histórico do Jogo' })}
            </Text>
            <Button
              mode="text"
              onPress={onDismiss}
              textColor={COLORS.textPrimary}
              style={styles.closeButton}
            >
              ✕
            </Button>
          </View>
          <GameLog logs={logs} />
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.cardBackground,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.buttonSecondary + '40',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textAccent,
    fontSize: 28,
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logButton: {
    marginRight: 8,
    minWidth: 50,
  },
  toggleButton: {
    minWidth: 50,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  phaseChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  turnInfo: {
    alignItems: 'flex-end',
  },
  turnText: {
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  turnPlayerName: {
    color: COLORS.buttonPrimary,
    fontWeight: 'bold',
  },
  turnCoins: {
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 200, // Espaço para o painel de ações
  },
  playersGrid: {
    marginBottom: 16,
  },
  playerCardWrapper: {
    marginBottom: 12,
  },
  actionsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.buttonPrimary + '40',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionsTitle: {
    color: COLORS.textPrimary,
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  waitingPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: COLORS.warning + '40',
    alignItems: 'center',
    elevation: 8,
  },
  waitingText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
    padding: 20,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  closeButton: {
    minWidth: 40,
  },
});

