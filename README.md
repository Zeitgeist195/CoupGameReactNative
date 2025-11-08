# Coup Game - React Native

A React Native implementation of the Coup card game for Android (and iOS).

## Features

- Local multiplayer (2-6 players)
- Full game logic implementation
- Challenge and block system with timers
- Card selection for losing influence
- Game log for action history
- Beautiful UI with React Native Paper

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. For Android:
```bash
npm run android
# or
yarn android
```

3. For iOS:
```bash
npm run ios
# or
yarn ios
```

## Game Rules

### Actions

- **Income**: Take 1 coin (cannot be blocked or challenged)
- **Foreign Aid**: Take 2 coins (can be blocked by Duke)
- **Coup**: Pay 7 coins to eliminate a player (cannot be blocked or challenged)
- **Tax (Duke)**: Take 3 coins (can be challenged)
- **Steal (Captain)**: Steal 2 coins from a player (can be blocked or challenged)
- **Assassinate**: Pay 3 coins to eliminate a player (can be blocked or challenged)
- **Exchange (Ambassador)**: Exchange cards with the deck (can be challenged)

### How to Play

1. Setup: Add 2-6 players
2. Each player starts with 2 coins and 2 hidden cards
3. On your turn, choose an action
4. Other players can challenge or block (if applicable)
5. If you lose a challenge or are eliminated, you lose a card
6. Last player with cards remaining wins!

## Project Structure

```
src/
├── types/          # TypeScript interfaces and enums
├── engine/         # Game logic (CoupGame class)
├── context/        # State management (Context + useReducer)
├── screens/        # Screen components
├── components/     # Reusable components
├── utils/          # Helper functions
└── constants/      # Game rules and constants
```

## Technologies

- React Native
- TypeScript
- React Native Paper (UI components)
- React Navigation
- Context API + useReducer (state management)

## License

MIT

