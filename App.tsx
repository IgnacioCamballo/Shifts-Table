import React from 'react';
import { StatusBar } from 'react-native';
import { NativeRouter } from 'react-router-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CalendarProvider } from './src/context/CalendarProvider';
import useCalendar from './src/hooks/useCalendar';
import Main from './src/pages/Main';

const queryClient = new QueryClient()

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

    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <CalendarProvider>
          <InsideApp />
        </CalendarProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

