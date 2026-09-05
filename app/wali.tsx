import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../src/store';
import { C, S } from '../src/theme';
import { Button, Card, Empty, Field, Pill } from '../src/ui';

export default function WaliInbox() {
  const router = useRouter();
  const { actor, requests, profile, wali, waliDecide } = useApp();

  const me = wali(actor.id);
  const mine = requests.filter((r) => r.waliId === actor.id);
  const pending = mine.filter((r) => r.status === 'pending_wali');
  const decided = mine.filter((r) => r.status !== 'pending_wali');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.pad, paddingBottom: 40 }}>
      {me && (
        <Card style={{ backgroundColor: C.goldSoft, borderColor: C.gold }}>
          <Pill label="You are the wali" tone="gold" />
          <Text style={styles.intro}>
            Requests for {profile(me.wardId)?.name} reach you before they reach her. Approving passes the
            request on for her own decision — it does not decide on her behalf.
          </Text>
        </Card>
      )}

      <Text style={styles.h2}>Awaiting your review</Text>
      {pending.length === 0 && <Empty text="Nothing waiting. New requests will appear here first." />}

      {pending.map((r) => {
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
                <Button title="Approve" onPress={() => waliDecide(r.id, true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Decline" tone="danger" onPress={() => waliDecide(r.id, false)} />
              </View>
            </View>
          </Card>
        );
      })}

      {decided.length > 0 && (
        <>
          <Text style={styles.h2}>Already handled</Text>
          {decided.map((r) => {
            const m = profile(r.manId);
            return (
              <Card key={r.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.name, { fontSize: 16, flex: 1 }]}>{m?.name}</Text>
                  {r.status === 'declined_wali' && <Pill label="You declined" tone="muted" />}
                  {r.status === 'pending_woman' && <Pill label="With her now" tone="gold" />}
                  {r.status === 'declined_woman' && <Pill label="She declined" tone="muted" />}
                  {r.status === 'accepted' && <Pill label="Chat open" />}
                </View>
                {r.status === 'accepted' && (
                  <>
                    <View style={{ height: 12 }} />
                    <Button
                      title="Read the conversation"
                      tone="ghost"
                      onPress={() => router.push(`/chat/${r.id}`)}
                    />
                  </>
                )}
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
  intro: { fontSize: 14, color: C.ink, lineHeight: 21, marginTop: 10 },
  h2: { fontSize: 13, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600', marginTop: 10, marginBottom: 12 },
  name: { fontSize: 19, fontWeight: '600', color: C.ink },
  sub: { fontSize: 14, color: C.muted, marginTop: 3 },
});
