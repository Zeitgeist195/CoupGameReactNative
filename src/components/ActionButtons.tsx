import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Portal, Dialog, Paragraph, Text } from 'react-native-paper';
import { ActionType, Player } from '../types';
import { ACTION_RULES } from '../constants/rules';
import { COLORS } from '../constants/colors';

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
  const [targetMenuVisible, setTargetMenuVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [infoAction, setInfoAction] = useState<ActionType | null>(null);

  const getActionLabel = (action: ActionType): string => {
    switch (action) {
      case ActionType.INCOME:
        return 'Renda (+1 moeda)';
      case ActionType.FOREIGN_AID:
        return 'Ajuda Externa (+2 moedas)';
      case ActionType.COUP:
        return `Golpe (7 moedas)`;
      case ActionType.DUKE_TAX:
        return 'Taxar (+3 moedas)';
      case ActionType.CAPTAIN_STEAL:
        return 'Roubar (2 moedas)';
      case ActionType.ASSASSIN_KILL:
        return 'Assassinar (3 moedas)';
      case ActionType.AMBASSADOR_EXCHANGE:
        return 'Trocar Cartas';
      default:
        return action;
    }
  };

  const getActionDescription = (action: ActionType): string => {
    const rule = ACTION_RULES[action];
    let desc = '';
    switch (action) {
      case ActionType.INCOME:
        desc = 'Receba 1 moeda. Não pode ser bloqueado ou desafiado.';
        break;
      case ActionType.FOREIGN_AID:
        desc = 'Receba 2 moedas. Pode ser bloqueado pelo Conde.';
        break;
      case ActionType.COUP:
        desc = 'Pague 7 moedas para eliminar um jogador. Não pode ser bloqueado ou desafiado.';
        break;
      case ActionType.DUKE_TAX:
        desc = 'Receba 3 moedas. Pode ser desafiado.';
        break;
      case ActionType.CAPTAIN_STEAL:
        desc = 'Roube 2 moedas de outro jogador. Pode ser bloqueado ou desafiado.';
        break;
      case ActionType.ASSASSIN_KILL:
        desc = 'Pague 3 moedas para eliminar um jogador. Pode ser bloqueado ou desafiado.';
        break;
      case ActionType.AMBASSADOR_EXCHANGE:
        desc = 'Troque cartas com o baralho. Pode ser desafiado.';
        break;
    }
    return desc;
  };

  const handleActionPress = (action: ActionType) => {
    const rule = ACTION_RULES[action];
    if (rule.requiresTarget) {
      setSelectedAction(action);
      setTargetMenuVisible(true);
    } else {
      onAction(action);
    }
  };

  const handleTargetSelect = (targetId: string) => {
    if (selectedAction) {
      onAction(selectedAction, targetId);
      setSelectedAction(null);
      setTargetMenuVisible(false);
    }
  };

  const showInfo = (action: ActionType) => {
    setInfoAction(action);
    setInfoDialogVisible(true);
  };

  const availableActions = Object.values(ActionType).filter((action) => {
    const rule = ACTION_RULES[action];
    return currentPlayer.coins >= rule.cost;
  });

  return (
    <View style={styles.container}>
      <View style={styles.actionsGrid}>
        {availableActions.map((action) => {
          const rule = ACTION_RULES[action];
          const disabled = currentPlayer.coins < rule.cost;
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

      <Menu
        visible={targetMenuVisible}
        onDismiss={() => {
          setTargetMenuVisible(false);
          setSelectedAction(null);
        }}
        anchor={{ x: 0, y: 0 }}
      >
        {otherPlayers
          .filter((p) => p.isAlive)
          .map((player) => (
            <Menu.Item
              key={player.id}
              onPress={() => handleTargetSelect(player.id)}
              title={player.name}
            />
          ))}
      </Menu>

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
              Fechar
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

