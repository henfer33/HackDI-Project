import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, S, eyebrow } from './theme';

/** Full-bleed gradient ground every screen sits on. */
export function Screen({
  children, scroll = true, edges = ['top'],
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
}) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={{ padding: S.pad, paddingBottom: 46 }}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );
  return (
    <LinearGradient colors={[C.bgTop, C.bg]} locations={[0, 0.55]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {body}
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Gold eyebrow + serif display title, as in the reference screens. */
export function ScreenHeader({
  eyebrow: brow, title, subtitle, icon,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 26 }}>
      {!!brow && (
        <View style={styles.browRow}>
          {icon && <Ionicons name={icon} size={13} color={C.gold} />}
          <Text style={styles.brow}>{brow}</Text>
        </View>
      )}
      <Text style={styles.display}>{title}</Text>
      {!!subtitle && <Text style={styles.displaySub}>{subtitle}</Text>}
    </View>
  );
}

/** Left-aligned serif heading for list screens. */
export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={[styles.display, { fontSize: 38, textAlign: 'left' }]}>{title}</Text>
      {!!subtitle && <Text style={[styles.displaySub, { textAlign: 'left' }]}>{subtitle}</Text>}
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Card({
  children, style, tone = 'glass', onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: 'glass' | 'gold' | 'mint';
  onPress?: () => void;
}) {
  const toned =
    tone === 'gold'
      ? { backgroundColor: C.goldDim, borderColor: 'rgba(242,194,48,0.4)' }
      : tone === 'mint'
        ? { backgroundColor: C.mintDim, borderColor: 'rgba(74,222,128,0.4)' }
        : null;
  const body = <View style={[styles.card, toned, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      {body}
    </Pressable>
  );
}

export function Button({
  title, onPress, tone = 'primary', disabled, icon,
}: {
  title: string;
  onPress: () => void;
  tone?: 'primary' | 'ghost' | 'danger' | 'gold';
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const map = {
    primary: { bg: C.mint, fg: '#052E16', border: C.mint },
    gold: { bg: C.gold, fg: '#2A1F00', border: C.gold },
    ghost: { bg: 'transparent', fg: C.soft, border: C.cardEdge },
    danger: { bg: C.dangerDim, fg: C.danger, border: 'rgba(241,132,111,0.4)' },
  }[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: map.bg, borderColor: map.border },
        { opacity: disabled ? 0.35 : pressed ? 0.8 : 1 },
      ]}>
      {icon && <Ionicons name={icon} size={16} color={map.fg} />}
      <Text style={[styles.btnText, { color: map.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Pill({
  label, tone = 'mint', icon,
}: {
  label: string;
  tone?: 'mint' | 'gold' | 'muted' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const map = {
    mint: { bg: C.mintDim, fg: C.mint },
    gold: { bg: C.goldDim, fg: C.gold },
    danger: { bg: C.dangerDim, fg: C.danger },
    muted: { bg: 'rgba(255,255,255,0.07)', fg: C.muted },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: map.bg }]}>
      {icon && <Ionicons name={icon} size={11} color={map.fg} />}
      <Text style={[styles.pillText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function Row({
  icon, iconColor, label, right, onPress, locked,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  locked?: boolean;
}) {
  const inner = (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={17} color={iconColor ?? C.mint} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {locked && <Ionicons name="lock-closed" size={13} color={C.gold} style={{ marginRight: 7 }} />}
      {right}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {inner}
    </Pressable>
  );
}

/** Read-only switch visual. `locked` renders the always-on, un-togglable state. */
export function Toggle({ on, locked }: { on: boolean; locked?: boolean }) {
  return (
    <View style={[styles.track, { backgroundColor: on ? (locked ? C.gold : C.mint) : 'rgba(255,255,255,0.14)' }]}>
      <View style={[styles.knob, { alignSelf: on ? 'flex-end' : 'flex-start' }]} />
    </View>
  );
}

export function Empty({ text, icon = 'leaf-outline' }: { text: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={26} color={C.faint} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: C.cardEdge, marginVertical: 16 }} />;
}

const displayBase: TextStyle = {
  fontFamily: F.display,
  color: C.cream,
  fontSize: 46,
  textAlign: 'center',
  lineHeight: 54,
};

const styles = StyleSheet.create({
  browRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  brow: { ...eyebrow, color: C.gold },
  display: displayBase,
  displaySub: { color: C.soft, fontSize: 15, marginTop: 6, textAlign: 'center' },
  section: { ...eyebrow, color: C.soft, marginBottom: 13, marginTop: 6 },
  card: {
    backgroundColor: C.card,
    borderColor: C.cardEdge,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: 18,
    marginBottom: S.gap,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, paddingHorizontal: 20, borderRadius: S.pill, borderWidth: 1,
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: S.pill, alignSelf: 'flex-start',
  },
  pillText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.3 },
  fieldLabel: { ...eyebrow, fontSize: 10, color: C.faint, marginBottom: 3 },
  fieldValue: { fontSize: 15, color: C.cream, lineHeight: 21 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardEdge,
    borderRadius: S.pill, paddingVertical: 14, paddingHorizontal: 15, marginBottom: 11,
  },
  rowIcon: { width: 30, alignItems: 'center' },
  rowLabel: { flex: 1, color: C.cream, fontSize: 16, marginLeft: 5 },
  track: { width: 46, height: 27, borderRadius: 14, padding: 3, justifyContent: 'center' },
  knob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 34, gap: 11 },
  emptyText: { color: C.muted, textAlign: 'center', lineHeight: 21, fontSize: 14 },
});
