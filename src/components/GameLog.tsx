import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../constants/colors';

interface GameLogProps {
  logs: string[];
}

export default function GameLog({ logs }: GameLogProps) {
  return (
    <ScrollView style={styles.logContainer} nestedScrollEnabled>
      {logs.length === 0 ? (
        <Text variant="bodyMedium" style={styles.emptyText}>
          Nenhum evento ainda
        </Text>
      ) : (
        logs.slice().reverse().map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <Text variant="bodySmall" style={styles.logText}>
              {log}
            </Text>
          </View>
        ))
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

