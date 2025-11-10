// ============================================================================
// ARQUIVO: src/components/NarrativeModal.tsx
// MODAL NARRATIVO PARA EXPLICAR AÇÕES DO JOGO
// ============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Button, Text, Card, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface NarrativeModalProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export const NarrativeModal: React.FC<NarrativeModalProps> = ({
  visible,
  title,
  message,
  onDismiss
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
        dismissable={false} // Força usuário a clicar no botão
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Título */}
          <Card.Title
            title={title}
            titleStyle={[styles.title, { color: theme.colors.primary }]}
          />

          {/* Conteúdo */}
          <Card.Content>
            <Text style={[styles.message, { color: theme.colors.onSurface }]}>
              {message}
            </Text>
          </Card.Content>

          {/* Botão de Ação */}
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {t('buttons.continue')}
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
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

// ============================================================================
// VARIANTE: Modal com Ícone (Opcional)
// ============================================================================

interface NarrativeModalWithIconProps extends NarrativeModalProps {
  icon?: string;
  iconColor?: string;
}

export const NarrativeModalWithIcon: React.FC<NarrativeModalWithIconProps> = ({
  visible,
  title,
  message,
  onDismiss,
  icon = 'information',
  iconColor
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
        dismissable={false}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Título com Ícone */}
          <Card.Title
            title={title}
            titleStyle={[styles.title, { color: theme.colors.primary }]}
            left={(props) => (
              <View style={styles.iconContainer}>
                {/* Você pode usar react-native-vector-icons aqui */}
                <Text style={[styles.iconText, { color: iconColor || theme.colors.primary }]}>
                  {getIconEmoji(icon)}
                </Text>
              </View>
            )}
          />

          <Card.Content>
            <Text style={[styles.message, { color: theme.colors.onSurface }]}>
              {message}
            </Text>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {t('buttons.continue')}
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
};

// Helper para ícones emoji
function getIconEmoji(icon: string): string {
  const icons: Record<string, string> = {
    success: '✅',
    failed: '❌',
    challenge: '⚔️',
    info: 'ℹ️',
    warning: '⚠️',
    card: '🎴',
    coins: '💰'
  };
  return icons[icon] || 'ℹ️';
}

const iconStyles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  iconText: {
    fontSize: 24
  }
});

// ============================================================================
// USO NO GAMESCREEN
// ============================================================================

/*
// Em GameScreen.tsx

import { NarrativeModal } from '../components/NarrativeModal';
import { useGame } from '../context/GameContext';

export const GameScreen = () => {
  const { narrativeModal } = useGame();

  return (
    <View style={styles.container}>
      {/* Seu conteúdo do jogo *\/}
      
      {/* Modal Narrativo *\/}
      {narrativeModal && (
        <NarrativeModal
          visible={narrativeModal.visible}
          title={narrativeModal.title}
          message={narrativeModal.message}
          onDismiss={narrativeModal.onDismiss}
        />
      )}
    </View>
  );
};
*/

// ============================================================================
// EXEMPLO DE USO DIRETO
// ============================================================================

/*
// Usar showNarrativeModal do contexto

showNarrativeModal(
  'Desafio Falhou!',
  'Jogador 2 perdeu o desafio! Agora deve escolher uma carta para revelar.',
  () => {
    // Callback executado quando usuário clica em "Continuar"
    console.log('Modal fechado');
    setNarrativeModal(null);
  }
);
*/
