import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../src/store';
import { C, S } from '../src/theme';
import { Button, Card, Pill } from '../src/ui';
import { Actor } from '../src/types';

/**
 * Demo home. Doubles as the role switcher so the whole flow can be shown
 * end to end on one device — man, woman and wali in turn.
 */
export default function Home() {
  const router = useRouter();
  const { actor, setActor, profiles, walis, requests, reset } = useApp();

  const man = profiles.find((p) => p.id === 'm1')!;
  const woman = profiles.find((p) => p.id === 'w1')!;
  const wali = walis.find((w) => w.id === 'g1')!;

  const options: { actor: Actor; label: string; sub: string }[] = [
    { actor: { role: 'man', id: man.id }, label: man.name, sub: 'Man · sends requests' },
    { actor: { role: 'woman', id: woman.id }, label: woman.name, sub: 'Woman · consents after her wali' },
    { actor: { role: 'wali', id: wali.id }, label: wali.name, sub: `Wali · ${wali.relationship} of ${woman.name.split(' ')[0]}` },
  ];

  const waliPending = requests.filter((r) => r.waliId === 'g1' && r.status === 'pending_wali').length;
  const womanPending = requests.filter((r) => r.womanId === 'w1' && r.status === 'pending_woman').length;

  const go = () => {
    if (actor.role === 'man') router.push('/browse');
    else if (actor.role === 'wali') router.push('/wali');
    else router.push('/requests');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.pad, paddingBottom: 40 }}>
      <Text style={styles.h1}>Khitbah</Text>
      <Text style={styles.tagline}>
        Marriage, with the wali in the room from the first message. Not as a setting you can switch off.
      </Text>

      <Card>
        <Text style={styles.sectionLabel}>Viewing as</Text>
        {options.map((o) => {
          const active = actor.id === o.actor.id;
          const badge =
            o.actor.role === 'wali' ? waliPending : o.actor.role === 'woman' ? womanPending : 0;
          return (
            <Pressable
              key={o.actor.id}
              onPress={() => setActor(o.actor)}
              style={[styles.roleRow, active && styles.roleRowActive]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleName, active && { color: C.green }]}>{o.label}</Text>
                <Text style={styles.roleSub}>{o.sub}</Text>
              </View>
              {badge > 0 && <Pill label={String(badge)} tone="gold" />}
              {active && <Text style={styles.check}>✓</Text>}
            </Pressable>
          );
        })}
      </Card>

      <Button title="Continue" onPress={go} />

      <View style={{ height: 22 }} />

      <Card>
        <Text style={styles.sectionLabel}>How a match happens</Text>
        {[
          'He sends a request. It never lands in her inbox first.',
          'Her wali reviews it and approves or declines.',
          'She then accepts or declines for herself. Her consent is required.',
          'A group chat opens: him, her, and the wali reading every message.',
          'When both are ready to meet, the app steps back and hands over to the wali.',
        ].map((t, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{t}</Text>
          </View>
        ))}
      </Card>

      <Pressable onPress={reset} style={{ paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: C.muted, fontSize: 13 }}>Reset demo data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  h1: { fontSize: 32, fontWeight: '700', color: C.green, marginBottom: 6 },
  tagline: { fontSize: 15, color: C.muted, lineHeight: 22, marginBottom: 22 },
  sectionLabel: {
    fontSize: 12, color: C.muted, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 12, fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 11,
    borderWidth: 1, borderColor: 'transparent',
  },
  roleRowActive: { backgroundColor: C.greenSoft, borderColor: C.green },
  roleName: { fontSize: 16, fontWeight: '600', color: C.ink },
  roleSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  check: { color: C.green, fontSize: 17, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: 11, marginBottom: 12, alignItems: 'flex-start' },
  stepNum: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.greenSoft,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepNumText: { color: C.green, fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: C.ink, lineHeight: 20 },
});
