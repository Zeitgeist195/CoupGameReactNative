import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Button, Text, Card as PaperCard, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';

interface NarrativeModalProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export default function NarrativeModal({
  visible,
  title,
  message,
  onDismiss
}: NarrativeModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!visible) {
    console.log('NarrativeModal: not visible');
    return null;
  }

  console.log('NarrativeModal: RENDERING', { title, message });

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={() => {}} // Prevent dismissal by tapping outside
        contentContainerStyle={styles.modalContainer}
        dismissable={false}
      >
        <PaperCard style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <PaperCard.Title
            title={title}
            titleStyle={[styles.title, { color: theme.colors.primary }]}
          />
          <PaperCard.Content>
            <Text style={[styles.message, { color: theme.colors.onSurface }]}>
              {message}
            </Text>
          </PaperCard.Content>
          <PaperCard.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => {
                console.log('NarrativeModal: Button pressed, calling onDismiss');
                onDismiss();
              }}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {t('buttons.continue', { defaultValue: 'Continuar' })}
            </Button>
          </PaperCard.Actions>
        </PaperCard>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10000
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 8
  },
  actions: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  button: {
    minWidth: 140,
    paddingVertical: 4
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

