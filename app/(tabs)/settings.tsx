import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../src/store';
import { C, F, S } from '../../src/theme';
import { Button, Card, Loading, PageTitle, Pill, Row, Screen, SectionLabel, Toggle } from '../../src/ui';
import { Actor, WaliNotify } from '../../src/types';
import { channelFor, contactKind, notifyWali, requestMessage } from '../../src/notify';

export default function Settings() {
  const router = useRouter();
  const {
    actor, setActor, profiles, walis, reset,
    waliNotify, setWaliNotify, inboxFor, profile, wali, setWaliMaySend, loading,
  } = useApp();

  const me = actor.role === 'wali' ? undefined : profile(actor.id);
  const myWali = me?.waliId ? wali(me.waliId) : undefined;

  const kind = myWali ? contactKind(myWali.contact) : 'invalid';

  const [sending, setSending] = useState(false);

  const say = (title: string, msg: string) => {
    if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
    else Alert.alert(title, msg);
  };

  const sendNotice = async () => {
    if (!myWali || !me || sending) return;
    setSending(true);
    try {
      const body = requestMessage(myWali.name, me.name);
      const res = await notifyWali(myWali, waliNotify, 'A request on Khitbah', body);
      if (res.ok && (res.path === 'server' || res.path === 'apify')) {
        say('Sent', `${myWali.name} has been notified by ${res.channel === 'email' ? 'email' : 'SMS'}.`);
      } else if (!res.ok) {
        say('Could not send', res.reason ?? 'Something went wrong.');
      }
      // The composer path opens the mail or messages app, which is its own feedback.
    } finally {
      setSending(false);
    }
  };

  // Wipes every request, message and conversation. Shared, and irreversible.
  const confirmReset = () => {
    const msg = 'This clears every request, conversation and message for everyone. It cannot be undone.';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Reset demo data?\n\n${msg}`)) reset();
      return;
    }
    Alert.alert('Reset demo data?', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);
  };

  const [notifications, setNotifications] = useState(true);
  const [hideFromCommunity, setHideFromCommunity] = useState(false);

  // These are absent while the first fetch is in flight, and stay absent if the
  // demo rows were deleted, so no non-null assertions here.
  const man = profiles.find((p) => p.id === 'm1');
  const woman = profiles.find((p) => p.id === 'w1');
  const guardian = walis.find((w) => w.id === 'g1');

  const roles: { actor: Actor; name: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    man && { actor: { role: 'man' as const, id: man.id }, name: man.name, sub: 'Suitor', icon: 'search' as const },
    woman && {
      actor: { role: 'woman' as const, id: woman.id },
      name: woman.name, sub: 'Consents after her wali', icon: 'heart-outline' as const,
    },
    guardian && woman && {
      actor: { role: 'wali' as const, id: guardian.id },
      name: guardian.name,
      sub: `Wali · ${guardian.relationship} of ${woman.name.split(' ')[0]}`,
      icon: 'shield-checkmark' as const,
    },
  ].filter(Boolean) as { actor: Actor; name: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[];

  const notifyOptions: { key: WaliNotify; label: string }[] = [
    { key: 'sms', label: 'SMS' },
    { key: 'email', label: 'Email' },
    { key: 'app', label: 'In-app' },
  ];

  return (
    <Screen>
      <PageTitle title="Settings" subtitle="How this app treats the guardian." />

      <SectionLabel>Viewing as · demo</SectionLabel>
      {loading && roles.length === 0 && <Loading text="Loading people" />}
      {roles.map((r) => {
        const active = actor.id === r.actor.id;
        const badge = inboxFor(r.actor).length;
        return (
          <Pressable key={r.actor.id} onPress={() => { setActor(r.actor); router.push('/home'); }}>
            <View style={[styles.roleRow, active && styles.roleRowOn]}>
              <View style={styles.roleIcon}>
                <Ionicons name={r.icon} size={17} color={active ? C.mint : C.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleName, active && { color: C.mint }]}>{r.name}</Text>
                <Text style={styles.roleSub}>{r.sub}</Text>
              </View>
              {badge > 0 && <Pill label={String(badge)} tone="gold" />}
              {active && <Ionicons name="checkmark" size={20} color={C.mint} />}
            </View>
          </Pressable>
        );
      })}

      {me?.role === 'woman' && (
        <>
          <SectionLabel>Your wali</SectionLabel>
          <Row
            icon="chatbubble-ellipses-outline"
            iconColor={C.gold}
            label="Wali can send messages"
            onPress={() => setWaliMaySend(me.id, !me.waliMaySend)}
            right={<Toggle on={!!me.waliMaySend} />}
          />
          <Text style={styles.lockNote}>
            Yours to decide. Off, {myWali?.name.split(' ')[0] ?? 'he'} reads your conversations
            without writing in them. On, he can speak in them too. Either way he always sees
            everything. That part is not a setting.
          </Text>
        </>
      )}

      <SectionLabel>Reaching the wali</SectionLabel>
      <Card>
        <Text style={styles.help}>
          How a guardian is notified when he has no account yet.
        </Text>
        <View style={styles.segment}>
          {notifyOptions.map((o) => {
            const usable = !myWali || o.key === 'app' || channelFor(myWali.contact, o.key) === o.key;
            return (
              <Pressable
                key={o.key}
                disabled={!usable}
                onPress={() => setWaliNotify(o.key)}
                style={[styles.segBtn, waliNotify === o.key && styles.segBtnOn, !usable && { opacity: 0.35 }]}>
                <Text style={[styles.segText, waliNotify === o.key && { color: '#14301F', fontFamily: F.bold }]}>
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {myWali && (
          <>
            <Text style={styles.channelNote}>
              {kind === 'email'
                ? `${myWali.name} has an email on file, so SMS is unavailable.`
                : kind === 'phone'
                  ? `${myWali.name} has a phone number on file, so email is unavailable.`
                  : `${myWali.name}'s contact details are not a valid phone or email.`}
            </Text>
            <View style={{ height: 12 }} />
            <Button
              title={sending ? 'Sending' : `Notify ${myWali.name.split(' ')[0]} now`}
              icon={kind === 'email' ? 'mail-outline' : 'chatbubble-outline'}
              tone="ghost"
              disabled={kind === 'invalid' || sending}
              onPress={sendNotice}
            />
            <Text style={styles.channelNote}>
              Sent for you when a provider is configured. Otherwise this opens your own Messages or
              Mail app with the text ready, and nothing leaves until you tap send.
            </Text>
          </>
        )}
      </Card>

      <SectionLabel>Preferences</SectionLabel>
      <Row icon="notifications-outline" label="Notifications"
        onPress={() => setNotifications((v) => !v)} right={<Toggle on={notifications} />} />
      <Row icon="eye-off-outline" label="Hide profile from community"
        onPress={() => setHideFromCommunity((v) => !v)} right={<Toggle on={hideFromCommunity} />} />

      <SectionLabel>Account</SectionLabel>
      <Row icon="create-outline" label="Edit profile" onPress={() => router.push('/edit-profile')}
        right={<Ionicons name="chevron-forward" size={16} color={C.muted} />} />
      <Row icon="person-add-outline" label="Create a new profile" onPress={() => router.push('/onboarding')}
        right={<Ionicons name="chevron-forward" size={16} color={C.muted} />} />
      <Row icon="refresh-outline" label="Reset demo data" onPress={confirmReset}
        right={<Ionicons name="chevron-forward" size={16} color={C.muted} />} />

      <Text style={styles.footer}>KHITBAH · HACKATHON BUILD</Text>
      <Text style={styles.footerSub}>
        Religiosity is never filtered or verified here. That is between the individual and Allah.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: C.cardEdge,
    borderRadius: S.radius, padding: 14, marginBottom: 11,
  },
  roleRowOn: { borderColor: C.mint },
  roleIcon: { width: 34, alignItems: 'center', justifyContent: 'center' },
  roleName: { fontFamily: F.semi, fontSize: 16.5, color: C.cream },
  roleSub: { fontFamily: F.sans, fontSize: 12.5, color: C.muted, marginTop: 2 },
  lockNote: { fontFamily: F.sans, fontSize: 12.5, color: C.muted, lineHeight: 19, marginTop: 4, marginBottom: 8, paddingHorizontal: 4 },
  help: { fontFamily: F.sans, fontSize: 13.5, color: C.muted, lineHeight: 20, marginBottom: 14 },
  channelNote: { fontFamily: F.sans, fontSize: 12.5, color: C.muted, lineHeight: 18, marginTop: 12 },
  segment: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: S.pill, padding: 4, gap: 4,
  },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: S.pill, alignItems: 'center' },
  segBtnOn: { backgroundColor: C.mint },
  segText: { fontFamily: F.sans, fontSize: 14, color: C.soft },
  footer: { fontFamily: F.display, fontSize: 13, color: C.faint, textAlign: 'center', marginTop: 26, letterSpacing: 2 },
  footerSub: { fontFamily: F.sans, fontSize: 12, color: C.faint, textAlign: 'center', marginTop: 8, lineHeight: 18, paddingHorizontal: 16 },
});
