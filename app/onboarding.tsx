import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../src/store';
import { C, F, S } from '../src/theme';
import { Button, Card, PageTitle, Screen, SectionLabel } from '../src/ui';
import { TIMELINES, Timeline } from '../src/types';
import { contactKind } from '../src/notify';

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
  // A wali who cannot be reached is not attached in any useful sense.
  const contactOk = contactKind(waliContact) !== 'invalid';
  const waliDone = role === 'man' || (!!waliName && contactOk);
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
    router.replace('/home');
  };

  return (
    <Screen edges={[]}>
      <PageTitle title="Create profile" subtitle="Four fields, and a wali if you are a woman." />
      <Card>
        <SectionLabel>I am a</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['man', 'woman'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleBtn, role === r && styles.roleBtnOn]}>
              <Text style={[styles.roleBtnText, role === r && { color: '#14301F' }]}>
                {r === 'man' ? 'Man' : 'Woman'}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>About you</SectionLabel>
        <TextInput
          style={styles.input} placeholder="Full name" placeholderTextColor={C.faint}
          value={name} onChangeText={setName}
          autoCapitalize="words" autoCorrect={false} returnKeyType="next" />
        <TextInput
          style={styles.input} placeholder="Age" placeholderTextColor={C.faint}
          keyboardType="number-pad" value={age}
          // A number pad has no return key, so strip anything non-numeric as it
          // is typed rather than trusting the keyboard.
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 2))} />
        <TextInput
          style={styles.input} placeholder="Location" placeholderTextColor={C.faint}
          value={location} onChangeText={setLocation}
          autoCapitalize="words" returnKeyType="next" />
        <TextInput
          style={styles.input} placeholder="Education" placeholderTextColor={C.faint}
          value={education} onChangeText={setEducation}
          autoCapitalize="words" returnKeyType="next" />
        <TextInput
          style={styles.input} placeholder="Career" placeholderTextColor={C.faint}
          value={career} onChangeText={setCareer}
          autoCapitalize="words" returnKeyType="next" />
        <TextInput
          style={[styles.input, { minHeight: 78, textAlignVertical: 'top' }]}
          placeholder="A few words about what you are looking for"
          placeholderTextColor={C.faint}
          value={about}
          onChangeText={setAbout}
          multiline
          maxLength={280}
        />
        <SectionLabel>Marriage timeline</SectionLabel>
        <View style={styles.chipRow}>
          {TIMELINES.map((t) => (
            <Pressable key={t} onPress={() => setTimeline(t)} style={[styles.chip, timeline === t && styles.chipOn]}>
              <Text style={[styles.chipText, timeline === t && { color: '#14301F' }]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {role === 'woman' && (
        <Card tone="gold">
          <SectionLabel>Your wali</SectionLabel>
          <Text style={styles.help}>
            Required. Your profile is not visible to anyone until a wali is attached. This is not a
            setting that can be turned off.
          </Text>
          <TextInput
            style={styles.input} placeholder="Wali's full name" placeholderTextColor={C.faint}
            value={waliName} onChangeText={setWaliName}
            autoCapitalize="words" autoCorrect={false} returnKeyType="next" />
          <View style={styles.chipRow}>
            {['Father', 'Brother', 'Uncle', 'Grandfather'].map((rel) => (
              <Pressable key={rel} onPress={() => setWaliRel(rel)} style={[styles.chip, waliRel === rel && styles.chipOn]}>
                <Text style={[styles.chipText, waliRel === rel && { color: '#14301F' }]}>{rel}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: 12 }} />
          <TextInput
            style={styles.input} placeholder="His phone or email" placeholderTextColor={C.faint}
            value={waliContact} onChangeText={setWaliContact}
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            returnKeyType="done" />
        </Card>
      )}

      <Button title="Create profile" onPress={submit} disabled={!canSubmit} />
      {!canSubmit && (
        <Text style={styles.blocked}>
          {role === 'woman' && coreDone && waliName && !contactOk
            ? 'That does not look like a phone number or an email address.'
            : role === 'woman' && coreDone && !waliDone
              ? 'Add your wali to activate your profile.'
              : 'Fill in the fields above to continue.'}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { fontFamily: F.sans, fontSize: 13, color: C.cream, lineHeight: 20, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 16, paddingHorizontal: 15,
    paddingVertical: 13, fontFamily: F.sans, fontSize: 15, color: C.cream, marginBottom: 11,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  roleBtn: {
    flex: 1, paddingVertical: 14, borderRadius: S.pill, borderWidth: 1,
    borderColor: C.cardEdge, alignItems: 'center',
  },
  roleBtnOn: { backgroundColor: C.mint, borderColor: C.mint },
  roleBtnText: { fontFamily: F.bold, fontSize: 15, color: C.soft },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 15, paddingVertical: 11, borderRadius: S.pill,
    borderWidth: 1, borderColor: C.cardEdge,
  },
  chipOn: { backgroundColor: C.mint, borderColor: C.mint },
  chipText: { fontFamily: F.sans, fontSize: 13, color: C.soft },
  blocked: { textAlign: 'center', color: C.muted, fontFamily: F.sans, fontSize: 13, marginTop: 14 },
});
