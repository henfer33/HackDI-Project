import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store';
import { C, F } from '../theme';
import { Avatar, Button, Card, Empty, Field, PageTitle, Pill, SectionLabel } from '../ui';
import { GateTrail } from './Gate';

export default function HerRequests() {
  const { actor, requests, profile, wali, womanDecide } = useApp();

  const me = profile(actor.id);
  const g = me?.waliId ? wali(me.waliId) : undefined;
  const mine = requests.filter((r) => r.womanId === actor.id);
  const waiting = mine.filter((r) => r.status === 'pending_woman');
  const held = mine.filter((r) => r.status === 'pending_wali');
  const past = mine.filter((r) => r.status === 'declined_woman' || r.status === 'declined_wali');

  return (
    <>
      <PageTitle title="Requests" subtitle="Only what your wali has passed on." />

      <Card tone="mint">
        <Pill label="Your decision" icon="heart-outline" />
        <Text style={styles.intro}>
          {g ? `${g.name} (${g.relationship.toLowerCase()})` : 'Your wali'} screens every request
          before you see it. What reaches this screen has passed him. The decision from here is
          yours alone.
        </Text>
      </Card>

      <SectionLabel>Awaiting you</SectionLabel>
      {waiting.length === 0 && <Empty text="Nothing to decide right now." icon="mail-outline" />}

      {waiting.map((r) => {
        const m = profile(r.manId);
        if (!m) return null;
        return (
          <Card key={r.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar name={m.name} photo={m.photo} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.sub}>{m.age} · {m.location}</Text>
              </View>
            </View>
            <View style={{ height: 14 }} />
            <Field label="Education" value={m.education} />
            <Field label="Career" value={m.career} />
            <Field label="Marriage timeline" value={m.timeline} />
            <Field label="About" value={m.about} />
            {!!r.note && <Field label="His note" value={`“${r.note}”`} />}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <Button title="Accept" icon="checkmark" onPress={() => womanDecide(r.id, true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Decline" tone="danger" icon="close" onPress={() => womanDecide(r.id, false)} />
              </View>
            </View>
          </Card>
        );
      })}

      {held.length > 0 && (
        <>
          <SectionLabel>Held by your wali</SectionLabel>
          <Card>
            <Text style={styles.muted}>
              {held.length} {held.length === 1 ? 'request is' : 'requests are'} with{' '}
              {g ? g.name : 'your wali'}. You will see them here if he approves.
            </Text>
          </Card>
        </>
      )}

      {past.length > 0 && (
        <>
          <SectionLabel>Closed</SectionLabel>
          {past.map((r) => (
            <Card key={r.id}>
              <Text style={[styles.name, { fontSize: 19, marginBottom: 14 }]}>
                {profile(r.manId)?.name}
              </Text>
              <GateTrail status={r.status} waliName={g?.name.split(' ')[0] ?? 'Wali'} herName="You" />
            </Card>
          ))}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: F.sans, fontSize: 14, color: C.cream, lineHeight: 21, marginTop: 12 },
  name: { fontFamily: F.display, fontSize: 24, color: C.cream },
  sub: { fontFamily: F.sans, fontSize: 14, color: C.muted, marginTop: 4 },
  muted: { fontFamily: F.sans, fontSize: 14, color: C.muted, lineHeight: 21 },
});
