# 🐛 COUP GAME - CHALLENGE BUG FIX + NARRATIVE MODALS

## 📋 PROBLEMA IDENTIFICADO

### Bug Principal:
Quando um jogador desafia (challenge) e PERDE o desafio, o jogador ERRADO está perdendo a carta.

**Exemplo do Bug:**
1. Jogador 1 tem Capitão e tenta roubar
2. Jogador 2 desafia
3. Jogador 1 mostra que tem Capitão (prova que não está mentindo)
4. ❌ **BUG**: Jogador 1 está sendo forçado a perder carta
5. ✅ **CORRETO**: Jogador 2 deveria perder carta (perdeu o desafio)

---

## 🔧 SOLUÇÃO COMPLETA

### Parte 1: Corrigir GameContext.tsx

Encontre a função `handleChallenge` ou similar no seu `GameContext.tsx` e substitua pela versão corrigida abaixo:

```typescript
// src/context/GameContext.tsx

// Estado para modais narrativos
const [narrativeModal, setNarrativeModal] = useState<{
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
} | null>(null);

// Função para mostrar modal narrativo
const showNarrativeModal = (
  title: string,
  message: string,
  onDismiss?: () => void
) => {
  setNarrativeModal({
    visible: true,
    title,
    message,
    onDismiss: onDismiss || (() => setNarrativeModal(null))
  });
};

// ✅ FUNÇÃO CORRIGIDA DE CHALLENGE
const handleChallenge = async (challengerId: string) => {
  if (!gameState.pendingAction) return;

  const challenger = gameState.players.find(p => p.id === challengerId);
  const defender = gameState.players.find(
    p => p.id === gameState.pendingAction!.playerId
  );

  if (!challenger || !defender) return;

  const claimedCharacter = gameState.pendingAction.claimedCharacter;
  if (!claimedCharacter) return;

  // Verificar se o defender realmente tem a carta
  const hasCard = defender.influences.some(
    card => !card.isRevealed && card.character === claimedCharacter
  );

  if (hasCard) {
    // ===================================================================
    // CHALLENGE FALHOU - Defender TEM a carta
    // CHALLENGER perde influência (não o defender!)
    // ===================================================================

    // 1. Mostrar que defender tem a carta
    showNarrativeModal(
      t('challenge.failed.title'),
      t('challenge.failed.message', {
        challengerName: challenger.name,
        defenderName: defender.name,
        character: t(`characters.${claimedCharacter}`)
      }),
      () => {
        // 2. Após fechar modal, challenger escolhe carta para perder
        setNarrativeModal(null);
        
        // Modal de seleção de carta
        showNarrativeModal(
          t('challenge.loseInfluence.title'),
          t('challenge.loseInfluence.message', {
            playerName: challenger.name
          }),
          () => {
            // ✅ CRÍTICO: CHALLENGER perde influência (não o defender!)
            dispatch({
              type: 'SELECT_CARD_TO_LOSE',
              payload: {
                playerId: challenger.id, // ✅ CORRETO
                phase: 'challenge_failed'
              }
            });
            setNarrativeModal(null);
          }
        );
      }
    );

    // Callback após challenger perder influência
    setOnInfluenceLostCallback(() => () => {
      // Defender devolve carta revelada ao deck e pega nova
      const cardToReturn = defender.influences.find(
        card => !card.isRevealed && card.character === claimedCharacter
      );

      if (cardToReturn) {
        // Devolver carta ao deck
        dispatch({
          type: 'RETURN_CARD_TO_DECK',
          payload: {
            playerId: defender.id,
            character: claimedCharacter
          }
        });

        // Pegar nova carta
        dispatch({
          type: 'DRAW_NEW_CARD',
          payload: {
            playerId: defender.id
          }
        });

        // Mostrar modal explicando
        showNarrativeModal(
          t('challenge.newCard.title'),
          t('challenge.newCard.message', {
            playerName: defender.name
          }),
          () => {
            setNarrativeModal(null);
            
            // Agora a ação original continua
            showNarrativeModal(
              t('action.continues.title'),
              t('action.continues.message', {
                playerName: defender.name,
                action: t(`actions.${gameState.pendingAction?.action}`)
              }),
              () => {
                setNarrativeModal(null);
                // Executar ação original
                executeCurrentAction();
              }
            );
          }
        );
      }
    });

  } else {
    // ===================================================================
    // CHALLENGE SUCEDEU - Defender NÃO tem a carta (estava mentindo)
    // DEFENDER perde influência
    // ===================================================================

    // 1. Mostrar que defender não tem a carta
    showNarrativeModal(
      t('challenge.succeeded.title'),
      t('challenge.succeeded.message', {
        challengerName: challenger.name,
        defenderName: defender.name,
        character: t(`characters.${claimedCharacter}`)
      }),
      () => {
        // 2. Após fechar modal, defender escolhe carta para perder
        setNarrativeModal(null);
        
        showNarrativeModal(
          t('challenge.loseInfluence.title'),
          t('challenge.loseInfluence.message', {
            playerName: defender.name
          }),
          () => {
            // ✅ CORRETO: DEFENDER perde influência
            dispatch({
              type: 'SELECT_CARD_TO_LOSE',
              payload: {
                playerId: defender.id, // ✅ CORRETO
                phase: 'challenge_succeeded'
              }
            });
            setNarrativeModal(null);
          }
        );
      }
    );

    // Callback após defender perder influência
    setOnInfluenceLostCallback(() => () => {
      // Ação FALHA (não continua)
      showNarrativeModal(
        t('action.failed.title'),
        t('action.failed.message', {
          playerName: defender.name
        }),
        () => {
          setNarrativeModal(null);
          
          // Limpar ação pendente e passar turno
          dispatch({ type: 'CLEAR_PENDING_ACTION' });
          dispatch({ type: 'NEXT_TURN' });
        }
      );
    });
  }
};
```

---

## 📝 PARTE 2: Adicionar Traduções

Adicione as seguintes chaves de tradução nos seus arquivos de i18n:

### en.json
```json
{
  "challenge": {
    "failed": {
      "title": "Challenge Failed!",
      "message": "{{defenderName}} revealed {{character}}! {{challengerName}} lost the challenge and must lose an influence."
    },
    "succeeded": {
      "title": "Challenge Succeeded!",
      "message": "{{defenderName}} didn't have {{character}}! {{defenderName}} must lose an influence."
    },
    "loseInfluence": {
      "title": "Lose Influence",
      "message": "{{playerName}} must choose a card to reveal"
    },
    "newCard": {
      "title": "New Card",
      "message": "{{playerName}} returns the revealed card to the deck and draws a new one"
    }
  },
  "action": {
    "continues": {
      "title": "Action Continues",
      "message": "{{playerName}} proceeds with {{action}}"
    },
    "failed": {
      "title": "Action Failed",
      "message": "{{playerName}}'s action was blocked by the successful challenge"
    }
  }
}
```

### pt.json
```json
{
  "challenge": {
    "failed": {
      "title": "Desafio Falhou!",
      "message": "{{defenderName}} revelou {{character}}! {{challengerName}} perdeu o desafio e deve perder uma influência."
    },
    "succeeded": {
      "title": "Desafio Bem-Sucedido!",
      "message": "{{defenderName}} não tinha {{character}}! {{defenderName}} deve perder uma influência."
    },
    "loseInfluence": {
      "title": "Perder Influência",
      "message": "{{playerName}} deve escolher uma carta para revelar"
    },
    "newCard": {
      "title": "Nova Carta",
      "message": "{{playerName}} devolve a carta revelada ao deck e pega uma nova"
    }
  },
  "action": {
    "continues": {
      "title": "Ação Prossegue",
      "message": "{{playerName}} prossegue com {{action}}"
    },
    "failed": {
      "title": "Ação Falhou",
      "message": "A ação de {{playerName}} foi bloqueada pelo desafio bem-sucedido"
    }
  }
}
```

---

## 🎭 PARTE 3: Componente NarrativeModal

Crie o componente do modal narrativo:

```typescript
// src/components/NarrativeModal.tsx
import React from 'react';
import { Modal, Portal, Button, Text, Card } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

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
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <Card.Title title={title} titleStyle={styles.title} />
          <Card.Content>
            <Text style={styles.message}>{message}</Text>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={styles.button}
            >
              Continuar
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
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: 16
  },
  actions: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  button: {
    minWidth: 120
  }
});
```

---

## 🎯 PARTE 4: Usar NarrativeModal no GameScreen

No seu `GameScreen.tsx`, adicione o componente:

```typescript
// src/screens/GameScreen.tsx
import { NarrativeModal } from '../components/NarrativeModal';
import { useGame } from '../context/GameContext';

export const GameScreen = () => {
  const { gameState, narrativeModal } = useGame();

  return (
    <View style={styles.container}>
      {/* Seu conteúdo do jogo aqui */}
      
      {/* Modal Narrativo */}
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
```

---

## 🔄 PARTE 5: Atualizar Reducer

Adicione as novas actions no seu reducer:

```typescript
// Em GameContext.tsx ou gameReducer.ts

type GameAction =
  | { type: 'SELECT_CARD_TO_LOSE'; payload: { playerId: string; phase: string } }
  | { type: 'RETURN_CARD_TO_DECK'; payload: { playerId: string; character: Character } }
  | { type: 'DRAW_NEW_CARD'; payload: { playerId: string } }
  | { type: 'CLEAR_PENDING_ACTION' }
  | { type: 'NEXT_TURN' }
  // ... outras actions

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_CARD_TO_LOSE':
      return {
        ...state,
        phase: 'card_selection',
        selectingPlayerId: action.payload.playerId,
        selectionPhase: action.payload.phase
      };

    case 'RETURN_CARD_TO_DECK': {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return state;

      // Encontrar a carta
      const cardIndex = player.influences.findIndex(
        card => !card.isRevealed && card.character === action.payload.character
      );

      if (cardIndex === -1) return state;

      // Adicionar carta de volta ao deck
      const newDeck = [...state.courtDeck, action.payload.character];
      
      // Remover carta do jogador temporariamente (será substituída)
      const newInfluences = [...player.influences];
      
      return {
        ...state,
        courtDeck: shuffleDeck(newDeck),
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, influences: newInfluences }
            : p
        )
      };
    }

    case 'DRAW_NEW_CARD': {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player || state.courtDeck.length === 0) return state;

      // Pegar carta do topo do deck
      const newCard = state.courtDeck[state.courtDeck.length - 1];
      const newDeck = state.courtDeck.slice(0, -1);

      // Encontrar primeira carta não revelada e substituir
      const cardIndex = player.influences.findIndex(card => !card.isRevealed);
      if (cardIndex === -1) return state;

      const newInfluences = [...player.influences];
      newInfluences[cardIndex] = {
        character: newCard,
        isRevealed: false
      };

      return {
        ...state,
        courtDeck: newDeck,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, influences: newInfluences }
            : p
        )
      };
    }

    case 'CLEAR_PENDING_ACTION':
      return {
        ...state,
        pendingAction: null
      };

    case 'NEXT_TURN': {
      // Encontrar próximo jogador não eliminado
      let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextIndex].isEliminated) {
        nextIndex = (nextIndex + 1) % state.players.length;
      }

      return {
        ...state,
        currentPlayerIndex: nextIndex,
        phase: 'action'
      };
    }

    default:
      return state;
  }
};

// Função auxiliar para embaralhar deck
function shuffleDeck(deck: Character[]): Character[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Passo 1: Corrigir handleChallenge
- [ ] Abrir `src/context/GameContext.tsx`
- [ ] Encontrar função `handleChallenge`
- [ ] Verificar quem está perdendo influência
- [ ] Substituir pela versão corrigida acima

### Passo 2: Adicionar Estado do Modal
- [ ] Adicionar `narrativeModal` ao estado
- [ ] Adicionar função `showNarrativeModal`
- [ ] Exportar no contexto

### Passo 3: Criar Componente
- [ ] Criar `src/components/NarrativeModal.tsx`
- [ ] Copiar código do componente

### Passo 4: Adicionar Traduções
- [ ] Atualizar `src/i18n/locales/en.json`
- [ ] Atualizar `src/i18n/locales/pt.json`

### Passo 5: Atualizar Reducer
- [ ] Adicionar novas actions
- [ ] Implementar lógica de troca de cartas

### Passo 6: Integrar no GameScreen
- [ ] Importar `NarrativeModal`
- [ ] Adicionar renderização condicional

### Passo 7: Testar
- [ ] Teste 1: Challenge falhou (defender tem carta)
  - Verificar se challenger perde carta
  - Verificar se defender pega nova carta
  - Verificar se ação continua
  
- [ ] Teste 2: Challenge sucedeu (defender não tem carta)
  - Verificar se defender perde carta
  - Verificar se ação falha
  - Verificar se passa turno

---

## 🐛 DEBUGGING

Se ainda houver problemas, verifique:

1. **Quem está chamando SELECT_CARD_TO_LOSE?**
   - Deve ser o ID correto do jogador que perdeu
   - Console.log para verificar: `console.log('Perdendo:', playerId)`

2. **Estado da ação pendente**
   - Verificar se `pendingAction.playerId` é quem executou a ação
   - Não confundir com quem está desafiando

3. **Fluxo de callbacks**
   - Garantir que `onInfluenceLostCallback` está sendo chamado
   - Verificar ordem de execução

---

## 📊 FLUXO CORRETO DO CHALLENGE

```
┌─────────────────────────────────────┐
│ Jogador 1 faz ação (tem a carta)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Jogador 2 DESAFIA                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Verificar: Jogador 1 tem a carta?  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
     SIM              NÃO
       │               │
       ▼               ▼
┌──────────┐    ┌──────────────┐
│Challenge │    │Challenge     │
│FALHOU    │    │SUCEDEU       │
└────┬─────┘    └─────┬────────┘
     │                │
     ▼                ▼
┌──────────┐    ┌──────────────┐
│Jogador 2 │    │Jogador 1     │
│PERDE     │    │PERDE         │
│carta     │    │carta         │
└────┬─────┘    └─────┬────────┘
     │                │
     ▼                ▼
┌──────────┐    ┌──────────────┐
│Jogador 1 │    │Ação FALHA    │
│pega nova │    │Passa turno   │
│carta     │    └──────────────┘
└────┬─────┘
     │
     ▼
┌──────────┐
│Ação      │
│CONTINUA  │
└──────────┘
```

---

Essa é a correção completa! O bug principal estava em identificar QUEM deve perder a influência em cada caso do challenge. 🎯
