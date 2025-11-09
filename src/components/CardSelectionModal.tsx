import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Card, Text, Button } from 'react-native-paper';
import { Player, CardType } from '../types';
import { getCardName, getCardColor } from '../utils/cardTranslations';
import { COLORS } from '../constants/colors';

interface CardSelectionModalProps {
  visible: boolean;
  player: Player | null;
  onSelectCard: (cardIndex: number) => void;
}

export default function CardSelectionModal({
  visible,
  player,
  onSelectCard,
}: CardSelectionModalProps) {
  if (!player) {
    return null;
  }

  const aliveCards = player.cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => !card.revealed);


  return (
    <Modal
      visible={visible}
      contentContainerStyle={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Selecione uma Carta para Perder
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {player.name}, escolha qual carta revelar:
          </Text>

          <View style={styles.cardsContainer}>
            {aliveCards.map(({ card, index }) => (
              <Button
                key={index}
                mode="contained"
                onPress={() => onSelectCard(index)}
                style={[
                  styles.cardButton,
                  { backgroundColor: getCardColor(card.type) },
                ]}
                contentStyle={styles.cardButtonContent}
              >
                {getCardName(card.type)}
              </Button>
            ))}
          </View>
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
    marginBottom: 8,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    gap: 12,
  },
  cardButton: {
    marginBottom: 8,
  },
  cardButtonContent: {
    paddingVertical: 12,
  },
});

