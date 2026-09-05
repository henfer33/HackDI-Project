import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../src/store';
import { C, S } from '../src/theme';
import { Button, Card } from '../src/ui';
import { TIMELINES, Timeline } from '../src/types';

export default function Onboarding() {
  const router = useRouter();
  const { addProfile, addWali, setActor } = useApp();

  const [role, setRole] = useState<'man' | 'woman'>('woman');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [career, setCareer] = useState('');
  const [timeline, setTimeline] = useState<Timeline>(TIMELINES[0]);
  const [about, setAbout] = useState('');

  const [waliName, setWaliName] = useState('');
  const [waliRel, setWaliRel] = useState('Father');
  const [waliContact, setWaliContact] = useState('');

  const coreDone = name && age && location && education && career;
  const waliDone = role === 'man' || (waliName && waliContact);
  const canSubmit = Boolean(coreDone && waliDone);

  const submit = () => {
    const id = addProfile({
      role, name, age: Number(age), location, education, career, timeline,
      about: about || 'No description yet.',
    });
    if (role === 'woman') {
      addWali({ name: waliName, relationship: waliRel, contact: waliContact, wardId: id });
    }
    setActor({ role, id });
    router.replace(role === 'man' ? '/browse' : '/requests');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.pad, paddingBottom: 40 }}>
      <Card>
        <Text style={styles.label}>I am a</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['man', 'woman'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleBtn, role === r && styles.roleBtnOn]}>
              <Text style={[styles.roleBtnText, role === r && { color: '#fff' }]}>
                {r === 'man' ? 'Man' : 'Woman'}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>About you</Text>
        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={C.muted} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Age" placeholderTextColor={C.muted} keyboardType="number-pad" value={age} onChangeText={setAge} />
        <TextInput style={styles.input} placeholder="Location" placeholderTextColor={C.muted} value={location} onChangeText={setLocation} />
        <TextInput style={styles.input} placeholder="Education" placeholderTextColor={C.muted} value={education} onChangeText={setEducation} />
        <TextInput style={styles.input} placeholder="Career" placeholderTextColor={C.muted} value={career} onChangeText={setCareer} />
        <TextInput
          style={[styles.input, { minHeight: 78, textAlignVertical: 'top' }]}
          placeholder="A few words about what you are looking for"
          placeholderTextColor={C.muted}
          value={about}
          onChangeText={setAbout}
          multiline
        />
        <Text style={[styles.label, { marginTop: 4 }]}>Marriage timeline</Text>
        <View style={styles.chipRow}>
          {TIMELINES.map((t) => (
            <Pressable key={t} onPress={() => setTimeline(t)} style={[styles.chip, timeline === t && styles.chipOn]}>
              <Text style={[styles.chipText, timeline === t && { color: '#fff' }]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {role === 'woman' && (
        <Card style={{ backgroundColor: C.goldSoft, borderColor: C.gold }}>
          <Text style={[styles.label, { color: C.gold }]}>Your wali</Text>
          <Text style={styles.help}>
            Required. Your profile is not visible to anyone until a wali is attached — this is not a
            setting that can be turned off.
          </Text>
          <TextInput style={styles.input} placeholder="Wali's full name" placeholderTextColor={C.muted} value={waliName} onChangeText={setWaliName} />
          <View style={styles.chipRow}>
            {['Father', 'Brother', 'Uncle', 'Grandfather'].map((rel) => (
              <Pressable key={rel} onPress={() => setWaliRel(rel)} style={[styles.chip, waliRel === rel && styles.chipOn]}>
                <Text style={[styles.chipText, waliRel === rel && { color: '#fff' }]}>{rel}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: 12 }} />
          <TextInput style={styles.input} placeholder="His phone or email" placeholderTextColor={C.muted} value={waliContact} onChangeText={setWaliContact} autoCapitalize="none" />
        </Card>
      )}

      <Button title="Create profile" onPress={submit} disabled={!canSubmit} />
      {!canSubmit && (
        <Text style={styles.blocked}>
          {role === 'woman' && coreDone && !waliDone
            ? 'Add your wali to activate your profile.'
            : 'Fill in the fields above to continue.'}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  label: { fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, fontWeight: '600' },
  help: { fontSize: 13, color: C.ink, lineHeight: 19, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 13,
    paddingVertical: 11, fontSize: 15, color: C.ink, marginBottom: 10, backgroundColor: '#fff',
  },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', backgroundColor: '#fff' },
  roleBtnOn: { backgroundColor: C.green, borderColor: C.green },
  roleBtnText: { fontSize: 15, fontWeight: '600', color: C.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontSize: 13, color: C.ink },
  blocked: { textAlign: 'center', color: C.muted, fontSize: 13, marginTop: 12 },
});
