import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Player, CardType } from '../types';
import ExpandableCard from './ExpandableCard';
import { getCardName, getCardColor } from '../utils/cardTranslations';
import { COLORS } from '../constants/colors';

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
  const coinsAnim = useRef(new Animated.Value(player.coins)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const previousCoins = useRef(player.coins);

  useEffect(() => {
    if (previousCoins.current !== player.coins) {
      const diff = player.coins - previousCoins.current;
      
      // Animação de mudança de moedas
      Animated.sequence([
        Animated.timing(coinsAnim, {
          toValue: player.coins,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();

      // Animação de pulso se ganhou moedas
      if (diff > 0) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }

      previousCoins.current = player.coins;
    }
  }, [player.coins]);

  // Animação de pulso para jogador atual
  useEffect(() => {
    if (isCurrentPlayer) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isCurrentPlayer]);


  const aliveCards = player.cards.filter((c) => !c.revealed);
  const revealedCards = player.cards.filter((c) => c.revealed);

  return (
    <Animated.View
      style={[
        isCurrentPlayer && { transform: [{ scale: pulseAnim }] },
      ]}
    >
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
                Seu Turno
              </Chip>
            )}
            {!player.isAlive && (
              <Chip mode="flat" style={styles.deadChip}>
                Eliminado
              </Chip>
            )}
          </View>

          <View style={styles.coinsContainer}>
            <Animated.Text style={[styles.coins, { transform: [{ scale: pulseAnim }] }]}>
              {player.coins}
            </Animated.Text>
            <Text variant="bodySmall" style={styles.coinsLabel}>
              💰 Moedas
            </Text>
          </View>

        <View style={styles.cardsContainer}>
          <Text variant="bodySmall" style={styles.cardsLabel}>
            Cartas ({aliveCards.length} vivas)
          </Text>
          <View style={styles.cardsRow}>
            {player.cards.map((card, index) => (
              <ExpandableCard
                key={index}
                card={card}
                cardIndex={index}
                showCardType={showCards || card.revealed}
              />
            ))}
          </View>
          {revealedCards.length > 0 && (
            <View style={styles.revealedContainer}>
              <Text variant="bodySmall" style={styles.revealedLabel}>
                Reveladas:
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
                  {getCardName(card.type)}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
    </Animated.View>
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
    shadowColor: COLORS.info,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  deadPlayerCard: {
    opacity: 0.6,
    backgroundColor: COLORS.danger + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  currentChip: {
    backgroundColor: COLORS.info + '30',
  },
  deadChip: {
    backgroundColor: COLORS.danger + '30',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  coins: {
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 24,
    color: COLORS.textAccent,
  },
  coinsLabel: {
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    marginTop: 8,
  },
  cardsLabel: {
    marginBottom: 4,
    color: COLORS.textSecondary,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  revealedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  revealedLabel: {
    marginRight: 4,
    color: COLORS.textSecondary,
  },
  revealedChip: {
    marginRight: 4,
    marginBottom: 4,
  },
});

