import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { COLORS } from '../constants/colors';

export default function GameOverScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { gameState, dispatch } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Note: Navigation is handled by button handlers, not by useEffect
  // This prevents conflicts with navigation.reset()

  useEffect(() => {
    // Animação de entrada (only if gameState exists)
    if (!gameState) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [gameState]);

  // Early return if gameState is null (must be after all hooks)
  if (!gameState) {
    return null;
  }

  const winner = gameState?.winnerId 
    ? gameState.players.find(p => p.id === gameState.winnerId)
    : null;

  const handleNewGame = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset game first, then navigate
      dispatch({ type: 'RESET_GAME' });
      // Use setTimeout to ensure state is reset before navigation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Setup' }],
        });
      }, 100);
    });
  };

  const handleBackToMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset game first, then navigate
      dispatch({ type: 'RESET_GAME' });
      // Use setTimeout to ensure state is reset before navigation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Setup' }],
        });
      }, 100);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            <Text variant="headlineLarge" style={styles.title}>
              🎮 {t('game.gameOver')}
            </Text>

            {winner ? (
              <>
                <View style={styles.winnerContainer}>
                  <Text variant="headlineMedium" style={styles.winnerText}>
                    🏆 {t('log.game_won', { playerName: winner.name })} 🏆
                  </Text>
                  <View style={styles.winnerInfo}>
                    <View style={styles.statBox}>
                      <Text variant="bodyLarge" style={styles.statLabel}>
                        💰 {t('game.finalCoins', { defaultValue: 'Moedas Finais' })}
                      </Text>
                      <Text variant="headlineSmall" style={styles.statValue}>
                        {winner.coins}
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text variant="bodyLarge" style={styles.statLabel}>
                        🎴 {t('game.remainingCards', { defaultValue: 'Cartas Restantes' })}
                      </Text>
                      <Text variant="headlineSmall" style={styles.statValue}>
                        {(winner.influences || []).filter((c) => !c.isRevealed).length}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <Text variant="bodyLarge" style={styles.noWinnerText}>
                {t('game.noWinner', { defaultValue: 'Nenhum vencedor determinado' })}
              </Text>
            )}

            <View style={styles.playersList}>
              <Text variant="titleMedium" style={styles.playersTitle}>
                📊 {t('game.finalRanking', { defaultValue: 'Classificação Final' })}
              </Text>
              {(gameState?.players || [])
                .sort((a, b) => {
                  if (!a.isEliminated && b.isEliminated) return -1;
                  if (a.isEliminated && !b.isEliminated) return 1;
                  return b.coins - a.coins;
                })
                .map((player, index) => (
                  <View
                    key={player.id}
                    style={[
                      styles.playerRow,
                      !player.isEliminated && styles.winnerRow,
                    ]}
                  >
                    <View style={styles.playerRank}>
                      <Text variant="headlineSmall" style={styles.rankNumber}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.playerDetails}>
                      <Text variant="bodyLarge" style={styles.playerName}>
                        {player.name}
                        {!player.isEliminated && (
                          <Text style={styles.winnerBadge}> 👑</Text>
                        )}
                      </Text>
                      <View style={styles.playerStats}>
                        <Text variant="bodySmall" style={styles.playerStat}>
                          💰 {player.coins} {t('game.coins')}
                        </Text>
                        <Text variant="bodySmall" style={styles.playerStat}>
                          🎴 {(player.influences || []).filter((c) => !c.isRevealed).length} {t('game.cards', { defaultValue: 'cartas' })}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                mode="contained"
                onPress={handleNewGame}
                style={styles.newGameButton}
                contentStyle={styles.newGameButtonContent}
                buttonColor={COLORS.buttonPrimary}
                textColor={COLORS.background}
              >
                🎮 {t('game.newGame', { defaultValue: 'Novo Jogo' })}
              </Button>
              <Button
                mode="outlined"
                onPress={handleBackToMenu}
                style={styles.menuButton}
                contentStyle={styles.menuButtonContent}
                textColor={COLORS.textPrimary}
                theme={{
                  colors: {
                    primary: COLORS.buttonSecondary,
                  },
                }}
              >
                🏠 {t('game.backToMenu', { defaultValue: 'Voltar ao Menu' })}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  animatedContainer: {
    width: '100%',
  },
  card: {
    elevation: 8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.buttonPrimary + '40',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    color: COLORS.textAccent,
    fontSize: 36,
    letterSpacing: 2,
  },
  winnerContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  winnerText: {
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.buttonPrimary,
    fontWeight: 'bold',
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  winnerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: COLORS.buttonPrimary + '40',
  },
  statLabel: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  statValue: {
    color: COLORS.buttonPrimary,
    fontWeight: 'bold',
  },
  noWinnerText: {
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.textSecondary,
  },
  playersList: {
    width: '100%',
    marginBottom: 24,
  },
  playersTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 20,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + '20',
  },
  winnerRow: {
    borderColor: COLORS.buttonPrimary,
    borderWidth: 2,
    backgroundColor: COLORS.buttonPrimary + '10',
  },
  playerRank: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: COLORS.textAccent,
    fontWeight: 'bold',
    fontSize: 24,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 18,
  },
  winnerBadge: {
    color: COLORS.buttonPrimary,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  playerStat: {
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  newGameButton: {
    width: '100%',
    borderRadius: 12,
    elevation: 4,
  },
  newGameButtonContent: {
    paddingVertical: 12,
  },
  menuButton: {
    width: '100%',
    borderRadius: 12,
    borderColor: COLORS.buttonSecondary,
  },
  menuButtonContent: {
    paddingVertical: 12,
  },
});

