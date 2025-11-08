import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Portal, Dialog, Paragraph } from 'react-native-paper';
import { ActionType, Player } from '../types';
import { ACTION_RULES } from '../constants/rules';

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
        return 'Income (+1 coin)';
      case ActionType.FOREIGN_AID:
        return 'Foreign Aid (+2 coins)';
      case ActionType.COUP:
        return `Coup (7 coins)`;
      case ActionType.DUKE_TAX:
        return 'Tax (+3 coins)';
      case ActionType.CAPTAIN_STEAL:
        return 'Steal (2 coins)';
      case ActionType.ASSASSIN_KILL:
        return 'Assassinate (3 coins)';
      case ActionType.AMBASSADOR_EXCHANGE:
        return 'Exchange Cards';
      default:
        return action;
    }
  };

  const getActionDescription = (action: ActionType): string => {
    const rule = ACTION_RULES[action];
    let desc = '';
    switch (action) {
      case ActionType.INCOME:
        desc = 'Take 1 coin. Cannot be blocked or challenged.';
        break;
      case ActionType.FOREIGN_AID:
        desc = 'Take 2 coins. Can be blocked by Duke.';
        break;
      case ActionType.COUP:
        desc = 'Pay 7 coins to eliminate a player. Cannot be blocked or challenged.';
        break;
      case ActionType.DUKE_TAX:
        desc = 'Take 3 coins. Can be challenged.';
        break;
      case ActionType.CAPTAIN_STEAL:
        desc = 'Steal 2 coins from a player. Can be blocked or challenged.';
        break;
      case ActionType.ASSASSIN_KILL:
        desc = 'Pay 3 coins to eliminate a player. Can be blocked or challenged.';
        break;
      case ActionType.AMBASSADOR_EXCHANGE:
        desc = 'Exchange cards with the deck. Can be challenged.';
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
            <Button onPress={() => setInfoDialogVisible(false)}>Close</Button>
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
  },
  actionItem: {
    width: '48%',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: 4,
  },
  infoButton: {
    marginLeft: 4,
    minWidth: 40,
  },
});

