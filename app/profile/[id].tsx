import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../../src/store';
import { C, S } from '../../src/theme';
import { Button, Card, Field, Pill } from '../../src/ui';

export default function ProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, wali, requests, actor, sendRequest } = useApp();

  const p = profile(String(id));
  const [note, setNote] = useState('');

  if (!p) return <Text style={{ padding: 20 }}>Profile not found.</Text>;

  const g = p.waliId ? wali(p.waliId) : undefined;
  const existing = requests.find((r) => r.womanId === p.id && r.manId === actor.id);

  const submit = () => {
    sendRequest(actor.id, p.id, note.trim());
    router.replace('/browse');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.pad, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.sub}>
          {p.age} · {p.location}
        </Text>
        <View style={{ height: 14 }} />
        <Field label="Education" value={p.education} />
        <Field label="Career" value={p.career} />
        <Field label="Marriage timeline" value={p.timeline} />
        <Field label="About" value={p.about} />
      </Card>

      {g && (
        <Card style={{ backgroundColor: C.goldSoft, borderColor: C.gold }}>
          <Pill label="Wali" tone="gold" />
          <Text style={styles.waliName}>{g.name}</Text>
          <Text style={styles.waliRel}>
            {g.relationship} · reviews every request before {p.name.split(' ')[0]} sees it
          </Text>
        </Card>
      )}

      {!existing && (
        <Card>
          <Text style={styles.label}>Send a request</Text>
          <Text style={styles.help}>
            This goes to {g ? g.name : 'her wali'} first. {p.name.split(' ')[0]} will not see it unless he
            approves — and she then decides for herself.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="A short, respectful note (optional)"
            placeholderTextColor={C.muted}
            value={note}
            onChangeText={setNote}
            multiline
          />
          <Button title="Send to wali" onPress={submit} />
        </Card>
      )}

      {existing && (
        <Card>
          <Text style={styles.label}>Request status</Text>
          <Text style={styles.status}>
            {existing.status === 'pending_wali' && 'Waiting on her wali to review.'}
            {existing.status === 'pending_woman' && 'Her wali approved. Waiting on her decision.'}
            {existing.status === 'accepted' && 'Accepted. The group chat is open.'}
            {existing.status === 'declined_wali' && 'Her wali declined this request.'}
            {existing.status === 'declined_woman' && 'She declined this request.'}
          </Text>
          {existing.status === 'accepted' && (
            <>
              <View style={{ height: 12 }} />
              <Button title="Open conversation" onPress={() => router.push(`/chat/${existing.id}`)} />
            </>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  name: { fontSize: 24, fontWeight: '700', color: C.ink },
  sub: { fontSize: 15, color: C.muted, marginTop: 4 },
  label: {
    fontSize: 12, color: C.muted, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 8, fontWeight: '600',
  },
  help: { fontSize: 14, color: C.muted, lineHeight: 20, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 13,
    fontSize: 15, color: C.ink, minHeight: 84, textAlignVertical: 'top',
    marginBottom: 14, backgroundColor: '#fff',
  },
  waliName: { fontSize: 17, fontWeight: '600', color: C.ink, marginTop: 10 },
  waliRel: { fontSize: 14, color: C.gold, marginTop: 3, lineHeight: 20 },
  status: { fontSize: 15, color: C.ink, lineHeight: 21 },
});
