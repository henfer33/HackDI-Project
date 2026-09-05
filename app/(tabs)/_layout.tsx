import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useApp } from '../../src/store';
import { C, F } from '../../src/theme';

export default function TabsLayout() {
  const { actor, inboxFor, threadsFor } = useApp();
  const inbox = inboxFor(actor).length;
  const threads = threadsFor(actor).length;

  const homeLabel =
    actor.role === 'man' ? 'Find' : actor.role === 'woman' ? 'Requests' : 'Review';
  const homeIcon =
    actor.role === 'man' ? 'search' : actor.role === 'woman' ? 'mail' : 'shield-checkmark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.mint,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.bgTop,
          borderTopColor: C.cardEdge,
          borderTopWidth: 1,
          height: 86,
          paddingTop: 9,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: F.semi, marginTop: 2 },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          // Count lives in the label — a floating badge needs a circle to read
          // as a badge, and there are no circles left in the app.
          title: inbox ? `${homeLabel} (${inbox})` : homeLabel,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={homeIcon as any} size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: threads ? `Messages (${threads})` : 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
