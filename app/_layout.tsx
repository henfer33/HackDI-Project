import {
  IBMPlexSans_400Regular, IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold, IBMPlexSans_700Bold, useFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexSerif_600SemiBold, IBMPlexSerif_700Bold,
} from '@expo-google-fonts/ibm-plex-serif';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AppProvider } from '../src/store';
import { C } from '../src/theme';

export default function RootLayout() {
  const [ready] = useFonts({
    IBMPlexSans_400Regular, IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold, IBMPlexSans_700Bold,
    IBMPlexSerif_600SemiBold, IBMPlexSerif_700Bold,
  });
  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bgTop },
          headerTitleStyle: { color: C.cream, fontSize: 17 },
          headerTintColor: C.mint,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="person/[id]" options={{ title: '' }} />
        <Stack.Screen name="chat/[id]" options={{ title: '' }} />
        <Stack.Screen name="onboarding" options={{ title: 'Create profile' }} />
      </Stack>
    </AppProvider>
  );
}
