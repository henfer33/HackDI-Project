import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../src/store';
import { C, S } from '../src/theme';
import { Card, Empty, Pill } from '../src/ui';
import { TIMELINES } from '../src/types';

export default function Browse() {
  const router = useRouter();
  const { profiles, requests, actor } = useApp();

  const [location, setLocation] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [timeline, setTimeline] = useState<string | null>(null);

  const results = useMemo(() => {
    return profiles.filter((p) => {
      if (p.role !== 'woman') return false;
      if (!p.waliId) return false; // no wali attached => not visible
      if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (minAge && p.age < Number(minAge)) return false;
      if (maxAge && p.age > Number(maxAge)) return false;
      if (timeline && p.timeline !== timeline) return false;
      return true;
    });
  }, [profiles, location, minAge, maxAge, timeline]);

  const statusFor = (womanId: string) =>
    requests.find((r) => r.womanId === womanId && r.manId === actor.id)?.status;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.pad, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.label}>Filters</Text>
        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor={C.muted}
          value={location}
          onChangeText={setLocation}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Min age"
            placeholderTextColor={C.muted}
            keyboardType="number-pad"
            value={minAge}
            onChangeText={setMinAge}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Max age"
            placeholderTextColor={C.muted}
            keyboardType="number-pad"
            value={maxAge}
            onChangeText={setMaxAge}
          />
        </View>
        <Text style={[styles.label, { marginTop: 6 }]}>Marriage timeline</Text>
        <View style={styles.chipRow}>
          {TIMELINES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTimeline(timeline === t ? null : t)}
              style={[styles.chip, timeline === t && styles.chipOn]}>
              <Text style={[styles.chipText, timeline === t && { color: '#fff' }]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Text style={styles.count}>
        {results.length} {results.length === 1 ? 'profile' : 'profiles'}
      </Text>

      {results.length === 0 && <Empty text="No profiles match these filters." />}

      {results.map((p) => {
        const st = statusFor(p.id);
        return (
          <Pressable key={p.id} onPress={() => router.push(`/profile/${p.id}`)}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.age}>{p.age}</Text>
              </View>
              <Text style={styles.meta}>{p.location}</Text>
              <Text style={styles.meta}>
                {p.career} · {p.education}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Pill label={p.timeline} />
                <Pill label="Wali attached" tone="gold" />
                {st === 'pending_wali' && <Pill label="With her wali" tone="muted" />}
                {st === 'pending_woman' && <Pill label="Awaiting her" tone="muted" />}
                {st === 'accepted' && <Pill label="Accepted" />}
                {(st === 'declined_wali' || st === 'declined_woman') && (
                  <Pill label="Declined" tone="muted" />
                )}
              </View>
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  label: {
    fontSize: 12, color: C.muted, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 10, fontWeight: '600',
  },
  input: {
    borderWidth: 1, borderColor: C.line, borderRadius: 10,
    paddingHorizontal: 13, paddingVertical: 11, fontSize: 15,
    color: C.ink, marginBottom: 10, backgroundColor: '#fff',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
  },
  chipOn: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontSize: 13, color: C.ink },
  count: { fontSize: 13, color: C.muted, marginBottom: 12, marginLeft: 2 },
  name: { fontSize: 18, fontWeight: '600', color: C.ink, flex: 1 },
  age: { fontSize: 16, color: C.muted },
  meta: { fontSize: 14, color: C.muted, marginBottom: 3 },
});
