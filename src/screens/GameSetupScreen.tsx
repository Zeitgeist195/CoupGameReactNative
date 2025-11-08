import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { useGame } from '../context/GameContext';

export default function GameSetupScreen({ navigation }: any) {
  const { dispatch } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<string[]>([]);

  const addPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const startGame = () => {
    const validNames = playerNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (validNames.length < 2) {
      setErrors(['At least 2 players are required']);
      return;
    }

    if (validNames.length > 6) {
      setErrors(['Maximum 6 players allowed']);
      return;
    }

    const uniqueNames = new Set(validNames);
    if (uniqueNames.size !== validNames.length) {
      setErrors(['Player names must be unique']);
      return;
    }

    setErrors([]);
    dispatch({ type: 'INIT_GAME', payload: validNames });
    navigation.navigate('Game');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>
          Coup Game Setup
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Add 2-6 players to start
        </Text>

        {errors.length > 0 && (
          <Card style={styles.errorCard}>
            <Card.Content>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  {error}
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}

        <View style={styles.playersContainer}>
          {playerNames.map((name, index) => (
            <View key={index} style={styles.playerRow}>
              <TextInput
                label={`Player ${index + 1}`}
                value={name}
                onChangeText={(text) => updatePlayerName(index, text)}
                style={styles.input}
                mode="outlined"
              />
              {playerNames.length > 2 && (
                <Button
                  mode="text"
                  onPress={() => removePlayer(index)}
                  style={styles.removeButton}
                >
                  Remove
                </Button>
              )}
            </View>
          ))}
        </View>

        {playerNames.length < 6 && (
          <Button
            mode="outlined"
            onPress={addPlayer}
            style={styles.addButton}
          >
            Add Player
          </Button>
        )}

        <Button
          mode="contained"
          onPress={startGame}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
        >
          Start Game
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  playersContainer: {
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    minWidth: 80,
  },
  addButton: {
    marginBottom: 16,
  },
  startButton: {
    marginTop: 8,
  },
  startButtonContent: {
    paddingVertical: 8,
  },
});

