import React from 'react';
import { NativeRouter } from 'react-router-native';
import Main from './src/pages/Main';
import { CalendarProvider } from './src/context/CalendarProvider';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useCalendar from './src/hooks/useCalendar';

//function created to be able to use context variable
function InsideApp() {
  const { configInfo } = useCalendar()
  return (
    <NativeRouter>
      <StatusBar backgroundColor={configInfo.baseColor} />
      <Main />
    </NativeRouter>
  )
}

export default function App() {
  return (

    <GestureHandlerRootView>
      <CalendarProvider>
        <InsideApp />
      </CalendarProvider>
    </GestureHandlerRootView>
  );
}

