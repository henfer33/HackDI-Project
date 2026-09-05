import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../src/store';
import { contactKind } from '../src/notify';
import { C, F, S } from '../src/theme';
import { Button, Card, Empty, PageTitle, Screen, SectionLabel } from '../src/ui';
import { TIMELINES, Timeline } from '../src/types';

export default function EditProfile() {
  const router = useRouter();
  const { actor, profile, wali, updateProfile, updateWali } = useApp();

  const isWali = actor.role === 'wali';
  const me = isWali ? undefined : profile(actor.id);
  const myWali = me?.waliId ? wali(me.waliId) : undefined;
  const asWali = isWali ? wali(actor.id) : undefined;

  // Editing his own guardian record when viewing as the wali.
  const [gName, setGName] = useState(asWali?.name ?? myWali?.name ?? '');
  const [gRel, setGRel] = useState(asWali?.relationship ?? myWali?.relationship ?? 'Father');
  const [gContact, setGContact] = useState(asWali?.contact ?? myWali?.contact ?? '');

  const [name, setName] = useState(me?.name ?? '');
  const [age, setAge] = useState(String(me?.age ?? ''));
  const [location, setLocation] = useState(me?.location ?? '');
  const [education, setEducation] = useState(me?.education ?? '');
  const [career, setCareer] = useState(me?.career ?? '');
  const [timeline, setTimeline] = useState<Timeline>(me?.timeline ?? TIMELINES[0]);
  const [about, setAbout] = useState(me?.about ?? '');

  // The profile may not have arrived from the backend on first render, so the
  // initial useState values would be empty and never catch up. Hydrate once the
  // record appears, and again if the viewer switches role.
  const source = asWali ?? me;
  useEffect(() => {
    if (me) {
      setName(me.name);
      setAge(String(me.age));
      setLocation(me.location);
      setEducation(me.education);
      setCareer(me.career);
      setTimeline(me.timeline);
      setAbout(me.about);
    }
    const g = asWali ?? myWali;
    if (g) {
      setGName(g.name);
      setGRel(g.relationship);
      setGContact(g.contact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.id, me?.name, myWali?.id]);

  if (!me && !asWali) {
    return <Screen edges={[]}><Empty text="Nothing to edit for this role." icon="person-outline" /></Screen>;
  }

  const contactOk = contactKind(gContact) !== 'invalid';
  const coreOk = !!name.trim() && !!age && !!location.trim() && !!education.trim() && !!career.trim();
  const canSave = isWali ? !!gName.trim() && contactOk : coreOk && (!myWali || (!!gName.trim() && contactOk));

  const save = () => {
    if (isWali && asWali) {
      updateWali(asWali.id, { name: name || gName, relationship: gRel, contact: gContact.trim() });
    } else if (me) {
      updateProfile(me.id, {
        name: name.trim(), age: Number(age), location: location.trim(),
        education: education.trim(), career: career.trim(), timeline, about: about.trim(),
      });
      if (myWali) {
        updateWali(myWali.id, { name: gName.trim(), relationship: gRel, contact: gContact.trim() });
      }
    }
    if (router.canGoBack()) router.back();
    else router.replace('/me');
  };

  return (
    <Screen edges={[]}>
      <PageTitle
        title="Edit profile"
        subtitle={isWali ? 'Your details as a guardian.' : 'What others see, and how your wali is reached.'}
      />

      {isWali && asWali && (
        <Card>
          <SectionLabel>Your details</SectionLabel>
          <TextInput
            style={styles.input} placeholder="Full name" placeholderTextColor={C.faint}
            value={gName} onChangeText={setGName} autoCapitalize="words" autoCorrect={false} />
          <SectionLabel>Relationship</SectionLabel>
          <View style={styles.chipRow}>
            {['Father', 'Brother', 'Uncle', 'Grandfather'].map((r) => (
              <Pressable key={r} onPress={() => setGRel(r)} style={[styles.chip, gRel === r && styles.chipOn]}>
                <Text style={[styles.chipText, gRel === r && { color: '#14301F' }]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: 14 }} />
          <TextInput
            style={styles.input} placeholder="Your phone or email" placeholderTextColor={C.faint}
            value={gContact} onChangeText={setGContact}
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
        </Card>
      )}

      {me && (
        <>
          <Card>
            <SectionLabel>About you</SectionLabel>
            <TextInput
              style={styles.input} placeholder="Full name" placeholderTextColor={C.faint}
              value={name} onChangeText={setName} autoCapitalize="words" autoCorrect={false} />
            <TextInput
              style={styles.input} placeholder="Age" placeholderTextColor={C.faint}
              keyboardType="number-pad" value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 2))} />
            <TextInput
              style={styles.input} placeholder="Location" placeholderTextColor={C.faint}
              value={location} onChangeText={setLocation} autoCapitalize="words" />
            <TextInput
              style={styles.input} placeholder="Education" placeholderTextColor={C.faint}
              value={education} onChangeText={setEducation} autoCapitalize="words" />
            <TextInput
              style={styles.input} placeholder="Career" placeholderTextColor={C.faint}
              value={career} onChangeText={setCareer} autoCapitalize="words" />
            <TextInput
              style={[styles.input, { minHeight: 84, textAlignVertical: 'top' }]}
              placeholder="A few words about what you are looking for"
              placeholderTextColor={C.faint}
              value={about} onChangeText={setAbout} multiline maxLength={280} />
            <SectionLabel>Marriage timeline</SectionLabel>
            <View style={styles.chipRow}>
              {TIMELINES.map((t) => (
                <Pressable key={t} onPress={() => setTimeline(t)} style={[styles.chip, timeline === t && styles.chipOn]}>
                  <Text style={[styles.chipText, timeline === t && { color: '#14301F' }]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {myWali && (
            <Card tone="gold">
              <SectionLabel>Your wali</SectionLabel>
              <Text style={styles.help}>
                Your profile stays visible only while a reachable wali is attached.
              </Text>
              <TextInput
                style={styles.input} placeholder="Wali's full name" placeholderTextColor={C.faint}
                value={gName} onChangeText={setGName} autoCapitalize="words" autoCorrect={false} />
              <View style={styles.chipRow}>
                {['Father', 'Brother', 'Uncle', 'Grandfather'].map((r) => (
                  <Pressable key={r} onPress={() => setGRel(r)} style={[styles.chip, gRel === r && styles.chipOn]}>
                    <Text style={[styles.chipText, gRel === r && { color: '#14301F' }]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ height: 14 }} />
              <TextInput
                style={styles.input} placeholder="His phone or email" placeholderTextColor={C.faint}
                value={gContact} onChangeText={setGContact}
                autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
            </Card>
          )}
        </>
      )}

      <Button title="Save changes" icon="checkmark" onPress={save} disabled={!canSave} />
      {!canSave && (
        <Text style={styles.blocked}>
          {!contactOk && gContact
            ? 'That does not look like a phone number or an email address.'
            : 'Fill in every field to save.'}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 16, paddingHorizontal: 15,
    paddingVertical: 13, fontFamily: F.sans, fontSize: 15, color: C.cream,
    marginBottom: 11, backgroundColor: 'rgba(0,0,0,0.22)',
  },
  help: { fontFamily: F.sans, fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 15, paddingVertical: 11, borderRadius: S.pill,
    borderWidth: 1, borderColor: C.cardEdge,
  },
  chipOn: { backgroundColor: C.mint, borderColor: C.mint },
  chipText: { fontFamily: F.sans, fontSize: 13, color: C.soft },
  blocked: { fontFamily: F.sans, textAlign: 'center', color: C.muted, fontSize: 13, marginTop: 14 },
});
