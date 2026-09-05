import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SEED_MESSAGES, SEED_PROFILES, SEED_REQUESTS, SEED_WALIS } from './seed';
import { Actor, MatchRequest, MeetIntent, Message, Profile, Wali, WaliNotify } from './types';

let seq = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

interface Ctx {
  profiles: Profile[];
  walis: Wali[];
  requests: MatchRequest[];
  messages: Message[];
  meets: MeetIntent[];
  actor: Actor;

  setActor: (a: Actor) => void;
  profile: (id: string) => Profile | undefined;
  wali: (id: string) => Wali | undefined;
  request: (id: string) => MatchRequest | undefined;

  addProfile: (p: Omit<Profile, 'id'>) => string;
  addWali: (w: Omit<Wali, 'id'>) => string;

  sendRequest: (manId: string, womanId: string, note: string) => void;
  waliDecide: (requestId: string, approve: boolean) => void;
  womanDecide: (requestId: string, accept: boolean) => void;

  sendMessage: (requestId: string, senderId: string, text: string) => void;
  proposeMeet: (requestId: string, by: string) => void;
  confirmMeet: (requestId: string, by: string) => void;
  meetFor: (requestId: string) => MeetIntent | undefined;

  /** Accepted conversations this actor is party to (the wali included, read-only). */
  threadsFor: (actor: Actor) => MatchRequest[];
  /** Requests awaiting this actor's decision. */
  inboxFor: (actor: Actor) => MatchRequest[];
  lastMessage: (requestId: string) => Message | undefined;
  counterpart: (r: MatchRequest, actor: Actor) => Profile | undefined;

  waliNotify: WaliNotify;
  setWaliNotify: (m: WaliNotify) => void;
  /** Her switch: may her wali write in her chats? He can always read. */
  setWaliMaySend: (womanId: string, may: boolean) => void;

  reset: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(SEED_PROFILES);
  const [walis, setWalis] = useState<Wali[]>(SEED_WALIS);
  const [requests, setRequests] = useState<MatchRequest[]>(SEED_REQUESTS);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [meets, setMeets] = useState<MeetIntent[]>([]);
  const [actor, setActor] = useState<Actor>({ role: 'man', id: 'm1' });
  const [waliNotify, setWaliNotify] = useState<WaliNotify>('sms');

  const profile = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles]);
  const wali = useCallback((id: string) => walis.find((w) => w.id === id), [walis]);
  const request = useCallback((id: string) => requests.find((r) => r.id === id), [requests]);
  const meetFor = useCallback((id: string) => meets.find((m) => m.requestId === id), [meets]);

  const threadsFor = useCallback<Ctx['threadsFor']>(
    (a) =>
      requests.filter(
        (r) =>
          r.status === 'accepted' &&
          (a.role === 'wali' ? r.waliId === a.id : r.manId === a.id || r.womanId === a.id),
      ),
    [requests],
  );

  const inboxFor = useCallback<Ctx['inboxFor']>(
    (a) =>
      requests.filter((r) =>
        a.role === 'wali'
          ? r.waliId === a.id && r.status === 'pending_wali'
          : a.role === 'woman'
            ? r.womanId === a.id && r.status === 'pending_woman'
            : false,
      ),
    [requests],
  );

  const lastMessage = useCallback<Ctx['lastMessage']>(
    (rid) => {
      const t = messages.filter((m) => m.requestId === rid);
      return t[t.length - 1];
    },
    [messages],
  );

  const counterpart = useCallback<Ctx['counterpart']>(
    (r, a) => {
      if (a.role === 'man') return profiles.find((p) => p.id === r.womanId);
      if (a.role === 'woman') return profiles.find((p) => p.id === r.manId);
      return profiles.find((p) => p.id === r.manId); // wali sees the suitor
    },
    [profiles],
  );

  const addProfile: Ctx['addProfile'] = useCallback((p) => {
    const id = uid(p.role === 'man' ? 'm' : 'w');
    setProfiles((xs) => [...xs, { ...p, id }]);
    return id;
  }, []);

  const addWali: Ctx['addWali'] = useCallback((w) => {
    const id = uid('g');
    setWalis((xs) => [...xs, { ...w, id }]);
    setProfiles((xs) => xs.map((p) => (p.id === w.wardId ? { ...p, waliId: id } : p)));
    return id;
  }, []);

  const sendRequest: Ctx['sendRequest'] = useCallback(
    (manId, womanId, note) => {
      const woman = profiles.find((p) => p.id === womanId);
      if (!woman?.waliId) return; // no wali attached => profile is not active
      setRequests((xs) => [
        ...xs,
        {
          id: uid('r'),
          manId,
          womanId,
          waliId: woman.waliId!,
          status: 'pending_wali',
          note,
          createdAt: Date.now(),
        },
      ]);
    },
    [profiles],
  );

  const waliDecide: Ctx['waliDecide'] = useCallback((requestId, approve) => {
    setRequests((xs) =>
      xs.map((r) =>
        r.id === requestId ? { ...r, status: approve ? 'pending_woman' : 'declined_wali' } : r,
      ),
    );
  }, []);

  const womanDecide: Ctx['womanDecide'] = useCallback(
    (requestId, accept) => {
      setRequests((xs) =>
        xs.map((r) => (r.id === requestId ? { ...r, status: accept ? 'accepted' : 'declined_woman' } : r)),
      );
      if (accept) {
        const r = requests.find((x) => x.id === requestId);
        const g = r ? walis.find((w) => w.id === r.waliId) : undefined;
        setMessages((xs) => [
          ...xs,
          {
            id: uid('s'),
            requestId,
            senderId: 'system',
            system: true,
            at: Date.now(),
            text: `${g ? g.name : 'The wali'} is present in this chat as a witness and can read every message. He cannot send messages.`,
          },
        ]);
      }
    },
    [requests, walis],
  );

  const setWaliMaySend: Ctx['setWaliMaySend'] = useCallback((womanId, may) => {
    setProfiles((xs) => xs.map((p) => (p.id === womanId ? { ...p, waliMaySend: may } : p)));
  }, []);

  const sendMessage: Ctx['sendMessage'] = useCallback(
    (requestId, senderId, text) => {
      const body = text.trim();
      if (!body) return;
      const r = requests.find((x) => x.id === requestId);
      if (!r) return;
      // The chat is only live once both gates have passed.
      if (r.status !== 'accepted') return;
      // The couple can always write. The wali can write only where she has
      // allowed it; reading is never in question. Enforced here rather than in
      // the UI so the rule holds whichever screen calls this.
      if (senderId !== r.manId && senderId !== r.womanId) {
        const her = profiles.find((p) => p.id === r.womanId);
        if (!(senderId === r.waliId && her?.waliMaySend)) return;
      }
      setMessages((xs) => [...xs, { id: uid('msg'), requestId, senderId, text: body, at: Date.now() }]);
    },
    [requests, profiles],
  );

  const proposeMeet: Ctx['proposeMeet'] = useCallback((requestId, by) => {
    const r = requests.find((x) => x.id === requestId);
    if (!r || r.status !== 'accepted') return;
    if (by !== r.manId && by !== r.womanId) return; // the wali does not drive this either
    setMeets((xs) => (xs.some((m) => m.requestId === requestId) ? xs : [...xs, { requestId, initiatedBy: by }]));
    setMessages((xs) => [
      ...xs,
      {
        id: uid('s'),
        requestId,
        senderId: 'system',
        system: true,
        at: Date.now(),
        text: 'A request to meet in person has been raised. The other party needs to agree.',
      },
    ]);
  }, [requests]);

  const confirmMeet: Ctx['confirmMeet'] = useCallback((requestId, by) => {
    const r = requests.find((x) => x.id === requestId);
    if (!r || (by !== r.manId && by !== r.womanId)) return;
    setMeets((xs) => xs.map((m) => (m.requestId === requestId && m.initiatedBy !== by ? { ...m, confirmedBy: by } : m)));
    setMessages((xs) => [
      ...xs,
      {
        id: uid('s'),
        requestId,
        senderId: 'system',
        system: true,
        at: Date.now(),
        text: 'Both parties have agreed to meet. Khitbah hands over to the wali from here.',
      },
    ]);
  }, [requests]);

  const reset = useCallback(() => {
    setProfiles(SEED_PROFILES);
    setWalis(SEED_WALIS);
    setRequests([]);
    setMessages([]);
    setMeets([]);
    setActor({ role: 'man', id: 'm1' });
    setWaliNotify('sms');
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      profiles, walis, requests, messages, meets, actor,
      setActor, profile, wali, request,
      addProfile, addWali,
      sendRequest, waliDecide, womanDecide,
      sendMessage, proposeMeet, confirmMeet, meetFor,
      threadsFor, inboxFor, lastMessage, counterpart,
      waliNotify, setWaliNotify, setWaliMaySend,
      reset,
    }),
    [profiles, walis, requests, messages, meets, actor, profile, wali, request, addProfile, addWali,
     sendRequest, waliDecide, womanDecide, sendMessage, proposeMeet, confirmMeet, meetFor,
     threadsFor, inboxFor, lastMessage, counterpart, waliNotify, setWaliMaySend, reset],
  );

  // Dev-only handle so the flow can be driven and inspected without tapping through
  // every screen. Never present in a production build.
  if (__DEV__ && typeof globalThis !== 'undefined') {
    (globalThis as any).__khitbah = value;
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
