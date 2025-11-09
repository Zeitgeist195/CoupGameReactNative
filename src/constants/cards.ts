import { COLORS } from './colors';

export const CARDS_DATA = {
  conde: {
    name: 'CONDE',
    color: COLORS.conde,
    abilities: [
      { name: '💰 TAXAR', description: 'Receba 3 moedas' },
      { name: '🛡️ BLOQUEAR', description: 'Bloqueie Ajuda Externa' }
    ]
  },
  pirata: {
    name: 'PIRATA',
    color: COLORS.pirata,
    abilities: [
      { name: '💎 ROUBAR', description: 'Roube 2 moedas de outro jogador' },
      { name: '🛡️ BLOQUEAR', description: 'Bloqueie roubos contra você' }
    ]
  },
  cortesa: {
    name: 'CORTESÃ',
    color: COLORS.cortesa,
    abilities: [
      { name: '🛡️ BLOQUEAR', description: 'Bloqueie tentativas de assassinato' },
      { name: '⚠️ PASSIVA', description: 'Deve dar golpe se tiver 10+ moedas' }
    ]
  },
  mercenario: {
    name: 'MERCENÁRIO',
    color: COLORS.mercenario,
    abilities: [
      { name: '🗡️ ASSASSINAR', description: 'Pague 3 moedas para eliminar um jogador' },
      { name: '⚔️ LETAL', description: 'Pode ser bloqueado pela Cortesã' }
    ]
  },
  diplomata: {
    name: 'DIPLOMATA',
    color: COLORS.diplomata,
    abilities: [
      { name: '🔄 TROCAR', description: 'Troque cartas com o baralho' },
      { name: '🛡️ BLOQUEAR', description: 'Bloqueie roubos contra você' }
    ]
  }
};

