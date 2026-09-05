import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../store';
import { C, F, S } from '../theme';
import { Card, Empty, PageTitle, Pill, SectionLabel } from '../ui';
import { TIMELINES } from '../types';

export default function Browse() {
  const router = useRouter();
  const { profiles, requests, actor } = useApp();

  const [q, setQ] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [timeline, setTimeline] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () =>
      profiles.filter((p) => {
        if (p.role !== 'woman' || !p.waliId) return false;
        if (q && !`${p.location} ${p.career} ${p.education}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (minAge && p.age < Number(minAge)) return false;
        if (maxAge && p.age > Number(maxAge)) return false;
        if (timeline && p.timeline !== timeline) return false;
        return true;
      }),
    [profiles, q, minAge, maxAge, timeline],
  );

  const statusFor = (id: string) =>
    requests.find((r) => r.womanId === id && r.manId === actor.id)?.status;

  return (
    <>
      <PageTitle title="Find a spouse" subtitle="Every profile here has a wali attached." />

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={C.muted} />
        <TextInput
          style={styles.search}
          placeholder="Location, career or education"
          placeholderTextColor={C.faint}
          value={q}
          onChangeText={setQ}
        />
        <Pressable onPress={() => setOpen((v) => !v)} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={16} color={C.mint} />
        </Pressable>
      </View>

      {open && (
        <Card>
          <SectionLabel>Age</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]} placeholder="From" placeholderTextColor={C.faint}
              keyboardType="number-pad" value={minAge} onChangeText={setMinAge} />
            <TextInput
              style={[styles.input, { flex: 1 }]} placeholder="To" placeholderTextColor={C.faint}
              keyboardType="number-pad" value={maxAge} onChangeText={setMaxAge} />
          </View>
          <SectionLabel>Marriage timeline</SectionLabel>
          <View style={styles.chipRow}>
            {TIMELINES.map((t) => (
              <Pressable key={t} onPress={() => setTimeline(timeline === t ? null : t)}
                style={[styles.chip, timeline === t && styles.chipOn]}>
                <Text style={[styles.chipText, timeline === t && { color: '#052E16' }]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      <Text style={styles.count}>
        {results.length} {results.length === 1 ? 'profile' : 'profiles'}
      </Text>

      {results.length === 0 && <Empty text="No profiles match these filters." icon="search-outline" />}

      {results.map((p) => {
        const st = statusFor(p.id);
        return (
          <Card key={p.id} onPress={() => router.push(`/person/${p.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.age}>{p.age}</Text>
            </View>
            <Text style={styles.meta}>{p.location}</Text>
            <Text style={styles.meta}>{p.career} · {p.education}</Text>
            <View style={styles.pills}>
              <Pill label={p.timeline} icon="time-outline" />
              <Pill label="Wali attached" tone="gold" icon="shield-checkmark" />
              {st === 'pending_wali' && <Pill label="With her wali" tone="muted" />}
              {st === 'pending_woman' && <Pill label="Awaiting her" tone="muted" />}
              {st === 'accepted' && <Pill label="Accepted" />}
              {(st === 'declined_wali' || st === 'declined_woman') && (
                <Pill label="Declined" tone="muted" />
              )}
            </View>
          </Card>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardEdge,
    borderRadius: S.pill, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 14,
  },
  search: { flex: 1, color: C.cream, fontSize: 15, paddingVertical: 12 },
  filterBtn: { padding: 6 },
  input: {
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 15, color: C.cream, backgroundColor: 'rgba(0,0,0,0.2)',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: S.pill,
    borderWidth: 1, borderColor: C.cardEdge,
  },
  chipOn: { backgroundColor: C.mint, borderColor: C.mint },
  chipText: { fontSize: 13, color: C.soft },
  count: { color: C.muted, fontSize: 13, marginBottom: 12, marginLeft: 4 },
  name: { flex: 1, fontFamily: F.display, fontSize: 24, color: C.cream },
  age: { fontSize: 17, color: C.soft },
  meta: { fontSize: 14, color: C.muted, marginTop: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
});
