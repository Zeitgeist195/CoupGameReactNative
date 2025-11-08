import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useGame } from '../context/GameContext';

export default function GameOverScreen({ navigation }: any) {
  const { gameState, dispatch } = useGame();
  const winner = gameState.winner;

  const handleNewGame = () => {
    dispatch({ type: 'RESET_GAME' });
    navigation.navigate('Setup');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            Game Over!
          </Text>

          {winner ? (
            <>
              <Text variant="headlineMedium" style={styles.winnerText}>
                🏆 {winner.name} Wins! 🏆
              </Text>
              <View style={styles.winnerInfo}>
                <Text variant="bodyLarge">
                  Final Coins: {winner.coins}
                </Text>
                <Text variant="bodyLarge">
                  Remaining Cards: {winner.cards.filter((c) => !c.revealed).length}
                </Text>
              </View>
            </>
          ) : (
            <Text variant="bodyLarge" style={styles.noWinnerText}>
              No winner determined
            </Text>
          )}

          <View style={styles.playersList}>
            <Text variant="titleMedium" style={styles.playersTitle}>
              Final Standings:
            </Text>
            {gameState.players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <Text variant="bodyLarge">
                  {index + 1}. {player.name}
                  {player.isAlive && ' (Winner)'}
                </Text>
                <Text variant="bodyMedium" style={styles.playerInfo}>
                  Coins: {player.coins} | Cards: {player.cards.filter((c) => !c.revealed).length}
                </Text>
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleNewGame}
            style={styles.newGameButton}
            contentStyle={styles.newGameButtonContent}
          >
            New Game
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  winnerText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  winnerInfo: {
    marginBottom: 24,
    alignItems: 'center',
  },
  noWinnerText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  playersList: {
    width: '100%',
    marginBottom: 24,
  },
  playersTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  playerRow: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  playerInfo: {
    color: '#666',
    marginTop: 4,
  },
  newGameButton: {
    width: '100%',
  },
  newGameButtonContent: {
    paddingVertical: 8,
  },
});

