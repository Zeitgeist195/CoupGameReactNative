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
import GameLog from '../components/GameLog';
import Toast from '../components/Toast';
import { GamePhase } from '../types';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }: any) {
  const { gameState, game, dispatch } = useGame();
  const [showCards, setShowCards] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });
  const previousLogLength = React.useRef(gameState.gameLog.length);

  useEffect(() => {
    if (gameState.gamePhase === GamePhase.GAME_OVER) {
      navigation.navigate('GameOver');
    }
  }, [gameState.gamePhase, navigation]);

  // Mostrar toast quando há nova entrada no log
  useEffect(() => {
    if (gameState.gameLog.length > previousLogLength.current) {
      const newLog = gameState.gameLog[gameState.gameLog.length - 1];
      const logLower = newLog.toLowerCase();
      
      let type: 'success' | 'error' | 'info' | 'warning' = 'info';
      if (logLower.includes('eliminado') || logLower.includes('perde')) {
        type = 'error';
      } else if (logLower.includes('ganhou') || logLower.includes('recebeu')) {
        type = 'success';
      } else if (logLower.includes('desafio') || logLower.includes('bloqueio')) {
        type = 'warning';
      }

      setToast({
        message: newLog,
        type,
        visible: true,
      });
    }
    previousLogLength.current = gameState.gameLog.length;
  }, [gameState.gameLog]);

  const currentPlayer = game.getCurrentPlayer();
  const otherPlayers = gameState.players.filter(
    (p) => p.id !== currentPlayer?.id
  );

  const handleAction = (action: any, targetId?: string) => {
    try {
      dispatch({ type: 'EXECUTE_ACTION', payload: { action, targetId } });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível executar a ação');
    }
  };

  const handleChallenge = (challengerId: string) => {
    try {
      dispatch({ type: 'CHALLENGE_ACTION', payload: challengerId });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível desafiar a ação');
    }
  };

  const handleBlock = (blockerId: string, blockingCard: any) => {
    try {
      dispatch({
        type: 'BLOCK_ACTION',
        payload: { blockerId, blockingCard },
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
        Alert.alert('Erro', error.message || 'Erro ao selecionar carta');
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

  const getPhaseLabel = (phase: GamePhase): string => {
    switch (phase) {
      case GamePhase.ACTION_SELECTION:
        return 'Seleção de Ação';
      case GamePhase.WAITING_CHALLENGE:
        return 'Aguardando Desafio';
      case GamePhase.WAITING_BLOCK:
        return 'Aguardando Bloqueio';
      case GamePhase.CARD_LOSS_SELECTION:
        return 'Seleção de Carta';
      case GamePhase.GAME_OVER:
        return 'Fim de Jogo';
      default:
        return 'Jogo em Andamento';
    }
  };

  const getPhaseColor = (phase: GamePhase): string => {
    switch (phase) {
      case GamePhase.ACTION_SELECTION:
        return COLORS.info;
      case GamePhase.WAITING_CHALLENGE:
        return COLORS.warning;
      case GamePhase.WAITING_BLOCK:
        return COLORS.warning;
      case GamePhase.CARD_LOSS_SELECTION:
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  if (!currentPlayer) {
    return (
      <View style={styles.container}>
        <Text>No current player</Text>
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
            style={[styles.phaseChip, { backgroundColor: getPhaseColor(gameState.gamePhase) + '30' }]}
            textStyle={{ color: COLORS.textPrimary }}
          >
            {getPhaseLabel(gameState.gamePhase)}
          </Chip>
          {currentPlayer && (
            <View style={styles.turnInfo}>
              <Text variant="bodyMedium" style={styles.turnText}>
                Turno: <Text style={styles.turnPlayerName}>{currentPlayer.name}</Text>
              </Text>
              <Text variant="bodySmall" style={styles.turnCoins}>
                💰 {currentPlayer.coins} moedas
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
          {gameState.players.map((player) => (
            <View key={player.id} style={styles.playerCardWrapper}>
              <PlayerCard
                player={player}
                isCurrentPlayer={player.isCurrentPlayer}
                showCards={showCards && player.id === currentPlayer.id}
              />
            </View>
          ))}
        </View>

        {/* Painel de ações na parte inferior */}
        {gameState.gamePhase === GamePhase.ACTION_SELECTION &&
          currentPlayer.isCurrentPlayer && (
            <View style={styles.actionsPanel}>
              <Text variant="titleMedium" style={styles.actionsTitle}>
                Seu Turno - Escolha uma Ação
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
            <View style={styles.waitingPanel}>
              <Text variant="titleMedium" style={styles.waitingText}>
                ⏳ Aguardando {currentPlayer.name}...
              </Text>
            </View>
          )}
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

        {/* Game Log Modal */}
        <GameLogModal
          visible={showLogModal}
          logs={gameState.gameLog}
          onDismiss={() => setShowLogModal(false)}
        />
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
function GameLogModal({ visible, logs, onDismiss }: { visible: boolean; logs: string[]; onDismiss: () => void }) {
  if (!visible) return null;
  
  return (
    <Portal>
      <View style={styles.modalOverlay} onTouchEnd={onDismiss}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              📜 Histórico do Jogo
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

