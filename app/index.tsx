import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../src/Logo';
import { C, F, S } from '../src/theme';
import { Button } from '../src/ui';

const PILLARS = [
  {
    icon: 'shield-checkmark' as const,
    title: 'The wali is the path',
    body: 'Not a feature you enable. Every request reaches her guardian before it reaches her, and there is no setting that changes that.',
  },
  {
    icon: 'heart-outline' as const,
    title: 'Her word is her own',
    body: 'A guardian facilitates; he cannot accept on her behalf. Approval passes a request to her — the answer is hers.',
  },
  {
    icon: 'eye-outline' as const,
    title: 'Nothing happens in private',
    body: 'Conversations are open to her wali from the first message. Whether he can also speak in them is her decision.',
  },
];

const STEPS = [
  'He sends a request. It never lands in her inbox first.',
  'Her wali reviews it and approves or declines.',
  'She accepts or declines for herself.',
  'A conversation opens, with her wali present.',
  'When both are ready to meet, we hand over to the family.',
];

export default function Landing() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width > 760;

  return (
    <LinearGradient colors={[C.bgTop, C.bg]} locations={[0, 0.42]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>
          <View style={[styles.wrap, wide && { maxWidth: 720, alignSelf: 'center', width: '100%' }]}>

            {/* Hero */}
            <View style={styles.nav}>
              <Logo size={26} />
            </View>

            <Text style={[styles.headline, wide && { fontSize: 52, lineHeight: 60 }]}>
              Marriage, with the wali in the room.
            </Text>
            <Text style={styles.lede}>
              A place for Muslims in the West to marry with their family beside them — not a dating
              app with a guardian bolted on the side.
            </Text>

            <View style={{ height: 30 }} />
            <Button title="Get started" icon="arrow-forward" onPress={() => router.replace('/home')} />
            <View style={{ height: 12 }} />
            <Button
              title="Create your profile"
              tone="ghost"
              onPress={() => router.push('/onboarding')}
            />

            <Text style={styles.intent}>For marriage. Nothing else on this app is for anything else.</Text>

            <View style={styles.rule} />

            {/* Pillars */}
            <Text style={styles.kicker}>Why it is built this way</Text>
            {PILLARS.map((p) => (
              <View key={p.title} style={styles.pillar}>
                <Ionicons name={p.icon} size={21} color={C.gold} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarTitle}>{p.title}</Text>
                  <Text style={styles.pillarBody}>{p.body}</Text>
                </View>
              </View>
            ))}

            <View style={styles.rule} />

            {/* Flow */}
            <Text style={styles.kicker}>How a match happens</Text>
            {STEPS.map((t, i) => (
              <View key={i} style={styles.step}>
                <Text style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.stepText}>{t}</Text>
              </View>
            ))}

            <View style={styles.rule} />

            {/* Trust */}
            <View style={styles.kyc}>
              <View style={styles.kycHead}>
                <Ionicons name="id-card-outline" size={20} color={C.gold} />
                <Text style={styles.kycTitle}>Everyone is verified</Text>
              </View>
              <Text style={styles.kycBody}>
                Identity verification is required of every account before it goes live — suitors,
                women and walis alike. No anonymous profiles, and no guardian nobody can vouch for.
              </Text>
            </View>

            <View style={{ height: 30 }} />
            <Button title="Get started" icon="arrow-forward" onPress={() => router.replace('/home')} />

            {Platform.OS === 'web' && (
              <View style={styles.badge}>
                <Ionicons name="logo-apple" size={17} color={C.soft} />
                <Text style={styles.badgeText}>Coming to the App Store</Text>
              </View>
            )}

            <View style={styles.footer}>
              <Logo size={17} />
              <Text style={styles.footerText}>Terms · Privacy · Contact</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: S.pad },
  nav: { paddingTop: 10, paddingBottom: 44 },
  headline: {
    fontFamily: F.displayBold, fontSize: 40, color: C.cream, lineHeight: 48, letterSpacing: -0.4,
  },
  lede: { fontFamily: F.sans, fontSize: 16.5, color: C.soft, lineHeight: 26, marginTop: 18 },
  intent: {
    fontFamily: F.sans, fontSize: 13, color: C.muted,
    textAlign: 'center', marginTop: 18, lineHeight: 19,
  },
  rule: { height: 1, backgroundColor: C.cardEdge, marginVertical: 40 },
  kicker: {
    fontFamily: F.semi, fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase',
    color: C.muted, marginBottom: 26,
  },
  pillar: { flexDirection: 'row', gap: 15, marginBottom: 28, alignItems: 'flex-start' },
  pillarTitle: { fontFamily: F.displayBold, fontSize: 21, color: C.cream, lineHeight: 27 },
  pillarBody: { fontFamily: F.sans, fontSize: 14.5, color: C.muted, lineHeight: 22, marginTop: 6 },
  step: { flexDirection: 'row', gap: 16, marginBottom: 20, alignItems: 'flex-start' },
  stepNum: { fontFamily: F.displayBold, fontSize: 15, color: C.mint, width: 26, marginTop: 1 },
  stepText: { flex: 1, fontFamily: F.sans, fontSize: 15, color: C.cream, lineHeight: 23 },
  kyc: { borderWidth: 1, borderColor: C.goldEdge, borderRadius: S.radius, padding: 22 },
  kycHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  kycTitle: { fontFamily: F.displayBold, fontSize: 20, color: C.gold },
  kycBody: { fontFamily: F.sans, fontSize: 14.5, color: C.soft, lineHeight: 22 },
  badge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: S.pill,
    paddingVertical: 13, marginTop: 14,
  },
  badgeText: { fontFamily: F.medium, fontSize: 14, color: C.soft },
  footer: {
    marginTop: 48, paddingTop: 26, borderTopWidth: 1, borderTopColor: C.cardEdge,
    alignItems: 'center', gap: 12,
  },
  footerText: { fontFamily: F.sans, fontSize: 12.5, color: C.faint, letterSpacing: 0.4 },
});
