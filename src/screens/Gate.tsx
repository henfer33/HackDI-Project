import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { C, F } from '../theme';
import { RequestStatus } from '../types';

const ORDER: RequestStatus[] = ['pending_wali', 'pending_woman', 'accepted'];

/**
 * The two gates, drawn. Makes the differentiator legible at a glance:
 * a request must clear the wali AND her before a chat exists.
 */
export function GateTrail({ status, waliName, herName }: {
  status: RequestStatus;
  waliName: string;
  herName: string;
}) {
  const declinedAt =
    status === 'declined_wali' ? 0 : status === 'declined_woman' ? 1 : -1;
  const reached = ORDER.indexOf(status);

  const steps = [
    { label: `${waliName} reviews`, icon: 'shield-checkmark' as const },
    { label: `${herName} decides`, icon: 'heart-outline' as const },
    { label: 'Chat opens', icon: 'chatbubbles-outline' as const },
  ];

  return (
    <View style={styles.wrap}>
      {steps.map((s, i) => {
        const done = declinedAt === -1 && reached >= i;
        const failed = declinedAt === i;
        const active = declinedAt === -1 && reached === i - 1;
        const color = failed ? C.danger : done ? C.mint : active ? C.gold : C.faint;
        return (
          <View key={i} style={styles.step}>
            <View style={styles.dot}>
              <Ionicons name={failed ? 'close' : s.icon} size={16} color={color} />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={2}>{s.label}</Text>
            {i < steps.length - 1 && <View style={[styles.bar, { backgroundColor: done ? C.mint : C.faint }]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', marginTop: 4, marginBottom: 4 },
  step: { flex: 1, alignItems: 'center' },
  dot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  label: { fontFamily: F.sans, fontSize: 10.5, textAlign: 'center', lineHeight: 14, paddingHorizontal: 2 },
  bar: { position: 'absolute', height: 1.5, top: 13.5, left: '62%', right: '-38%' },
});
