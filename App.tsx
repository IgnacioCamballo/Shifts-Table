import 'react-native-gesture-handler';
import 'react-native-reanimated';
import "intl";
import "intl/locale-data/jsonp/en";
import "intl/locale-data/jsonp/es";
import React from 'react';
import { StatusBar } from 'react-native';
import { NativeRouter } from 'react-router-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CalendarProvider } from './src/context/CalendarProvider';
import useCalendar from './src/hooks/useCalendar';
import Main from './src/pages/Main';

const queryClient = new QueryClient()

//function created to be able to use context variable
function InsideApp() {
  const { configInfo } = useCalendar()
  return (
    <>
      <StatusBar backgroundColor={configInfo.baseColor} />
      <Main />
    </>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <NativeRouter>
            <CalendarProvider>
              <InsideApp />
            </CalendarProvider>
          </NativeRouter>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

