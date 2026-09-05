import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/store';
import { C, F, S } from '../../src/theme';
import { Button, Pill } from '../../src/ui';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = String(id);
  const {
    actor, request, profile, wali, messages,
    sendMessage, proposeMeet, confirmMeet, meetFor,
  } = useApp();

  const router = useRouter();
  const r = request(requestId);
  const [draft, setDraft] = useState('');
  const scroller = useRef<ScrollView>(null);

  if (!r) return <View style={styles.fill}><Text style={{ color: C.cream, padding: 20 }}>Conversation not found.</Text></View>;

  const man = profile(r.manId);
  const woman = profile(r.womanId);
  const g = wali(r.waliId);

  const isWali = actor.role === 'wali';
  // She decides whether her wali may write here. Reading is never in question.
  const waliMayWrite = !!woman?.waliMaySend;
  const readOnly = isWali && !waliMayWrite;
  const thread = messages.filter((m) => m.requestId === requestId);
  const meet = meetFor(requestId);
  const meetDone = meet?.confirmedBy;
  const canConfirm = meet && !meet.confirmedBy && meet.initiatedBy !== actor.id && !isWali;

  const nameFor = (sid: string) =>
    sid === man?.id ? man?.name : sid === woman?.id ? woman?.name : g?.name ?? '';

  const send = () => {
    sendMessage(requestId, actor.id, draft);
    setDraft('');
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
  };

  return (
    <LinearGradient colors={[C.bgTop, C.bg]} locations={[0, 0.5]} style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <SafeAreaView edges={['top']}>
          <View style={styles.banner}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginRight: 2 }}>
              <Ionicons name="chevron-back" size={22} color={C.mint} />
            </Pressable>
            <Ionicons name="shield-checkmark" size={15} color={C.gold} />
            <Text style={styles.bannerText}>
              {man?.name.split(' ')[0]} · {woman?.name.split(' ')[0]} · {g?.name.split(' ')[0]}
            </Text>
            <Pill label={readOnly ? 'Read-only' : isWali ? 'You may write' : 'Wali is reading'} tone="gold" />
          </View>
        </SafeAreaView>

        <ScrollView
          ref={scroller}
          style={styles.fill}
          contentContainerStyle={{ padding: S.pad, paddingBottom: 12 }}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <View style={styles.adab}>
            <Ionicons name="leaf-outline" size={14} color={C.mint} />
            <Text style={styles.adabText}>
              Keep it purposeful and modest. Everything here is seen by {g?.name}.
            </Text>
          </View>

          {thread.map((m) => {
            if (m.system) {
              return (
                <View key={m.id} style={styles.system}>
                  <Text style={styles.systemText}>{m.text}</Text>
                </View>
              );
            }
            const mine = m.senderId === actor.id;
            return (
              <View key={m.id} style={[styles.wrap, mine ? styles.right : styles.left]}>
                {!mine && <Text style={styles.sender}>{nameFor(m.senderId)}</Text>}
                <View style={[styles.bubble, mine ? styles.mine : styles.other]}>
                  <Text style={[styles.msg, mine && { color: '#14301F' }]}>{m.text}</Text>
                </View>
              </View>
            );
          })}

          {meetDone && (
            <View style={styles.handoff}>
              <Ionicons name="people" size={22} color={C.gold} />
              <Text style={styles.handoffTitle}>Khitbah steps back</Text>
              <Text style={styles.handoffText}>
                Both have agreed to meet. Arranging it belongs to the family, not the app. Speak to{' '}
                {g?.name} ({g?.relationship.toLowerCase()}) at {g?.contact}.
              </Text>
            </View>
          )}
        </ScrollView>

        {!meetDone && !isWali && (
          <View style={{ paddingHorizontal: S.pad, paddingBottom: 6 }}>
            {!meet && (
              <Pressable onPress={() => proposeMeet(requestId, actor.id)}>
                <Text style={styles.meetLink}>Ready to meet in person →</Text>
              </Pressable>
            )}
            {meet && !canConfirm && <Text style={styles.meetPending}>Waiting on the other party to agree.</Text>}
            {canConfirm && <Button title="Yes, ready to meet" icon="people-outline" onPress={() => confirmMeet(requestId, actor.id)} />}
          </View>
        )}

        <SafeAreaView
          edges={['bottom']}
          style={{ borderTopWidth: 1, borderTopColor: readOnly ? C.goldEdge : C.cardEdge }}>
          {readOnly ? (
            <View style={styles.readonly}>
              <Ionicons name="eye-outline" size={16} color={C.gold} />
              <Text style={styles.readonlyText}>
                You are here as the wali. You can read everything. {woman?.name.split(' ')[0]} has
                not enabled messages from you.
              </Text>
            </View>
          ) : (
            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                placeholder="Write a message"
                placeholderTextColor={C.faint}
                value={draft}
                onChangeText={setDraft}
                multiline
              />
              <Pressable onPress={send} disabled={!draft.trim()} style={[styles.send, !draft.trim() && { opacity: 0.3 }]}>
                <Ionicons name="arrow-up" size={19} color="#14301F" />
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    paddingHorizontal: S.pad, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.goldEdge,
  },
  bannerText: { flex: 1, fontFamily: F.semi, fontSize: 13.5, color: C.cream },
  adab: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 14, padding: 12, marginBottom: 18,
  },
  adabText: { flex: 1, fontFamily: F.sans, fontSize: 12.5, color: C.soft, lineHeight: 18 },
  wrap: { marginBottom: 13, maxWidth: '84%' },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end' },
  sender: { fontFamily: F.sans, fontSize: 11.5, color: C.muted, marginBottom: 5, marginLeft: 6 },
  bubble: { borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11 },
  mine: { backgroundColor: C.mint, borderBottomRightRadius: 6 },
  other: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardEdge, borderBottomLeftRadius: 6 },
  msg: { fontFamily: F.sans, fontSize: 15, color: C.cream, lineHeight: 21 },
  system: {
    borderWidth: 1, borderColor: C.cardEdge, borderRadius: 14, padding: 13,
    marginBottom: 16, alignSelf: 'center', maxWidth: '94%',
  },
  systemText: { fontFamily: F.sans, fontSize: 12.5, color: C.soft, textAlign: 'center', lineHeight: 19 },
  handoff: {
    borderWidth: 1, borderColor: C.goldEdge,
    borderRadius: S.radius, padding: 20, marginTop: 10, alignItems: 'center', gap: 4,
  },
  handoffTitle: { fontFamily: F.display, fontSize: 21, color: C.gold, marginTop: 6 },
  handoffText: { fontFamily: F.sans, fontSize: 13.5, color: C.cream, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  meetLink: { color: C.mint, fontFamily: F.bold, fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  meetPending: { color: C.muted, fontFamily: F.sans, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12 },
  input: {
    flex: 1, borderWidth: 1, borderColor: C.cardEdge, borderRadius: S.pill,
    paddingHorizontal: 17, paddingVertical: 12, fontFamily: F.sans, fontSize: 15, color: C.cream, maxHeight: 110,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  send: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.mint,
    alignItems: 'center', justifyContent: 'center',
  },
  readonly: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  readonlyText: { flex: 1, fontFamily: F.medium, fontSize: 12.5, color: C.gold, lineHeight: 19 },
});
