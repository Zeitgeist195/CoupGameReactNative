import { CardType, ActionType } from '../types';
import { CARD_IMAGES } from '../assets/cards';

/**
 * Traduz o tipo de carta para o nome em português
 */
export function getCardName(cardType: CardType): string {
  switch (cardType) {
    case CardType.DUKE:
      return 'CONDE';
    case CardType.CAPTAIN:
      return 'PIRATA';
    case CardType.ASSASSIN:
      return 'MERCENÁRIO';
    case CardType.AMBASSADOR:
      return 'DIPLOMATA';
    case CardType.CONTESSA:
      return 'CORTESÃ';
    default:
      return cardType;
  }
}

/**
 * Traduz o tipo de ação para o nome em português
 */
export function getActionName(actionType: ActionType): string {
  switch (actionType) {
    case ActionType.DUKE_TAX:
      return 'Taxar (Conde)';
    case ActionType.CAPTAIN_STEAL:
      return 'Roubar (Pirata)';
    case ActionType.ASSASSIN_KILL:
      return 'Assassinar (Mercenário)';
    case ActionType.AMBASSADOR_EXCHANGE:
      return 'Trocar (Diplomata)';
    case ActionType.INCOME:
      return 'Renda';
    case ActionType.FOREIGN_AID:
      return 'Ajuda Externa';
    case ActionType.COUP:
      return 'Golpe';
    default:
      return actionType;
  }
}

/**
 * Obtém a cor da carta baseada no tipo
 */
export function getCardColor(cardType: CardType): string {
  switch (cardType) {
    case CardType.DUKE:
      return '#9b59b6'; // Roxo
    case CardType.CAPTAIN:
      return '#e74c3c'; // Vermelho
    case CardType.ASSASSIN:
      return '#34495e'; // Cinza
    case CardType.AMBASSADOR:
      return '#3498db'; // Azul
    case CardType.CONTESSA:
      return '#e91e63'; // Rosa
    default:
      return '#757575';
  }
}

/**
 * Obtém a imagem da carta baseada no tipo
 */
export function getCardImage(cardType: CardType) {
  switch (cardType) {
    case CardType.DUKE:
      return CARD_IMAGES.conde;
    case CardType.CAPTAIN:
      return CARD_IMAGES.pirata;
    case CardType.ASSASSIN:
      return CARD_IMAGES.mercenario;
    case CardType.AMBASSADOR:
      return CARD_IMAGES.diplomata;
    case CardType.CONTESSA:
      return CARD_IMAGES.cortesa;
    default:
      return null;
  }
}

