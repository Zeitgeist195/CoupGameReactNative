import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Card as PaperCard, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Card, Character } from '../types';
import { characterToCardType } from '../types';
import { getCardColor } from '../utils/cardTranslations';
import { getCharacterName } from '../i18n';
import { COLORS } from '../constants/colors';

interface AmbassadorExchangeModalProps {
  visible: boolean;
  allCards: Card[];  // All cards (original + drawn)
  cardsToKeep: number;  // Number of cards to select (same as original count)
  onComplete: (cardIndices: number[]) => void;
}

export default function AmbassadorExchangeModal({
  visible,
  allCards,
  cardsToKeep,
  onComplete,
}: AmbassadorExchangeModalProps) {
  const { t } = useTranslation();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleCardToggle = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        // Deselect
        return prev.filter(i => i !== index);
      } else {
        // Select (up to cardsToKeep)
        if (prev.length >= cardsToKeep) {
          return prev;  // Already have max selected
        }
        return [...prev, index];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedIndices.length === cardsToKeep) {
      onComplete(selectedIndices);
      setSelectedIndices([]);
    }
  };

  return (
    <Modal
      visible={visible}
      contentContainerStyle={styles.container}
    >
      <PaperCard style={styles.card}>
        <PaperCard.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {t('game.ambassadorExchange', { defaultValue: 'Troca do Embaixador' })}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('game.selectCards', { 
              count: cardsToKeep,
              total: allCards.length,
              defaultValue: `Escolha ${cardsToKeep} ${cardsToKeep === 1 ? 'carta' : 'cartas'} das ${allCards.length} para manter` 
            })}:
          </Text>

          <View style={styles.cardsContainer}>
            {allCards.map((card, index) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <Button
                  key={index}
                  mode={isSelected ? 'contained' : 'outlined'}
                  onPress={() => handleCardToggle(index)}
                  style={[
                    styles.cardButton,
                    isSelected && { backgroundColor: getCardColor(characterToCardType(card.character)) },
                  ]}
                  contentStyle={styles.cardButtonContent}
                  textColor={isSelected ? COLORS.background : COLORS.textPrimary}
                >
                  {getCharacterName(card.character)}
                  {isSelected && ' ✓'}
                </Button>
              );
            })}
          </View>

          <Text variant="bodySmall" style={styles.hint}>
            {t('game.selectedCount', { 
              count: selectedIndices.length,
              total: cardsToKeep,
              defaultValue: `Selecionadas: ${selectedIndices.length}/${cardsToKeep}` 
            })}
          </Text>

          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={selectedIndices.length !== cardsToKeep}
            style={styles.confirmButton}
            buttonColor={COLORS.buttonPrimary}
          >
            {t('buttons.confirm')}
          </Button>
        </PaperCard.Content>
      </PaperCard>
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
    marginBottom: 16,
  },
  cardButton: {
    marginBottom: 8,
  },
  cardButtonContent: {
    paddingVertical: 12,
  },
  hint: {
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    marginTop: 8,
  },
});

