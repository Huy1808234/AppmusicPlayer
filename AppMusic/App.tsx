import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AuthStack from './src/navigation/AuthStack';
import { CurrentTrackProvider } from './src/context/CurrentTrackContext';
import { ThemeProvider } from './src/context/ThemeProvider'; 

enableScreens();

export default function App() {
  return (
    <ThemeProvider> 
      <CurrentTrackProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AuthStack />
          </NavigationContainer>
        </SafeAreaProvider>
      </CurrentTrackProvider>
    </ThemeProvider>
  );
}
