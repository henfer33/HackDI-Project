import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/store';
import { C } from '../src/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTitleStyle: { color: C.ink, fontSize: 17 },
          headerTintColor: C.green,
          contentStyle: { backgroundColor: C.bg },
        }}>
        <Stack.Screen name="index" options={{ title: 'Khitbah' }} />
        <Stack.Screen name="browse" options={{ title: 'Find a spouse' }} />
        <Stack.Screen name="profile/[id]" options={{ title: 'Profile' }} />
        <Stack.Screen name="wali" options={{ title: 'Wali requests' }} />
        <Stack.Screen name="requests" options={{ title: 'Your requests' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Conversation' }} />
        <Stack.Screen name="onboarding" options={{ title: 'Create profile' }} />
      </Stack>
    </AppProvider>
  );
}
