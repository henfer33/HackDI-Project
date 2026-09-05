import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../src/store';
import { C, F } from '../../src/theme';
import { useRouter } from 'expo-router';
import { Button, Card, Field, Pill, Screen, ScreenHeader, SectionLabel } from '../../src/ui';

export default function Me() {
  const router = useRouter();
  const { actor, profile, wali, requests, threadsFor } = useApp();

  const isWali = actor.role === 'wali';
  const g = isWali ? wali(actor.id) : undefined;
  const me = isWali ? undefined : profile(actor.id);
  const ward = g ? profile(g.wardId) : undefined;
  const myWali = me?.waliId ? wali(me.waliId) : undefined;

  const sent = requests.filter((r) => r.manId === actor.id).length;
  const received = requests.filter((r) => r.womanId === actor.id).length;
  const reviewed = requests.filter((r) => r.waliId === actor.id).length;

  return (
    <Screen>
      <View style={{ marginBottom: 4 }} />
      <ScreenHeader
        eyebrow={isWali ? 'Guardian' : actor.role === 'man' ? 'Suitor' : 'Seeking marriage'}
        icon={isWali ? 'shield-checkmark' : 'leaf'}
        title={(g?.name ?? me?.name ?? '').split(' ')[0]}
        subtitle={g ? `${g.relationship} of ${ward?.name}` : `${me?.age} · ${me?.location}`}
      />

      <Button
        title="Edit profile"
        icon="create-outline"
        tone="ghost"
        onPress={() => router.push('/edit-profile')}
      />
      <View style={{ height: 18 }} />

      {isWali && g && (
        <>
          <Card tone="gold">
            <Pill label="Wali" tone="gold" icon="shield-checkmark" />
            <Field label="Contact on file" value={g.contact} />
            <Field label="Under your care" value={ward?.name ?? 'Not set'} />
            <Text style={styles.note}>
              Self-attested for this build. Verifying that a wali really is her guardian is on the
              roadmap, not in the MVP.
            </Text>
          </Card>
          <SectionLabel>Activity</SectionLabel>
          <Card>
            <Field label="Requests reviewed" value={String(reviewed)} />
            <Field label="Conversations you can read" value={String(threadsFor(actor).length)} />
          </Card>
        </>
      )}

      {me && (
        <>
          <Card>
            <Field label="Education" value={me.education} />
            <Field label="Career" value={me.career} />
            <Field label="Location" value={me.location} />
            <Field label="Marriage timeline" value={me.timeline} />
            <Field label="About" value={me.about} />
          </Card>

          {me.role === 'woman' && (
            <>
              <SectionLabel>Your wali</SectionLabel>
              <Card tone="gold">
                {myWali ? (
                  <>
                    <Text style={styles.waliName}>{myWali.name}</Text>
                    <Text style={styles.waliRel}>{myWali.relationship} · {myWali.contact}</Text>
                    <Text style={styles.note}>
                      Your profile is visible because a wali is attached. Removing him would hide it.
                    </Text>
                  </>
                ) : (
                  <Text style={styles.note}>No wali attached. Your profile is not visible.</Text>
                )}
              </Card>
            </>
          )}

          <SectionLabel>Activity</SectionLabel>
          <Card>
            <Field
              label={me.role === 'man' ? 'Requests sent' : 'Requests received'}
              value={String(me.role === 'man' ? sent : received)}
            />
            <Field label="Open conversations" value={String(threadsFor(actor).length)} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: F.sans, fontSize: 13, color: C.muted, lineHeight: 19, marginTop: 10 },
  waliName: { fontFamily: F.display, fontSize: 22, color: C.cream },
  waliRel: { fontFamily: F.sans, fontSize: 14, color: C.gold, marginTop: 4 },
});
