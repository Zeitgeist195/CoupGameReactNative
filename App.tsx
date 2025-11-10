import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import './src/i18n'; // Initialize i18n
import { GameProvider } from './src/context/GameContext';
import GameSetupScreen from './src/screens/GameSetupScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <GameProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Setup"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Setup" component={GameSetupScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="GameOver" component={GameOverScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </PaperProvider>
  );
}

