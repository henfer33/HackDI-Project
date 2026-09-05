import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { C, F } from './theme';

/** The wordmark: a guardian's shield beside the name. Used on the landing screen. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <Ionicons name="shield-checkmark" size={size * 0.86} color={C.gold} />
      <Text style={[styles.word, { fontSize: size }]}>Khitbah</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: { fontFamily: F.displayBold, color: C.cream, letterSpacing: 0.5 },
});
