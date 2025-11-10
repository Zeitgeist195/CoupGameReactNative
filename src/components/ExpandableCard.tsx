import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Text, Card as PaperCard } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { CardType, Card, characterToCardType } from '../types';
import { getCardColor, getCardImage } from '../utils/cardTranslations';
import { getCharacterName } from '../i18n';
import { COLORS } from '../constants/colors';

interface ExpandableCardProps {
  card: Card;
  cardIndex: number;
  showCardType: boolean; // Whether to show the actual card type (for current player)
  onPress?: () => void;
}

export default function ExpandableCard({
  card,
  cardIndex,
  showCardType,
  onPress,
}: ExpandableCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const handlePress = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    
    setExpanded(!expanded);
    onPress?.();
  };

  const cardType = characterToCardType(card.character);
  const cardColor = showCardType ? getCardColor(cardType) : COLORS.backgroundLight;
  const backgroundColor = card.isRevealed ? COLORS.textSecondary + '40' : cardColor;

  const heightInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 200],
  });

  const opacityInterpolation = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Animated.View
          style={[
            styles.cardBase,
            {
              backgroundColor,
              height: heightInterpolation,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            {(showCardType || card.isRevealed) && getCardImage(cardType) ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={getCardImage(cardType)}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.hiddenCardWrapper}>
                <Text style={styles.hiddenText}>?</Text>
              </View>
            )}
          </View>

          <Animated.View
            style={[
              styles.expandedContent,
              {
                opacity: opacityInterpolation,
                height: expanded ? 80 : 0,
              },
            ]}
          >
            {expanded && (showCardType || card.isRevealed) && (
              <View style={styles.expandedInfo}>
                <Text style={[styles.cardName, card.isRevealed && styles.revealedCardName]}>
                  {getCharacterName(card.character)}
                </Text>
                <Text style={[styles.cardDescription, card.isRevealed && styles.revealedCardDescription]}>
                  {t(`abilityDescriptions.${card.character}_action`, { defaultValue: '' }) || 
                   t(`abilityDescriptions.${card.character}_counter`, { defaultValue: '' })}
                </Text>
              </View>
            )}
            {expanded && !showCardType && !card.isRevealed && (
              <View style={styles.expandedInfo}>
                <Text style={styles.hiddenCardText}>
                  {t('game.hiddenCard', { defaultValue: 'Carta Ocultada' })}
                </Text>
                <Text style={styles.hiddenCardSubtext}>
                  {t('game.cannotSeeCard', { defaultValue: 'Você não pode ver esta carta' })}
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  cardBase: {
    width: 100,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  cardHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 70,
    width: '100%',
    marginBottom: 4,
  },
  imageWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
  },
  cardImage: {
    width: 70,
    height: 70,
  },
  hiddenCardWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInitial: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  revealedInitial: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  hiddenText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  expandedContent: {
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
  },
  expandedInfo: {
    alignItems: 'center',
  },
  cardName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 12,
  },
  hiddenCardText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  hiddenCardSubtext: {
    color: COLORS.textSecondary,
    fontSize: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  revealedCardName: {
    color: COLORS.textSecondary,
  },
  revealedCardDescription: {
    color: COLORS.textSecondary,
  },
});

