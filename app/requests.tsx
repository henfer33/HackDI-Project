import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../src/store';
import { C, S } from '../src/theme';
import { Button, Card, Empty, Field, Pill } from '../src/ui';

export default function WomanRequests() {
  const router = useRouter();
  const { actor, requests, profile, wali, womanDecide } = useApp();

  const mine = requests.filter((r) => r.womanId === actor.id);
  const waiting = mine.filter((r) => r.status === 'pending_woman');
  const open = mine.filter((r) => r.status === 'accepted');
  const held = mine.filter((r) => r.status === 'pending_wali');

  const me = profile(actor.id);
  const g = me?.waliId ? wali(me.waliId) : undefined;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.pad, paddingBottom: 40 }}>
      <Card style={{ backgroundColor: C.greenSoft, borderColor: C.green }}>
        <Text style={styles.intro}>
          {g ? `${g.name} (${g.relationship.toLowerCase()})` : 'Your wali'} reviews requests before you see
          them. What reaches this screen has passed him — the decision from here is yours alone.
        </Text>
      </Card>

      <Text style={styles.h2}>Your decision</Text>
      {waiting.length === 0 && <Empty text="Nothing to decide right now." />}

      {waiting.map((r) => {
        const m = profile(r.manId);
        if (!m) return null;
        return (
          <Card key={r.id}>
            <Text style={styles.name}>{m.name}</Text>
            <Text style={styles.sub}>
              {m.age} · {m.location}
            </Text>
            <View style={{ height: 14 }} />
            <Field label="Education" value={m.education} />
            <Field label="Career" value={m.career} />
            <Field label="Marriage timeline" value={m.timeline} />
            <Field label="About" value={m.about} />
            {!!r.note && <Field label="His note" value={`"${r.note}"`} />}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Button title="Accept" onPress={() => womanDecide(r.id, true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Decline" tone="danger" onPress={() => womanDecide(r.id, false)} />
              </View>
            </View>
          </Card>
        );
      })}

      {held.length > 0 && (
        <>
          <Text style={styles.h2}>Held by your wali</Text>
          <Card>
            <Text style={styles.muted}>
              {held.length} {held.length === 1 ? 'request is' : 'requests are'} with{' '}
              {g ? g.name : 'your wali'}. You will see them here if he approves.
            </Text>
          </Card>
        </>
      )}

      {open.length > 0 && (
        <>
          <Text style={styles.h2}>Open conversations</Text>
          {open.map((r) => {
            const m = profile(r.manId);
            return (
              <Card key={r.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={[styles.name, { fontSize: 17, flex: 1 }]}>{m?.name}</Text>
                  <Pill label="Wali present" tone="gold" />
                </View>
                <Button title="Open conversation" onPress={() => router.push(`/chat/${r.id}`)} />
              </Card>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  intro: { fontSize: 14, color: C.ink, lineHeight: 21 },
  h2: { fontSize: 13, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600', marginTop: 10, marginBottom: 12 },
  name: { fontSize: 19, fontWeight: '600', color: C.ink },
  sub: { fontSize: 14, color: C.muted, marginTop: 3 },
  muted: { fontSize: 14, color: C.muted, lineHeight: 20 },
});
