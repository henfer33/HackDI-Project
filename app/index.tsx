import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../src/Logo';
import { C, F, S } from '../src/theme';
import { Button } from '../src/ui';

const STEPS = [
  { icon: 'send-outline' as const, title: 'He sends a request', body: 'It never lands in her inbox first.' },
  { icon: 'shield-checkmark' as const, title: 'Her wali reviews it', body: 'He approves or declines before she sees it.' },
  { icon: 'heart-outline' as const, title: 'She decides for herself', body: 'Her consent is required. A wali facilitates; he cannot compel.' },
  { icon: 'chatbubbles-outline' as const, title: 'A chat opens, wali included', body: 'He reads every message. Whether he can write is her choice.' },
  { icon: 'people-outline' as const, title: 'The app steps back', body: 'When both are ready to meet, it hands over to the family.' },
];

export default function Landing() {
  const router = useRouter();

  return (
    <LinearGradient colors={[C.bgTop, C.bg]} locations={[0, 0.55]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ padding: S.pad, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginTop: 18 }}>
            <Logo size={40} />
          </View>

          <Text style={styles.headline}>Marriage, with the wali in the room.</Text>
          <Text style={styles.sub}>
            Every other Muslim marriage app treats the guardian as a setting you can switch off.
            Here he is the path itself — and her consent is a separate gate he cannot speak for.
          </Text>

          <View style={{ height: 30 }} />
          <Text style={styles.section}>How a match happens</Text>

          {STEPS.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={s.icon} size={19} color={i === 1 ? C.gold : C.mint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 26 }} />

          <View style={styles.kyc}>
            <Ionicons name="id-card-outline" size={19} color={C.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.kycTitle}>Identity verification is required</Text>
              <Text style={styles.kycBody}>
                Everyone who signs up completes KYC before their profile goes live — suitors,
                women and walis alike. Marriage is not a place for anonymous accounts, and a
                guardian nobody can verify protects nobody.
              </Text>
            </View>
          </View>

          <View style={{ height: 28 }} />

          <Button title="Get started" icon="arrow-forward" onPress={() => router.replace('/home')} />

          <Text style={styles.note}>
            Marriage only. No casual dating, anywhere in the product.
          </Text>

          {Platform.OS === 'web' && (
            <View style={styles.badge}>
              <Ionicons name="logo-apple" size={17} color={C.soft} />
              <Text style={styles.badgeText}>Coming to the App Store</Text>
            </View>
          )}

          <Text style={styles.footer}>
            Religiosity is never filtered or verified here. That is between the individual and Allah.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: F.displayBold, fontSize: 34, color: C.cream,
    lineHeight: 42, textAlign: 'center', marginTop: 30,
  },
  sub: {
    fontFamily: F.sans, fontSize: 15, color: C.soft,
    lineHeight: 23, textAlign: 'center', marginTop: 14,
  },
  section: {
    fontFamily: F.semi, fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase',
    color: C.muted, marginBottom: 18,
  },
  step: { flexDirection: 'row', gap: 14, marginBottom: 20, alignItems: 'flex-start' },
  stepIcon: { width: 26, alignItems: 'center', marginTop: 1 },
  stepTitle: { fontFamily: F.semi, fontSize: 16, color: C.cream },
  stepBody: { fontFamily: F.sans, fontSize: 13.5, color: C.muted, lineHeight: 20, marginTop: 3 },
  kyc: {
    flexDirection: 'row', gap: 13, alignItems: 'flex-start',
    borderWidth: 1, borderColor: C.goldEdge, borderRadius: S.radius, padding: 18,
  },
  kycTitle: { fontFamily: F.semi, fontSize: 15.5, color: C.gold },
  kycBody: { fontFamily: F.sans, fontSize: 13.5, color: C.soft, lineHeight: 20, marginTop: 6 },
  note: {
    fontFamily: F.sans, fontSize: 13, color: C.muted,
    textAlign: 'center', marginTop: 18, lineHeight: 19,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: S.pill,
    paddingVertical: 12, marginTop: 20,
  },
  badgeText: { fontFamily: F.medium, fontSize: 14, color: C.soft },
  footer: {
    fontFamily: F.sans, fontSize: 12, color: C.faint,
    textAlign: 'center', marginTop: 30, lineHeight: 18,
  },
});
