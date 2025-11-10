import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Player } from '../types';
import CardHand from './CardHand';
import { COLORS } from '../constants/colors';

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer?: boolean;
  showCards?: boolean;
  onCardSelect?: (cardIndex: number) => void;
}

export default function PlayerArea({
  player,
  isCurrentPlayer = false,
  showCards = false,
  onCardSelect,
}: PlayerAreaProps) {
  const aliveCards = (player.influences || []).filter((c) => !c.isRevealed);

  return (
    <Card
      style={[
        styles.card,
        isCurrentPlayer && styles.currentPlayerCard,
        player.isEliminated && styles.deadPlayerCard,
      ]}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.name}>
            {player.name}
          </Text>
          <View style={styles.chips}>
            {isCurrentPlayer && (
              <Chip mode="flat" style={styles.currentChip}>
                Seu Turno
              </Chip>
            )}
            {player.isEliminated && (
              <Chip mode="flat" style={styles.deadChip}>
                Eliminado
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.coinsContainer}>
          <Text variant="headlineSmall" style={styles.coins}>
            {player.coins}
          </Text>
          <Text variant="bodySmall" style={styles.coinsLabel}>
            Moedas
          </Text>
        </View>

        <View style={styles.cardsSection}>
          <Text variant="bodySmall" style={styles.cardsLabel}>
            Cartas ({aliveCards.length} vivas)
          </Text>
          <CardHand
            cards={player.influences || []}
            revealed={showCards && isCurrentPlayer}
            onCardSelect={onCardSelect}
            showImages={showCards && isCurrentPlayer}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: COLORS.cardBackground,
  },
  currentPlayerCard: {
    borderWidth: 2,
    borderColor: COLORS.info,
  },
  deadPlayerCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  currentChip: {
    backgroundColor: COLORS.info + '20',
  },
  deadChip: {
    backgroundColor: COLORS.danger + '20',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  coins: {
    fontWeight: 'bold',
    marginRight: 4,
    color: COLORS.textAccent,
  },
  coinsLabel: {
    color: COLORS.textSecondary,
  },
  cardsSection: {
    marginTop: 8,
  },
  cardsLabel: {
    marginBottom: 8,
    color: COLORS.textSecondary,
  },
});

