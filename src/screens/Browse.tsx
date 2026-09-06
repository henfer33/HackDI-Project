import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../store';
import { C, F, S } from '../theme';
import { Avatar, Card, Empty, Loading, PageTitle, Pill, SectionLabel } from '../ui';
import { TIMELINES } from '../types';

export default function Browse() {
  const router = useRouter();
  const { profiles, requests, actor, loading } = useApp();

  const [q, setQ] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [timeline, setTimeline] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Cities actually present in the data, so the chips can never offer an empty
  // result. Sorted for a stable order between renders.
  const cities = useMemo(
    () => Array.from(new Set(profiles.filter((p) => p.role === 'woman').map((p) => p.location))).sort(),
    [profiles],
  );

  const activeCount = [minAge, maxAge, timeline, city].filter(Boolean).length;
  const clearAll = () => {
    setMinAge(''); setMaxAge(''); setTimeline(null); setCity(null);
  };

  const results = useMemo(
    () =>
      profiles.filter((p) => {
        if (p.role !== 'woman' || !p.waliId) return false;
        if (q && !`${p.name} ${p.location} ${p.career} ${p.education}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (city && p.location !== city) return false;
        if (minAge && p.age < Number(minAge)) return false;
        if (maxAge && p.age > Number(maxAge)) return false;
        if (timeline && p.timeline !== timeline) return false;
        return true;
      }),
    [profiles, q, city, minAge, maxAge, timeline],
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
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Pressable onPress={() => setOpen((v) => !v)} style={styles.filterBtn} hitSlop={8}>
          <Ionicons name="options-outline" size={18} color={activeCount ? C.gold : C.mint} />
          {activeCount > 0 && <Text style={styles.filterCount}>{activeCount}</Text>}
        </Pressable>
      </View>

      {open && (
        <Card>
          <SectionLabel>Age</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]} placeholder="From" placeholderTextColor={C.faint}
              keyboardType="number-pad" value={minAge}
              onChangeText={(t) => setMinAge(t.replace(/[^0-9]/g, '').slice(0, 2))} />
            <TextInput
              style={[styles.input, { flex: 1 }]} placeholder="To" placeholderTextColor={C.faint}
              keyboardType="number-pad" value={maxAge}
              onChangeText={(t) => setMaxAge(t.replace(/[^0-9]/g, '').slice(0, 2))} />
          </View>
          <SectionLabel>Marriage timeline</SectionLabel>
          <View style={styles.chipRow}>
            {TIMELINES.map((t) => (
              <Pressable key={t} onPress={() => setTimeline(timeline === t ? null : t)}
                style={[styles.chip, timeline === t && styles.chipOn]}>
                <Text style={[styles.chipText, timeline === t && { color: '#14301F' }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 18 }} />
          <SectionLabel>City</SectionLabel>
          <View style={styles.chipRow}>
            {cities.map((c) => (
              <Pressable key={c} onPress={() => setCity(city === c ? null : c)}
                style={[styles.chip, city === c && styles.chipOn]}>
                <Text style={[styles.chipText, city === c && { color: '#14301F' }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          {activeCount > 0 && (
            <>
              <View style={{ height: 18 }} />
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text style={styles.clear}>Clear filters</Text>
              </Pressable>
            </>
          )}
        </Card>
      )}

      {!loading && (
        <Text style={styles.count}>
          {results.length} {results.length === 1 ? 'profile' : 'profiles'}
        </Text>
      )}

      {loading && <Loading text="Loading profiles" />}
      {!loading && results.length === 0 && (
        <Empty text="No profiles match these filters." icon="search-outline" />
      )}

      {results.map((p) => {
        const st = statusFor(p.id);
        return (
          <Card key={p.id} onPress={() => router.push(`/person/${p.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={p.name} photo={p.photo} size={44} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.age}>{p.age}</Text>
                </View>
                <Text style={styles.meta}>{p.location}</Text>
              </View>
            </View>
            <Text style={[styles.meta, { marginTop: 10 }]}>{p.career} · {p.education}</Text>
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
    backgroundColor: 'transparent', borderWidth: 1, borderColor: C.cardEdge,
    borderRadius: S.pill, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 14,
  },
  search: { flex: 1, color: C.cream, fontFamily: F.sans, fontSize: 15, paddingVertical: 12 },
  filterBtn: { padding: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterCount: { fontFamily: F.bold, fontSize: 12, color: C.gold },
  clear: { fontFamily: F.semi, fontSize: 13.5, color: C.mint, textAlign: 'center', paddingVertical: 6 },
  input: {
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 11, fontFamily: F.sans, fontSize: 15, color: C.cream, backgroundColor: 'rgba(0,0,0,0.2)',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 15, paddingVertical: 11, borderRadius: S.pill,
    borderWidth: 1, borderColor: C.cardEdge,
  },
  chipOn: { backgroundColor: C.mint, borderColor: C.mint },
  chipText: { fontFamily: F.sans, fontSize: 13, color: C.soft },
  count: { color: C.muted, fontFamily: F.sans, fontSize: 13, marginBottom: 12, marginLeft: 4 },
  name: { flex: 1, fontFamily: F.display, fontSize: 24, color: C.cream },
  age: { fontFamily: F.sans, fontSize: 17, color: C.soft },
  meta: { fontFamily: F.sans, fontSize: 14, color: C.muted, marginTop: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 8, marginTop: 14 },
});
