import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Card, Text, Button } from 'react-native-paper';
import { Player, CardType } from '../types';

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

  const getCardColor = (cardType: CardType): string => {
    switch (cardType) {
      case CardType.DUKE:
        return '#4CAF50';
      case CardType.CAPTAIN:
        return '#2196F3';
      case CardType.ASSASSIN:
        return '#F44336';
      case CardType.AMBASSADOR:
        return '#FF9800';
      case CardType.CONTESSA:
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  return (
    <Modal
      visible={visible}
      contentContainerStyle={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Select Card to Lose
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {player.name}, choose which card to reveal:
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
                {card.type}
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

