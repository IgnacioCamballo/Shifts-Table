import { NativeRouter } from 'react-router-native';
import Main from './src/views/Main';
import { CalendarProvider } from './src/context/CalendarProvider';
import { StrictMode } from 'react';

export default function App() {
  return (
    <StrictMode>
      <CalendarProvider>
        <NativeRouter>
          <Main />
        </NativeRouter>
      </CalendarProvider>
    </StrictMode>
  );
}

