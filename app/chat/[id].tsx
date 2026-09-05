import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useApp } from '../../src/store';
import { C, S } from '../../src/theme';
import { Button, Pill } from '../../src/ui';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = String(id);
  const {
    actor, request, profile, wali, messages,
    sendMessage, proposeMeet, confirmMeet, meetFor,
  } = useApp();

  const r = request(requestId);
  const [draft, setDraft] = useState('');
  const scroller = useRef<ScrollView>(null);

  if (!r) return <Text style={{ padding: 20 }}>Conversation not found.</Text>;

  const man = profile(r.manId);
  const woman = profile(r.womanId);
  const g = wali(r.waliId);

  const isWali = actor.role === 'wali';
  const thread = messages.filter((m) => m.requestId === requestId);
  const meet = meetFor(requestId);

  const nameFor = (senderId: string) =>
    senderId === man?.id ? man?.name : senderId === woman?.id ? woman?.name : g?.name ?? 'Unknown';

  const send = () => {
    if (isWali) return; // enforced here as well as in the UI
    sendMessage(requestId, actor.id, draft);
    setDraft('');
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  };

  const canConfirmMeet = meet && !meet.confirmedBy && meet.initiatedBy !== actor.id && !isWali;
  const meetDone = meet?.confirmedBy;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {man?.name.split(' ')[0]} · {woman?.name.split(' ')[0]} · {g?.name.split(' ')[0]} (wali)
        </Text>
        <Pill label={isWali ? 'Read-only' : 'Wali is reading'} tone="gold" />
      </View>

      <ScrollView
        ref={scroller}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: S.pad, paddingBottom: 10 }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}>
        {thread.length === 0 && (
          <Text style={styles.hint}>
            The conversation starts here. Everything sent is visible to {g?.name}.
          </Text>
        )}

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
            <View key={m.id} style={[styles.bubbleWrap, mine ? styles.right : styles.left]}>
              {!mine && <Text style={styles.sender}>{nameFor(m.senderId)}</Text>}
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.msg, mine && { color: '#fff' }]}>{m.text}</Text>
              </View>
            </View>
          );
        })}

        {meetDone && (
          <View style={styles.handoff}>
            <Text style={styles.handoffTitle}>Khitbah steps back</Text>
            <Text style={styles.handoffText}>
              Both have agreed to meet. Arranging it is for the family, not the app. Speak to{' '}
              {g?.name} ({g?.relationship.toLowerCase()}) at {g?.contact}.
            </Text>
          </View>
        )}
      </ScrollView>

      {!meetDone && !isWali && (
        <View style={styles.meetBar}>
          {!meet && (
            <Pressable onPress={() => proposeMeet(requestId, actor.id)}>
              <Text style={styles.meetLink}>Ready to meet in person →</Text>
            </Pressable>
          )}
          {meet && !canConfirmMeet && (
            <Text style={styles.meetPending}>Waiting on the other party to agree to meet.</Text>
          )}
          {canConfirmMeet && (
            <Button title="Yes, ready to meet" onPress={() => confirmMeet(requestId, actor.id)} />
          )}
        </View>
      )}

      {isWali ? (
        <View style={styles.readonly}>
          <Text style={styles.readonlyText}>
            You are present as the wali. You can read everything here; you cannot send messages.
          </Text>
        </View>
      ) : (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Write a message"
            placeholderTextColor={C.muted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable onPress={send} style={styles.sendBtn} disabled={!draft.trim()}>
            <Text style={[styles.sendText, !draft.trim() && { opacity: 0.35 }]}>Send</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: S.pad, paddingVertical: 11,
    backgroundColor: C.goldSoft, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  bannerText: { flex: 1, fontSize: 13, color: C.ink, fontWeight: '500' },
  hint: { color: C.muted, fontSize: 14, textAlign: 'center', paddingVertical: 24, lineHeight: 20 },
  bubbleWrap: { marginBottom: 12, maxWidth: '82%' },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end' },
  sender: { fontSize: 12, color: C.muted, marginBottom: 4, marginLeft: 4 },
  bubble: { borderRadius: 15, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: C.green, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderBottomLeftRadius: 4 },
  msg: { fontSize: 15, color: C.ink, lineHeight: 21 },
  system: {
    backgroundColor: C.greenSoft, borderRadius: 10, padding: 12,
    marginBottom: 14, alignSelf: 'center', maxWidth: '92%',
  },
  systemText: { fontSize: 13, color: C.green, textAlign: 'center', lineHeight: 19 },
  handoff: {
    backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.gold,
    borderRadius: 14, padding: 18, marginTop: 8,
  },
  handoffTitle: { fontSize: 16, fontWeight: '700', color: C.gold, marginBottom: 7 },
  handoffText: { fontSize: 14, color: C.ink, lineHeight: 21 },
  meetBar: { paddingHorizontal: S.pad, paddingBottom: 8 },
  meetLink: { color: C.green, fontSize: 14, fontWeight: '600', textAlign: 'center', paddingVertical: 10 },
  meetPending: { color: C.muted, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#fff',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 10, fontSize: 15, color: C.ink, maxHeight: 110,
  },
  sendBtn: { paddingHorizontal: 8, paddingVertical: 12 },
  sendText: { color: C.green, fontWeight: '700', fontSize: 15 },
  readonly: {
    padding: 16, borderTopWidth: 1, borderTopColor: C.gold,
    backgroundColor: C.goldSoft,
  },
  readonlyText: { fontSize: 13, color: C.gold, textAlign: 'center', lineHeight: 19, fontWeight: '500' },
});
