import 'react-native-gesture-handler';
import 'react-native-reanimated';
import "intl";
import "intl/locale-data/jsonp/en";
import "intl/locale-data/jsonp/es";
import React from 'react';
import { StatusBar } from 'react-native';
import { NativeRouter, useLocation } from 'react-router-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CalendarProvider } from './src/context/CalendarProvider';
import Main from './src/pages/Main';

const queryClient = new QueryClient()

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <NativeRouter>
            <CalendarProvider>
              <Main />
            </CalendarProvider>
          </NativeRouter>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

