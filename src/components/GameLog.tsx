import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface GameLogProps {
  logs: string[];
}

export default function GameLog({ logs }: GameLogProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Game Log
        </Text>
        <ScrollView style={styles.logContainer} nestedScrollEnabled>
          {logs.slice().reverse().map((log, index) => (
            <Text key={index} variant="bodySmall" style={styles.logEntry}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    maxHeight: 200,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 150,
  },
  logEntry: {
    marginBottom: 4,
    color: '#666',
  },
});

