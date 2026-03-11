import { StatusBar } from 'expo-status-bar';

import { StreetGuesserScreen } from './src/screens/StreetGuesserScreen';
import { AppProviders } from './src/providers/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <StreetGuesserScreen />
    </AppProviders>
  );
}
