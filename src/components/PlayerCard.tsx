import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Player, CardType } from '../types';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  onSelect?: () => void;
  showCards?: boolean;
}

export default function PlayerCard({
  player,
  isCurrentPlayer = false,
  onSelect,
  showCards = false,
}: PlayerCardProps) {
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

  const aliveCards = player.cards.filter((c) => !c.revealed);
  const revealedCards = player.cards.filter((c) => c.revealed);

  return (
    <Card
      style={[
        styles.card,
        isCurrentPlayer && styles.currentPlayerCard,
        !player.isAlive && styles.deadPlayerCard,
      ]}
      onPress={onSelect}
      disabled={!onSelect}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.name}>
            {player.name}
          </Text>
          {isCurrentPlayer && (
            <Chip mode="flat" style={styles.currentChip}>
              Current
            </Chip>
          )}
          {!player.isAlive && (
            <Chip mode="flat" style={styles.deadChip}>
              Eliminated
            </Chip>
          )}
        </View>

        <View style={styles.coinsContainer}>
          <Text variant="headlineSmall" style={styles.coins}>
            {player.coins}
          </Text>
          <Text variant="bodySmall" style={styles.coinsLabel}>
            Coins
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <Text variant="bodySmall" style={styles.cardsLabel}>
            Cards ({aliveCards.length} alive)
          </Text>
          <View style={styles.cardsRow}>
            {player.cards.map((card, index) => (
              <View
                key={index}
                style={[
                  styles.cardIndicator,
                  {
                    backgroundColor: card.revealed
                      ? '#ccc'
                      : showCards
                      ? getCardColor(card.type)
                      : '#4CAF50',
                  },
                ]}
              >
                {showCards && (
                  <Text style={styles.cardText}>
                    {card.type.substring(0, 1)}
                  </Text>
                )}
              </View>
            ))}
          </View>
          {revealedCards.length > 0 && (
            <View style={styles.revealedContainer}>
              <Text variant="bodySmall" style={styles.revealedLabel}>
                Revealed:
              </Text>
              {revealedCards.map((card, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={[
                    styles.revealedChip,
                    { borderColor: getCardColor(card.type) },
                  ]}
                >
                  {card.type}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  currentPlayerCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  deadPlayerCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontWeight: 'bold',
  },
  currentChip: {
    backgroundColor: '#E3F2FD',
  },
  deadChip: {
    backgroundColor: '#FFEBEE',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  coins: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  coinsLabel: {
    color: '#666',
  },
  cardsContainer: {
    marginTop: 8,
  },
  cardsLabel: {
    marginBottom: 4,
    color: '#666',
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardIndicator: {
    width: 30,
    height: 40,
    borderRadius: 4,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  revealedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  revealedLabel: {
    marginRight: 4,
    color: '#666',
  },
  revealedChip: {
    marginRight: 4,
    marginBottom: 4,
  },
});

