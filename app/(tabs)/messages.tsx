import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../src/store';
import { C, F } from '../../src/theme';
import { Card, Empty, PageTitle, Pill, Screen, SectionLabel } from '../../src/ui';

/**
 * Conversations for whoever is viewing. The suitor and the woman each reach
 * their own chats here; the wali reaches the same chats read-only.
 */
export default function Messages() {
  const router = useRouter();
  const { actor, threadsFor, counterpart, lastMessage, wali, meetFor, profile } = useApp();

  const threads = threadsFor(actor);
  const isWali = actor.role === 'wali';

  return (
    <Screen>
      <PageTitle
        title="Messages"
        subtitle={isWali ? 'You can read every one of these.' : 'Your wali is present in every one.'}
      />

      {threads.length === 0 && (
        <Empty
          icon="chatbubbles-outline"
          text={
            isWali
              ? 'No conversations yet. One opens when you approve a request and she accepts.'
              : 'No conversations yet. A chat opens once a request clears the wali and is accepted.'
          }
        />
      )}

      {threads.length > 0 && <SectionLabel>{threads.length} open</SectionLabel>}

      {threads.map((r) => {
        const other = counterpart(r, actor);
        const g = wali(r.waliId);
        const last = lastMessage(r.id);
        const meet = meetFor(r.id);
        return (
          <Card key={r.id} onPress={() => router.push(`/chat/${r.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{other?.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text style={styles.name}>{other?.name}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {last ? (last.system ? last.text : `${last.senderId === actor.id ? 'You: ' : ''}${last.text}`) : 'No messages yet'}
                </Text>
              </View>
            </View>
            <View style={styles.pills}>
              {isWali ? (
                <Pill
                  label={profile(r.womanId)?.waliMaySend ? 'You may write' : 'Read-only'}
                  tone="gold"
                  icon={profile(r.womanId)?.waliMaySend ? 'chatbubble-ellipses-outline' : 'eye-outline'}
                />
              ) : (
                <Pill label={`${g?.name.split(' ')[0]} is reading`} tone="gold" icon="shield-checkmark" />
              )}
              {meet?.confirmedBy && <Pill label="Ready to meet" icon="people-outline" />}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: C.mintDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.35)',
  },
  avatarText: { fontFamily: F.display, fontSize: 21, color: C.mint },
  name: { fontFamily: F.display, fontSize: 21, color: C.cream },
  preview: { fontFamily: F.sans, fontSize: 13.5, color: C.muted, marginTop: 3 },
  pills: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
});
