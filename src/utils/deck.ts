import { CardType } from '../types';

// Standard Coup deck: 3 of each card type
const STANDARD_DECK: CardType[] = [
  CardType.DUKE,
  CardType.DUKE,
  CardType.DUKE,
  CardType.CAPTAIN,
  CardType.CAPTAIN,
  CardType.CAPTAIN,
  CardType.ASSASSIN,
  CardType.ASSASSIN,
  CardType.ASSASSIN,
  CardType.AMBASSADOR,
  CardType.AMBASSADOR,
  CardType.AMBASSADOR,
  CardType.CONTESSA,
  CardType.CONTESSA,
  CardType.CONTESSA,
];

export function createDeck(): CardType[] {
  return [...STANDARD_DECK];
}

export function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCard(deck: CardType[]): { card: CardType; newDeck: CardType[] } {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  const newDeck = [...deck];
  const card = newDeck.pop()!;
  return { card, newDeck };
}

