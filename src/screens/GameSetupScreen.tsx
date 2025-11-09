import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Button, TextInput, Text, Card as PaperCard } from 'react-native-paper';
import { useGame } from '../context/GameContext';
import { COLORS } from '../constants/colors';
import CardComponent from '../components/Card';
import { CardType } from '../types';

export default function GameSetupScreen({ navigation }: any) {
  const { dispatch } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
      setErrors(['Pelo menos 2 jogadores são necessários']);
      return;
    }

    if (validNames.length > 6) {
      setErrors(['Máximo de 6 jogadores permitidos']);
      return;
    }

    const uniqueNames = new Set(validNames);
    if (uniqueNames.size !== validNames.length) {
      setErrors(['Os nomes dos jogadores devem ser únicos']);
      return;
    }

    setErrors([]);
    
    // Animação de transição
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dispatch({ type: 'INIT_GAME', payload: validNames });
      navigation.navigate('Game');
    });
  };

  // Preview das cartas
  const previewCards: CardType[] = [
    CardType.DUKE,
    CardType.CAPTAIN,
    CardType.ASSASSIN,
    CardType.AMBASSADOR,
    CardType.CONTESSA,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              🎴 COUP
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Adicione 2-6 jogadores para começar
            </Text>
          </View>

          {/* Preview das Cartas */}
          <View style={styles.cardsPreview}>
            <Text variant="titleMedium" style={styles.previewTitle}>
              Personagens do Jogo
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              {previewCards.map((cardType, index) => (
                <View key={index} style={styles.previewCardWrapper}>
                  <CardComponent
                    character={cardType}
                    revealed={true}
                    size="miniature"
                    showImage={true}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {errors.length > 0 && (
            <PaperCard style={styles.errorCard}>
              <PaperCard.Content>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    {error}
                  </Text>
                ))}
              </PaperCard.Content>
            </PaperCard>
          )}

          <PaperCard style={styles.playersCard}>
            <PaperCard.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Jogadores
              </Text>
              <View style={styles.playersContainer}>
                {playerNames.map((name, index) => (
                  <View key={index} style={styles.playerRow}>
                    <TextInput
                      label={`Jogador ${index + 1}`}
                      value={name}
                      onChangeText={(text) => updatePlayerName(index, text)}
                      style={styles.input}
                      mode="outlined"
                      textColor={COLORS.textPrimary}
                      theme={{
                        colors: {
                          primary: COLORS.buttonPrimary,
                          text: COLORS.textPrimary,
                          placeholder: COLORS.textSecondary,
                        },
                      }}
                    />
                    {playerNames.length > 2 && (
                      <Button
                        mode="text"
                        onPress={() => removePlayer(index)}
                        style={styles.removeButton}
                        textColor={COLORS.danger}
                      >
                        ✕
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
                  textColor={COLORS.buttonSecondary}
                  theme={{
                    colors: {
                      primary: COLORS.buttonSecondary,
                    },
                  }}
                >
                  + Adicionar Jogador
                </Button>
              )}
            </PaperCard.Content>
          </PaperCard>

          <Button
            mode="contained"
            onPress={startGame}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            buttonColor={COLORS.buttonPrimary}
            textColor={COLORS.background}
            theme={{
              colors: {
                primary: COLORS.buttonPrimary,
              },
            }}
          >
            🎮 Iniciar Jogo
          </Button>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
    color: COLORS.textAccent,
    fontSize: 42,
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  cardsPreview: {
    marginBottom: 30,
  },
  previewTitle: {
    color: COLORS.textPrimary,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardsScroll: {
    paddingHorizontal: 10,
  },
  previewCardWrapper: {
    marginRight: 12,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: COLORS.danger + '20',
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  playersCard: {
    marginBottom: 20,
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.buttonSecondary + '40',
    borderWidth: 1,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    marginBottom: 16,
    fontWeight: '600',
  },
  playersContainer: {
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  removeButton: {
    minWidth: 50,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 8,
    borderColor: COLORS.buttonSecondary,
  },
  startButton: {
    marginTop: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: COLORS.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  startButtonContent: {
    paddingVertical: 12,
  },
});

