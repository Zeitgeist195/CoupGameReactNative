import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';
import { CARD_DIMENSIONS } from '../constants/dimensions';
import { TYPOGRAPHY } from '../constants/typography';
import { CARDS_DATA } from '../constants/cards';
import { CardType, Character } from '../types';
import { cardTypeToCharacter } from '../types';
import { getCardColor, getCardImage } from '../utils/cardTranslations';
import { getCharacterName } from '../i18n';

interface CardProps {
  character: CardType;
  revealed?: boolean;
  disabled?: boolean;
  size?: 'hand' | 'field' | 'miniature';
  onPress?: () => void;
  showImage?: boolean;
}

const SIZE_MAP = {
  hand: CARD_DIMENSIONS.hand,
  field: CARD_DIMENSIONS.field,
  miniature: CARD_DIMENSIONS.miniature,
};

const CHARACTER_MAP: Record<CardType, keyof typeof CARDS_DATA> = {
  [CardType.DUKE]: 'conde',
  [CardType.CAPTAIN]: 'pirata',
  [CardType.ASSASSIN]: 'mercenario',
  [CardType.AMBASSADOR]: 'diplomata',
  [CardType.CONTESSA]: 'cortesa',
};

export default function Card({
  character,
  revealed = true,
  disabled = false,
  size = 'hand',
  onPress,
  showImage = true,
}: CardProps) {
  const { t } = useTranslation();
  const [flipAnimation] = useState(new Animated.Value(revealed ? 1 : 0));
  const characterKey = CHARACTER_MAP[character];
  const cardData = CARDS_DATA[characterKey];
  const cardImage = getCardImage(character);
  const cardColor = getCardColor(character);
  const characterEnum = cardTypeToCharacter(character);
  const cardName = getCharacterName(characterEnum);
  const dimensions = SIZE_MAP[size];

  React.useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: revealed ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [revealed]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderColor: cardColor,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {revealed ? (
        <>
          <Text style={[styles.cardName, { color: cardColor }]}>
            {cardName}
          </Text>

          {showImage && (
            <View style={styles.imageContainer}>
              <Image
                source={cardImage}
                style={[
                  styles.image,
                  {
                    width: dimensions.width * 0.7,
                    height: dimensions.width * 0.7,
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.abilities}>
            {cardData.abilities.map((ability, index) => (
              <View key={index} style={styles.ability}>
                <Text style={styles.abilityName}>{ability.name}</Text>
                <Text style={styles.abilityDescription}>
                  {ability.description}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.cardBack}>
          <Text style={styles.cardBackText}>🎴</Text>
          <Text style={styles.cardBackSubtext}>
            {t('game.hiddenCard', { defaultValue: 'Carta Ocultada' })}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: CARD_DIMENSIONS.borderRadius,
    borderWidth: CARD_DIMENSIONS.borderWidth,
    padding: CARD_DIMENSIONS.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-between',
  },
  cardName: {
    ...TYPOGRAPHY.cardName,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    marginBottom: 8,
    padding: 4,
  },
  image: {
    // Size is set dynamically
  },
  abilities: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ability: {
    marginBottom: 6,
  },
  abilityName: {
    ...TYPOGRAPHY.abilityName,
    fontSize: 12,
  },
  abilityDescription: {
    ...TYPOGRAPHY.abilityDescription,
    fontSize: 10,
    lineHeight: 14,
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 8,
  },
  cardBackText: {
    fontSize: 60,
    marginBottom: 8,
  },
  cardBackSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});

