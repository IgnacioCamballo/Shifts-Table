import { NativeRouter } from 'react-router-native';
import Main from './src/views/Main';
import { CalendarProvider } from './src/context/CalendarProvider';

export default function App() {
  return (
      <CalendarProvider>
        <NativeRouter>
          <Main />
        </NativeRouter>
      </CalendarProvider>
  );
}

