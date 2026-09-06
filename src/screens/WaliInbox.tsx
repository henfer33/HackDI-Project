import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store';
import { C, F } from '../theme';
import { Avatar, Button, Card, Empty, Field, PageTitle, Pill, SectionLabel } from '../ui';
import { GateTrail } from './Gate';

export default function WaliInbox() {
  const router = useRouter();
  const { actor, requests, profile, wali, waliDecide } = useApp();

  const me = wali(actor.id);
  const ward = me ? profile(me.wardId) : undefined;
  const mine = requests.filter((r) => r.waliId === actor.id);
  const pending = mine.filter((r) => r.status === 'pending_wali');
  const decided = mine.filter((r) => r.status !== 'pending_wali');

  return (
    <>
      <PageTitle
        title="Review"
        subtitle={ward ? `Requests for ${ward.name} reach you first.` : undefined}
      />

      <Card tone="gold">
        <Pill label="You are the wali" tone="gold" icon="shield-checkmark" />
        <Text style={styles.intro}>
          Approving passes the request on for {ward?.name.split(' ')[0] ?? 'her'} to decide. It does
          not decide for her.
        </Text>
        <View style={styles.stats}>
          <Stat n={pending.length} label="Waiting" />
          <Stat n={mine.filter((r) => r.status === 'accepted').length} label="Chats open" />
          <Stat n={mine.filter((r) => r.status === 'declined_wali').length} label="Declined" />
        </View>
      </Card>

      <SectionLabel>Awaiting your review</SectionLabel>
      {pending.length === 0 && <Empty text="Nothing waiting. New requests arrive here first." icon="shield-outline" />}

      {pending.map((r) => {
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
                <Button title="Approve" icon="checkmark" onPress={() => waliDecide(r.id, true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Decline" tone="danger" icon="close" onPress={() => waliDecide(r.id, false)} />
              </View>
            </View>
          </Card>
        );
      })}

      {decided.length > 0 && (
        <>
          <SectionLabel>Already handled</SectionLabel>
          {decided.map((r) => {
            const m = profile(r.manId);
            return (
              <Card key={r.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={[styles.name, { fontSize: 19, flex: 1 }]}>{m?.name}</Text>
                </View>
                <GateTrail
                  status={r.status}
                  waliName="You"
                  herName={ward?.name.split(' ')[0] ?? 'She'}
                />
                {r.status === 'accepted' && (
                  <>
                    <View style={{ height: 14 }} />
                    <Button title="Read the conversation" tone="ghost" icon="eye-outline"
                      onPress={() => router.push(`/chat/${r.id}`)} />
                  </>
                )}
              </Card>
            );
          })}
        </>
      )}
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: F.sans, fontSize: 14, color: C.cream, lineHeight: 21, marginTop: 12 },
  stats: { flexDirection: 'row', marginTop: 18, gap: 8 },
  statN: { fontFamily: F.display, fontSize: 28, color: C.gold },
  statL: { fontFamily: F.sans, fontSize: 11, color: C.muted, marginTop: 2 },
  name: { fontFamily: F.display, fontSize: 24, color: C.cream },
  sub: { fontFamily: F.sans, fontSize: 14, color: C.muted, marginTop: 4 },
});
