import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../../src/store';
import { C, F, S } from '../../src/theme';
import { Button, Card, Field, Pill, Screen, ScreenHeader, SectionLabel } from '../../src/ui';
import { GateTrail } from '../../src/screens/Gate';

export default function Person() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, wali, requests, actor, sendRequest, waliNotify } = useApp();

  const p = profile(String(id));
  const [note, setNote] = useState('');

  if (!p) return <Screen><Text style={{ color: C.cream }}>Profile not found.</Text></Screen>;

  const g = p.waliId ? wali(p.waliId) : undefined;
  const existing = requests.find((r) => r.womanId === p.id && r.manId === actor.id);
  const first = p.name.split(' ')[0];

  return (
    <Screen edges={[]}>
      <ScreenHeader
        eyebrow="Seeking marriage"
        icon="leaf"
        title={first}
        subtitle={`${p.age} · ${p.location}`}
      />

      <Card>
        <Field label="Education" value={p.education} />
        <Field label="Career" value={p.career} />
        <Field label="Marriage timeline" value={p.timeline} />
        <Field label="About" value={p.about} />
      </Card>

      {g && (
        <Card tone="gold">
          <Pill label="Wali" tone="gold" icon="shield-checkmark" />
          <Text style={styles.waliName}>{g.name}</Text>
          <Text style={styles.waliRel}>
            {g.relationship} · every request reaches him before {first} sees it
          </Text>
        </Card>
      )}

      {!existing && (
        <>
          <SectionLabel>Send a request</SectionLabel>
          <Card>
            <Text style={styles.help}>
              This goes to {g ? g.name : 'her wali'} by {waliNotify === 'app' ? 'in-app notice' : waliNotify}.
              {' '}{first} will not see it unless he approves — and she then decides for herself.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="A short, respectful note (optional)"
              placeholderTextColor={C.faint}
              value={note}
              onChangeText={setNote}
              multiline
            />
            <Button
              title="Send to wali"
              icon="paper-plane-outline"
              onPress={() => { sendRequest(actor.id, p.id, note.trim()); router.back(); }}
            />
          </Card>
        </>
      )}

      {existing && (
        <>
          <SectionLabel>Where this stands</SectionLabel>
          <Card>
            <GateTrail status={existing.status} waliName={g?.name.split(' ')[0] ?? 'Wali'} herName={first} />
            <Text style={styles.status}>
              {existing.status === 'pending_wali' && `Waiting on ${g?.name} to review.`}
              {existing.status === 'pending_woman' && `${g?.name} approved. Waiting on ${first}.`}
              {existing.status === 'accepted' && 'Accepted. The conversation is open.'}
              {existing.status === 'declined_wali' && `${g?.name} declined this request.`}
              {existing.status === 'declined_woman' && `${first} declined this request.`}
            </Text>
            {existing.status === 'accepted' && (
              <Button title="Open conversation" icon="chatbubbles-outline"
                onPress={() => router.push(`/chat/${existing.id}`)} />
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { fontFamily: F.sans, fontSize: 13.5, color: C.muted, lineHeight: 20, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 16, padding: 14,
    fontFamily: F.sans, fontSize: 15, color: C.cream, minHeight: 88, textAlignVertical: 'top',
    marginBottom: 16, backgroundColor: 'rgba(0,0,0,0.22)',
  },
  waliName: { fontFamily: F.display, fontSize: 23, color: C.cream, marginTop: 12 },
  waliRel: { fontFamily: F.sans, fontSize: 13.5, color: C.gold, marginTop: 4, lineHeight: 20 },
  status: { fontFamily: F.sans, fontSize: 15, color: C.cream, lineHeight: 22, marginTop: 18, marginBottom: 16 },
});
