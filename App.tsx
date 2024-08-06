import { NativeRouter } from 'react-router-native';
import Main from './src/views/Main';
import { CalendarProvider } from './src/context/CalendarProvider';
import { StatusBar } from 'react-native';
import theme from './src/theme';

export default function App() {
  return (
      <CalendarProvider>
        <NativeRouter>
          <StatusBar backgroundColor={theme.colors.verdeBase}/>
          <Main />
        </NativeRouter>
      </CalendarProvider>
  );
}

