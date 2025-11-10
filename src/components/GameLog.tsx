import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../constants/colors';

import { GameLogEntry } from '../types';
import { useTranslation } from 'react-i18next';

interface GameLogProps {
  logs: GameLogEntry[];
}

export default function GameLog({ logs }: GameLogProps) {
  const { t } = useTranslation();
  
  return (
    <ScrollView style={styles.logContainer} nestedScrollEnabled>
      {logs.length === 0 ? (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Nenhum evento ainda
        </Text>
      ) : (
        logs.slice().reverse().map((log, index) => {
          // Use translation if available, otherwise use message
          const logMessage = log.translationKey 
            ? t(log.translationKey, log.translationParams || {})
            : log.message;
          
          return (
            <View key={log.id || index} style={styles.logEntry}>
              <Text variant="bodySmall" style={styles.logText}>
                {logMessage}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logContainer: {
    maxHeight: 400,
  },
  logEntry: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.buttonSecondary,
  },
  logText: {
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});

