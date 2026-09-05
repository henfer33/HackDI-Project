import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { C, S } from './theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title, onPress, tone = 'primary', disabled,
}: {
  title: string;
  onPress: () => void;
  tone?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  const bg = tone === 'primary' ? C.green : tone === 'danger' ? C.dangerSoft : 'transparent';
  const fg = tone === 'primary' ? '#fff' : tone === 'danger' ? C.danger : C.green;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        tone === 'ghost' && { borderWidth: 1, borderColor: C.line },
      ]}>
      <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone = 'green' }: { label: string; tone?: 'green' | 'gold' | 'muted' }) {
  const map = {
    green: { bg: C.greenSoft, fg: C.green },
    gold: { bg: C.goldSoft, fg: C.gold },
    muted: { bg: '#EEEBE4', fg: C.muted },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: map.bg }]}>
      <Text style={[styles.pillText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: S.radius,
    padding: S.pad,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: S.gap,
  },
  btn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 11, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '600' },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '600' },
  fieldLabel: { fontSize: 12, color: C.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { fontSize: 15, color: C.ink },
  empty: { padding: 30, alignItems: 'center' },
  emptyText: { color: C.muted, textAlign: 'center', lineHeight: 21 },
});
