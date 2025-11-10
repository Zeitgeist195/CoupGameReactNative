# Status do Refactoring - Coup Game

## ✅ CONCLUÍDO

1. **Dependências instaladas**
   - ✅ i18next, react-i18next, react-native-localize
   - ✅ UUID customizado (sem dependências externas)

2. **Estrutura i18n criada**
   - ✅ `src/i18n/index.ts` - Configuração do i18n
   - ✅ `src/i18n/locales/en.json` - Traduções em inglês
   - ✅ `src/i18n/locales/pt.json` - Traduções em português
   - ✅ i18n inicializado em `App.tsx`

3. **Types atualizados**
   - ✅ `src/types/index.ts` - Todos os tipos em inglês
   - ✅ Novos enums: `Character`, `ActionType`, `CounterActionType`
   - ✅ Novas interfaces: `Card`, `Player`, `Action`, `CounterAction`, `Challenge`
   - ✅ `GameState` atualizado com `phase`, `gameLog` (GameLogEntry[]), `winnerId`
   - ✅ Compatibilidade mantida com `CardType` e `CardState` (legacy)

4. **Engine substituído**
   - ✅ `src/engine/CoupGame.ts` - Novo engine com bugs corrigidos:
     - ✅ Challenge causa perda de influência corretamente
     - ✅ Ambassador tem 4 cartas para escolher (2 originais + 2 do baralho)
     - ✅ Carta é substituída após defesa bem-sucedida
     - ✅ 10+ moedas força Coup obrigatório

5. **GameContext atualizado**
   - ✅ `src/context/GameContext.tsx` - Adaptado para nova API do engine
   - ✅ Actions atualizadas para usar novos métodos
   - ✅ `useMemo` para sincronizar `game` com `gameState`

6. **Componentes atualizados (estrutura de dados)**
   - ✅ `PlayerCard.tsx` - `influences`, `isEliminated`, `isRevealed`
   - ✅ `ActionButtons.tsx` - Novos `ActionType`, `ACTION_CONFIG`
   - ✅ `ExpandableCard.tsx` - `Card` em vez de `CardState`
   - ✅ `ChallengeBlockModal.tsx` - `phase.type` (string), `Character`
   - ✅ `CardSelectionModal.tsx` - `influences`, `isRevealed`
   - ✅ `GameLog.tsx` - `GameLogEntry[]`, suporte a tradução
   - ✅ `GameScreen.tsx` - Nova estrutura de fases e logs
   - ✅ `GameOverScreen.tsx` - `winnerId`, `influences`
   - ✅ `PlayerArea.tsx` - `influences`, `isEliminated`
   - ✅ `CardHand.tsx` - `Card[]` em vez de `CardState[]`

7. **Utilitários atualizados**
   - ✅ `cardTranslations.ts` - `getActionName` atualizado para novos `ActionType`

## ⚠️ PENDENTE

### 1. Integração de i18n nos Componentes

**Status**: Componentes já importam `useTranslation`, mas textos ainda estão hardcoded

**Componentes que precisam de i18n**:
- [ ] `PlayerCard.tsx` - "Seu Turno", "Eliminado", "Moedas", "Cartas", "Reveladas"
- [ ] `ActionButtons.tsx` - Labels e descrições das ações
- [ ] `ChallengeBlockModal.tsx` - "Fase de Desafio", "Fase de Bloqueio", etc.
- [ ] `CardSelectionModal.tsx` - "Selecione uma Carta para Perder"
- [ ] `GameScreen.tsx` - Labels de fases, textos da UI
- [ ] `GameOverScreen.tsx` - "Fim de Jogo!", "Venceu!", etc.
- [ ] `GameSetupScreen.tsx` - Todos os textos
- [ ] `ExpandableCard.tsx` - Descrições das cartas

**Exemplo de como fazer**:
```typescript
import { useTranslation } from 'react-i18next';

function PlayerCard({ player }: Props) {
  const { t } = useTranslation();
  
  return (
    <Text>{t('game.yourTurn')}</Text>  // Em vez de "Seu Turno"
    <Text>{t('characters.duke')}</Text> // Em vez de "CONDE"
  );
}
```

### 2. Nomes dos Personagens

**Status**: Nomes ainda hardcoded em português

**Onde atualizar**:
- [ ] `cardTranslations.ts` - Usar `t('characters.duke')` em vez de retornar "CONDE"
- [ ] Todos os componentes que exibem nomes de personagens

**Nota**: Os arquivos de tradução já têm os nomes corretos:
- `duke` → "Count" (EN) / "Conde" (PT)
- `assassin` → "Mercenary" (EN) / "Mercenário" (PT)
- `captain` → "Pirate" (EN) / "Pirata" (PT)
- `ambassador` → "Diplomat" (EN) / "Diplomata" (PT)
- `contessa` → "Courtesan" (EN) / "Cortesã" (PT)

### 3. Testes dos Bugs Corrigidos

**Status**: Não testado ainda

**Bugs que devem estar corrigidos**:
- [ ] Challenge causa perda de influência corretamente
- [ ] Ambassador tem 4 cartas para escolher
- [ ] Carta é substituída após defesa bem-sucedida
- [ ] 10+ moedas força Coup obrigatório

## 📊 Progresso Geral

- **Estrutura de dados**: ✅ 100% (todos os componentes atualizados)
- **Engine e lógica**: ✅ 100% (bugs corrigidos)
- **i18n integração**: ⚠️ 0% (estrutura criada, mas não usada)
- **Testes**: ⚠️ 0% (não testado ainda)

## 🎯 Próximos Passos

1. **Integrar i18n em todos os componentes** (prioridade alta)
   - Substituir textos hardcoded por `t('key')`
   - Usar `t('characters.duke')` para nomes de personagens
   - Usar `t('actions.tax')` para nomes de ações

2. **Testar bugs corrigidos** (prioridade alta)
   - Testar cada bug individualmente
   - Verificar se o jogo funciona end-to-end

3. **Polimento** (prioridade baixa)
   - Adicionar mais traduções se necessário
   - Melhorar mensagens de erro
   - Adicionar animações se necessário

## 📝 Notas Técnicas

### Workaround no GameContext
O novo engine não suporta restauração de estado, então estamos usando um workaround:
```typescript
const game = new CoupGame(state.players.map(p => p.name));
(game as any).state = { ...state };
```

**Ideal**: Adicionar método `restoreState(state: GameState)` no engine.

### Compatibilidade Legacy
Mantivemos `CardType` e `CardState` para compatibilidade, mas todos os componentes novos usam `Character` e `Card`.
