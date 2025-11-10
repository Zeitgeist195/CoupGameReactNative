import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Card as PaperCard, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Player, ActionType } from '../types';
import { getActionName } from '../i18n';
import { COLORS } from '../constants/colors';

interface TargetSelectionModalProps {
  visible: boolean;
  action: ActionType;
  availableTargets: Player[];  // Players that can be targeted
  onSelectTarget: (targetId: string) => void;
  onDismiss: () => void;
}

export default function TargetSelectionModal({
  visible,
  action,
  availableTargets,
  onSelectTarget,
  onDismiss,
}: TargetSelectionModalProps) {
  const { t } = useTranslation();
  const actionName = getActionName(action);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.container}
    >
      <PaperCard style={styles.card}>
        <PaperCard.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {t('game.selectTarget')}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('game.selectTargetForAction', { 
              action: actionName,
              defaultValue: `Selecione um alvo para ${actionName}` 
            })}
          </Text>

          <View style={styles.targetsContainer}>
            {availableTargets.length === 0 ? (
              <Text variant="bodyMedium" style={styles.noTargetsText}>
                {t('game.noAvailableTargets', { defaultValue: 'Nenhum alvo disponível' })}
              </Text>
            ) : (
              availableTargets.map((player) => (
                <Button
                  key={player.id}
                  mode="contained"
                  onPress={() => {
                    onSelectTarget(player.id);
                    onDismiss();
                  }}
                  style={styles.targetButton}
                  contentStyle={styles.targetButtonContent}
                  buttonColor={COLORS.buttonPrimary}
                >
                  {player.name}
                  {player.coins > 0 && (
                    <Text style={styles.coinsText}>
                      {' '}💰 {player.coins}
                    </Text>
                  )}
                </Button>
              ))
            )}
          </View>

          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelButton}
            textColor={COLORS.textSecondary}
          >
            {t('buttons.cancel')}
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
  targetsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  targetButton: {
    marginBottom: 8,
  },
  targetButtonContent: {
    paddingVertical: 12,
  },
  coinsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  noTargetsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    padding: 20,
  },
  cancelButton: {
    marginTop: 8,
  },
});

