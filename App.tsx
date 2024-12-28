import React from 'react';
import { NativeRouter } from 'react-router-native';
import Main from './src/pages/Main';
import { CalendarProvider } from './src/context/CalendarProvider';
import { StatusBar } from 'react-native';
import theme from './src/theme/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView>
      <CalendarProvider>
        <NativeRouter>
          <StatusBar backgroundColor={theme.colors.verdeBase}/>
          <Main />
        </NativeRouter>
      </CalendarProvider>
    </GestureHandlerRootView>
  );
}

