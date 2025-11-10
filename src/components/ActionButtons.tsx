import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Portal, Dialog, Paragraph, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ActionType, Player, Character, ACTION_CONFIG } from '../types';
import { getActionName } from '../i18n';
import { COLORS } from '../constants/colors';
import TargetSelectionModal from './TargetSelectionModal';

interface ActionButtonsProps {
  currentPlayer: Player;
  otherPlayers: Player[];
  onAction: (action: ActionType, targetId?: string) => void;
}

export default function ActionButtons({
  currentPlayer,
  otherPlayers,
  onAction,
}: ActionButtonsProps) {
  const { t } = useTranslation();
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [infoAction, setInfoAction] = useState<ActionType | null>(null);

  const getActionLabel = (action: ActionType): string => {
    const config = ACTION_CONFIG[action];
    const actionName = getActionName(action);
    
    if (config.cost > 0) {
      return `${actionName} (${config.cost} ${t('game.coins')})`;
    } else if (config.gain > 0) {
      return `${actionName} (+${config.gain} ${t('game.coins')})`;
    }
    return actionName;
  };

  const getActionDescription = (action: ActionType): string => {
    return t(`abilityDescriptions.${action}_action`, { defaultValue: '' }) || 
           t(`abilityDescriptions.${action}_counter`, { defaultValue: '' }) ||
           t(`actions.${action}`, { defaultValue: action });
  };

  const handleActionPress = (action: ActionType) => {
    const config = ACTION_CONFIG[action];
    if (config.requiresTarget) {
      setSelectedAction(action);
      setTargetModalVisible(true);
    } else {
      onAction(action);
    }
  };

  const handleTargetSelect = (targetId: string) => {
    if (selectedAction) {
      onAction(selectedAction, targetId);
      setSelectedAction(null);
      setTargetModalVisible(false);
    }
  };

  const handleDismissTargetModal = () => {
    setTargetModalVisible(false);
    setSelectedAction(null);
  };

  const showInfo = (action: ActionType) => {
    setInfoAction(action);
    setInfoDialogVisible(true);
  };

  const availableActions = Object.values(ActionType).filter((action) => {
    const config = ACTION_CONFIG[action];
    return currentPlayer.coins >= config.cost;
  });

  return (
    <View style={styles.container}>
      <View style={styles.actionsGrid}>
        {availableActions.map((action) => {
          const config = ACTION_CONFIG[action];
          const disabled = currentPlayer.coins < config.cost;
          return (
            <View key={action} style={styles.actionItem}>
              <Button
                mode="contained"
                onPress={() => handleActionPress(action)}
                disabled={disabled}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                {getActionLabel(action)}
              </Button>
              <Button
                mode="text"
                onPress={() => showInfo(action)}
                style={styles.infoButton}
              >
                ℹ️
              </Button>
            </View>
          );
        })}
      </View>

      <Portal>
        {selectedAction && (
          <TargetSelectionModal
            visible={targetModalVisible}
            action={selectedAction}
            availableTargets={otherPlayers.filter((p) => !p.isEliminated)}
            onSelectTarget={handleTargetSelect}
            onDismiss={handleDismissTargetModal}
          />
        )}
      </Portal>

      <Portal>
        <Dialog
          visible={infoDialogVisible}
          onDismiss={() => setInfoDialogVisible(false)}
        >
          <Dialog.Title>
            {infoAction ? getActionLabel(infoAction) : ''}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {infoAction ? getActionDescription(infoAction) : ''}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setInfoDialogVisible(false)}
              textColor={COLORS.buttonPrimary}
            >
              {t('buttons.ok')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionItem: {
    width: '48%',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  infoButton: {
    marginLeft: 4,
    minWidth: 40,
  },
});

