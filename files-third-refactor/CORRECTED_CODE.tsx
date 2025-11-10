// ============================================================================
// ARQUIVO: src/context/GameContext.tsx
// SEÇÃO: handleChallenge - VERSÃO CORRIGIDA
// ============================================================================

// ✅ CÓDIGO CORRIGIDO - COPIE E COLE ESTE CÓDIGO

const handleChallenge = (challengerId: string) => {
  if (!gameState.pendingAction) return;

  const challenger = gameState.players.find(p => p.id === challengerId);
  const defender = gameState.players.find(
    p => p.id === gameState.pendingAction!.playerId
  );

  if (!challenger || !defender) return;

  const claimedCharacter = gameState.pendingAction.claimedCharacter;
  if (!claimedCharacter) return;

  // Verificar se defender TEM a carta que ele afirmou ter
  const hasCard = defender.influences.some(
    card => !card.isRevealed && card.character === claimedCharacter
  );

  if (hasCard) {
    // ═══════════════════════════════════════════════════════════════
    // CASO 1: DEFENDER TEM A CARTA - CHALLENGE FALHOU
    // ═══════════════════════════════════════════════════════════════
    
    console.log('🔴 Challenge FALHOU');
    console.log(`- ${defender.name} TEM ${claimedCharacter}`);
    console.log(`- ${challenger.name} PERDE influência (desafiou errado)`);
    
    // Modal 1: Mostrar que defender tem a carta
    showNarrativeModal(
      'Desafio Falhou!',
      `${defender.name} revelou ${t(`characters.${claimedCharacter}`)}! ` +
      `${challenger.name} perdeu o desafio.`,
      () => {
        setNarrativeModal(null);
        
        // Modal 2: Challenger deve perder carta
        setTimeout(() => {
          showNarrativeModal(
            'Perder Influência',
            `${challenger.name} deve escolher uma carta para revelar.`,
            () => {
              setNarrativeModal(null);
              
              // ✅ CRÍTICO: CHALLENGER perde (não o defender!)
              dispatch({
                type: 'START_CARD_SELECTION',
                payload: {
                  playerId: challenger.id, // ✅ CORRETO
                  reason: 'challenge_lost'
                }
              });
            }
          );
        }, 300);
      }
    );

    // Definir callback para DEPOIS que challenger perder a carta
    setPostCardLossCallback(() => {
      // Modal 3: Defender pega nova carta
      showNarrativeModal(
        'Nova Carta',
        `${defender.name} devolve a carta revelada e pega uma nova do baralho.`,
        () => {
          setNarrativeModal(null);
          
          // Processar troca de carta
          dispatch({
            type: 'EXCHANGE_REVEALED_CARD',
            payload: {
              playerId: defender.id,
              revealedCharacter: claimedCharacter
            }
          });
          
          // Modal 4: Ação continua
          setTimeout(() => {
            showNarrativeModal(
              'Ação Prossegue',
              `${defender.name} prossegue com a ação original.`,
              () => {
                setNarrativeModal(null);
                
                // Executar ação original
                executeCurrentAction();
              }
            );
          }, 300);
        }
      );
    });

  } else {
    // ═══════════════════════════════════════════════════════════════
    // CASO 2: DEFENDER NÃO TEM A CARTA - CHALLENGE SUCEDEU
    // ═══════════════════════════════════════════════════════════════
    
    console.log('🟢 Challenge SUCEDEU');
    console.log(`- ${defender.name} NÃO TEM ${claimedCharacter}`);
    console.log(`- ${defender.name} PERDE influência (foi pego mentindo)`);
    
    // Modal 1: Mostrar que defender não tem a carta
    showNarrativeModal(
      'Desafio Bem-Sucedido!',
      `${defender.name} não tinha ${t(`characters.${claimedCharacter}`)}! ` +
      `${challenger.name} venceu o desafio!`,
      () => {
        setNarrativeModal(null);
        
        // Modal 2: Defender deve perder carta
        setTimeout(() => {
          showNarrativeModal(
            'Perder Influência',
            `${defender.name} deve escolher uma carta para revelar.`,
            () => {
              setNarrativeModal(null);
              
              // ✅ CORRETO: DEFENDER perde (foi pego mentindo)
              dispatch({
                type: 'START_CARD_SELECTION',
                payload: {
                  playerId: defender.id, // ✅ CORRETO
                  reason: 'caught_lying'
                }
              });
            }
          );
        }, 300);
      }
    );

    // Definir callback para DEPOIS que defender perder a carta
    setPostCardLossCallback(() => {
      // Modal 3: Ação falha
      showNarrativeModal(
        'Ação Falhou',
        `A ação de ${defender.name} foi bloqueada pelo desafio bem-sucedido.`,
        () => {
          setNarrativeModal(null);
          
          // Limpar e passar turno
          dispatch({ type: 'CLEAR_PENDING_ACTION' });
          
          setTimeout(() => {
            dispatch({ type: 'NEXT_TURN' });
          }, 500);
        }
      );
    });
  }
};

// ============================================================================
// ADICIONE ESTES ESTADOS NO INÍCIO DO SEU CONTEXT
// ============================================================================

const [narrativeModal, setNarrativeModal] = useState<{
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
} | null>(null);

const [postCardLossCallback, setPostCardLossCallback] = useState<(() => void) | null>(null);

// Função helper para modal narrativo
const showNarrativeModal = (
  title: string,
  message: string,
  onDismiss: () => void
) => {
  setNarrativeModal({
    visible: true,
    title,
    message,
    onDismiss
  });
};

// ============================================================================
// MODIFIQUE A FUNÇÃO QUE LIDA COM PERDA DE CARTA
// ============================================================================

const handleCardLoss = (playerId: string, cardIndex: number) => {
  // Revelar a carta escolhida
  dispatch({
    type: 'REVEAL_CARD',
    payload: {
      playerId,
      cardIndex
    }
  });

  // ✅ EXECUTAR CALLBACK PÓS-PERDA DE CARTA
  if (postCardLossCallback) {
    setTimeout(() => {
      postCardLossCallback();
      setPostCardLossCallback(null);
    }, 500);
  }
};

// ============================================================================
// ADICIONE ESTAS ACTIONS NO SEU REDUCER
// ============================================================================

case 'START_CARD_SELECTION':
  return {
    ...state,
    phase: 'card_selection',
    cardSelectionPlayerId: action.payload.playerId,
    cardSelectionReason: action.payload.reason
  };

case 'REVEAL_CARD': {
  const player = state.players.find(p => p.id === action.payload.playerId);
  if (!player) return state;

  const newInfluences = [...player.influences];
  newInfluences[action.payload.cardIndex].isRevealed = true;

  // Verificar se jogador foi eliminado
  const allRevealed = newInfluences.every(card => card.isRevealed);

  return {
    ...state,
    players: state.players.map(p =>
      p.id === action.payload.playerId
        ? {
            ...p,
            influences: newInfluences,
            isEliminated: allRevealed
          }
        : p
    ),
    phase: 'waiting'
  };
}

case 'EXCHANGE_REVEALED_CARD': {
  const player = state.players.find(p => p.id === action.payload.playerId);
  if (!player || state.courtDeck.length === 0) return state;

  // 1. Adicionar carta revelada de volta ao deck
  const newDeck = [...state.courtDeck, action.payload.revealedCharacter];
  
  // 2. Embaralhar
  const shuffledDeck = shuffleDeck(newDeck);
  
  // 3. Pegar nova carta do topo
  const newCard = shuffledDeck[shuffledDeck.length - 1];
  const deckAfterDraw = shuffledDeck.slice(0, -1);

  // 4. Substituir carta no jogador
  const newInfluences = player.influences.map(card => {
    if (!card.isRevealed && card.character === action.payload.revealedCharacter) {
      return {
        character: newCard,
        isRevealed: false
      };
    }
    return card;
  });

  return {
    ...state,
    courtDeck: deckAfterDraw,
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
    pendingAction: null,
    phase: 'waiting'
  };

case 'NEXT_TURN': {
  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  
  // Pular jogadores eliminados
  while (state.players[nextIndex].isEliminated) {
    nextIndex = (nextIndex + 1) % state.players.length;
  }

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    phase: 'action',
    pendingAction: null
  };
}

// ============================================================================
// FUNÇÃO AUXILIAR: EMBARALHAR DECK
// ============================================================================

function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// EXPORTAR NO CONTEXTO
// ============================================================================

return (
  <GameContext.Provider
    value={{
      gameState,
      dispatch,
      handleChallenge,
      handleCardLoss,
      narrativeModal, // ✅ Adicionar
      showNarrativeModal, // ✅ Adicionar
      // ... outros exports
    }}
  >
    {children}
  </GameContext.Provider>
);
