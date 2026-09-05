import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../src/store';
import { C, F, S } from '../../src/theme';
import { Card, PageTitle, Pill, Row, Screen, SectionLabel, Toggle } from '../../src/ui';
import { Actor, WaliNotify } from '../../src/types';

export default function Settings() {
  const router = useRouter();
  const {
    actor, setActor, profiles, walis, reset,
    waliNotify, setWaliNotify, inboxFor, profile, wali, setWaliMaySend,
  } = useApp();

  const me = actor.role === 'wali' ? undefined : profile(actor.id);

  // Wipes every request, message and conversation — shared, and irreversible.
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
  const myWali = me?.waliId ? wali(me.waliId) : undefined;

  const [notifications, setNotifications] = useState(true);
  const [hideFromCommunity, setHideFromCommunity] = useState(false);

  const man = profiles.find((p) => p.id === 'm1')!;
  const woman = profiles.find((p) => p.id === 'w1')!;
  const guardian = walis.find((w) => w.id === 'g1')!;

  const roles: { actor: Actor; name: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { actor: { role: 'man', id: man.id }, name: man.name, sub: 'Suitor', icon: 'search' },
    { actor: { role: 'woman', id: woman.id }, name: woman.name, sub: 'Consents after her wali', icon: 'heart-outline' },
    { actor: { role: 'wali', id: guardian.id }, name: guardian.name, sub: `Wali · ${guardian.relationship} of ${woman.name.split(' ')[0]}`, icon: 'shield-checkmark' },
  ];

  const notifyOptions: { key: WaliNotify; label: string }[] = [
    { key: 'sms', label: 'SMS' },
    { key: 'email', label: 'Email' },
    { key: 'app', label: 'In-app' },
  ];

  return (
    <Screen>
      <PageTitle title="Settings" subtitle="How this app treats the guardian." />

      <SectionLabel>Viewing as · demo</SectionLabel>
      {roles.map((r) => {
        const active = actor.id === r.actor.id;
        const badge = inboxFor(r.actor).length;
        return (
          <Pressable key={r.actor.id} onPress={() => { setActor(r.actor); router.push('/'); }}>
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
            everything — that part is not a setting.
          </Text>
        </>
      )}

      <SectionLabel>Reaching the wali</SectionLabel>
      <Card>
        <Text style={styles.help}>
          How a guardian is notified when he has no account yet.
        </Text>
        <View style={styles.segment}>
          {notifyOptions.map((o) => (
            <Pressable key={o.key} onPress={() => setWaliNotify(o.key)}
              style={[styles.segBtn, waliNotify === o.key && styles.segBtnOn]}>
              <Text style={[styles.segText, waliNotify === o.key && { color: '#14301F', fontFamily: F.bold }]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionLabel>Preferences</SectionLabel>
      <Row icon="notifications-outline" label="Notifications"
        onPress={() => setNotifications((v) => !v)} right={<Toggle on={notifications} />} />
      <Row icon="eye-off-outline" label="Hide profile from community"
        onPress={() => setHideFromCommunity((v) => !v)} right={<Toggle on={hideFromCommunity} />} />

      <SectionLabel>Demo</SectionLabel>
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
