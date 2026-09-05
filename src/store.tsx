import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { SEED_MESSAGES, SEED_PROFILES, SEED_REQUESTS, SEED_WALIS } from './seed';
import { fetchAll, remote, subscribeAll } from './remote';
import { isLive } from './supabase';
import {
  Actor, MatchRequest, MeetIntent, Message, Profile, Wali, WaliNotify,
} from './types';

let seq = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

interface Ctx {
  profiles: Profile[];
  walis: Wali[];
  requests: MatchRequest[];
  messages: Message[];
  meets: MeetIntent[];
  actor: Actor;

  /** True when reads and writes are going to Supabase rather than memory. */
  live: boolean;
  /** Live but the connection is not currently up. */
  offline: boolean;
  /** First load from the backend has not returned yet. */
  loading: boolean;

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

  threadsFor: (actor: Actor) => MatchRequest[];
  inboxFor: (actor: Actor) => MatchRequest[];
  lastMessage: (requestId: string) => Message | undefined;
  counterpart: (r: MatchRequest, actor: Actor) => Profile | undefined;

  waliNotify: WaliNotify;
  setWaliNotify: (m: WaliNotify) => void;
  setWaliMaySend: (womanId: string, may: boolean) => void;

  reset: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // When a backend is configured the seed arrays would flash on screen and then
  // be replaced, so start empty and let `loading` cover the gap.
  const [profiles, setProfiles] = useState<Profile[]>(isLive ? [] : SEED_PROFILES);
  const [walis, setWalis] = useState<Wali[]>(isLive ? [] : SEED_WALIS);
  const [requests, setRequests] = useState<MatchRequest[]>(isLive ? [] : SEED_REQUESTS);
  const [messages, setMessages] = useState<Message[]>(isLive ? [] : SEED_MESSAGES);
  const [meets, setMeets] = useState<MeetIntent[]>([]);
  const [loading, setLoading] = useState(isLive);
  const [actor, setActor] = useState<Actor>({ role: 'man', id: 'm1' });
  const [waliNotify, setWaliNotify] = useState<WaliNotify>('sms');
  const [offline, setOffline] = useState(false);

  // Latest snapshot for guards, so callbacks never close over stale state.
  const snap = useRef({ requests, profiles });
  snap.current = { requests, profiles };

  const pull = useCallback(async () => {
    if (!isLive) return;
    try {
      const d = await fetchAll();
      setProfiles(d.profiles);
      setWalis(d.walis);
      setRequests(d.requests);
      setMessages(d.messages);
      setMeets(d.meets);
      setOffline(false);
    } catch {
      // Keep whatever is on screen; the demo continues on the last good data.
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLive) return;
    pull();
    return subscribeAll(pull);
  }, [pull]);

  const profile = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles]);
  const wali = useCallback((id: string) => walis.find((w) => w.id === id), [walis]);
  const request = useCallback((id: string) => requests.find((r) => r.id === id), [requests]);
  const meetFor = useCallback((id: string) => meets.find((m) => m.requestId === id), [meets]);

  const threadsFor = useCallback<Ctx['threadsFor']>(
    (a) => requests.filter((r) =>
      r.status === 'accepted' &&
      (a.role === 'wali' ? r.waliId === a.id : r.manId === a.id || r.womanId === a.id)),
    [requests],
  );

  const inboxFor = useCallback<Ctx['inboxFor']>(
    (a) => requests.filter((r) =>
      a.role === 'wali' ? r.waliId === a.id && r.status === 'pending_wali'
      : a.role === 'woman' ? r.womanId === a.id && r.status === 'pending_woman'
      : false),
    [requests],
  );

  const lastMessage = useCallback<Ctx['lastMessage']>((rid) => {
    const t = messages.filter((m) => m.requestId === rid);
    return t[t.length - 1];
  }, [messages]);

  const counterpart = useCallback<Ctx['counterpart']>((r, a) =>
    profiles.find((p) => p.id === (a.role === 'man' ? r.womanId : r.manId)), [profiles]);

  const addProfile: Ctx['addProfile'] = useCallback((p) => {
    const id = uid(p.role === 'man' ? 'm' : 'w');
    const full = { ...p, id };
    if (isLive) remote.insertProfile(full).then(pull);
    else setProfiles((xs) => [...xs, full]);
    return id;
  }, [pull]);

  const addWali: Ctx['addWali'] = useCallback((w) => {
    const id = uid('g');
    const full = { ...w, id };
    if (isLive) {
      remote.insertWali(full).then(() => remote.attachWali(w.wardId, id)).then(pull);
    } else {
      setWalis((xs) => [...xs, full]);
      setProfiles((xs) => xs.map((p) => (p.id === w.wardId ? { ...p, waliId: id } : p)));
    }
    return id;
  }, [pull]);

  const sendRequest: Ctx['sendRequest'] = useCallback((manId, womanId, note) => {
    const woman = snap.current.profiles.find((p) => p.id === womanId);
    if (!woman?.waliId) return; // no wali attached => profile is not active
    const r: MatchRequest = {
      id: uid('r'), manId, womanId, waliId: woman.waliId,
      status: 'pending_wali', note, createdAt: Date.now(),
    };
    if (isLive) remote.insertRequest(r).then(pull);
    else setRequests((xs) => [...xs, r]);
  }, [pull]);

  const waliDecide: Ctx['waliDecide'] = useCallback((requestId, approve) => {
    const status = approve ? 'pending_woman' : 'declined_wali';
    if (isLive) remote.setRequestStatus(requestId, status).then(pull);
    else setRequests((xs) => xs.map((r) => (r.id === requestId ? { ...r, status } : r)));
  }, [pull]);

  const womanDecide: Ctx['womanDecide'] = useCallback((requestId, accept) => {
    const status = accept ? 'accepted' : 'declined_woman';
    const r = snap.current.requests.find((x) => x.id === requestId);
    const g = r ? walis.find((w) => w.id === r.waliId) : undefined;
    const notice: Message | null = accept ? {
      id: uid('s'), requestId, senderId: 'system', system: true, at: Date.now(),
      text: `${g ? g.name : 'The wali'} is present in this chat as a witness and can read every message.`,
    } : null;

    if (isLive) {
      remote.setRequestStatus(requestId, status)
        .then(() => (notice ? remote.insertMessage(notice) : null))
        .then(pull);
    } else {
      setRequests((xs) => xs.map((x) => (x.id === requestId ? { ...x, status } : x)));
      if (notice) setMessages((xs) => [...xs, notice]);
    }
  }, [walis, pull]);

  const sendMessage: Ctx['sendMessage'] = useCallback((requestId, senderId, text) => {
    const body = text.trim();
    if (!body) return;
    const r = snap.current.requests.find((x) => x.id === requestId);
    if (!r || r.status !== 'accepted') return;
    // The couple can always write. The wali writes only where she has allowed it;
    // his reading is never in question.
    if (senderId !== r.manId && senderId !== r.womanId) {
      const her = snap.current.profiles.find((p) => p.id === r.womanId);
      if (!(senderId === r.waliId && her?.waliMaySend)) return;
    }
    const m: Message = { id: uid('msg'), requestId, senderId, text: body, at: Date.now() };
    if (isLive) remote.insertMessage(m).then(pull);
    else setMessages((xs) => [...xs, m]);
  }, [pull]);

  const systemNote = useCallback((requestId: string, text: string) => {
    const m: Message = { id: uid('s'), requestId, senderId: 'system', system: true, at: Date.now(), text };
    if (isLive) return remote.insertMessage(m);
    setMessages((xs) => [...xs, m]);
    return Promise.resolve(null);
  }, []);

  const proposeMeet: Ctx['proposeMeet'] = useCallback((requestId, by) => {
    const r = snap.current.requests.find((x) => x.id === requestId);
    if (!r || r.status !== 'accepted') return;
    if (by !== r.manId && by !== r.womanId) return; // not the wali's call
    const m: MeetIntent = { requestId, initiatedBy: by };
    if (isLive) {
      remote.upsertMeet(m)
        .then(() => systemNote(requestId, 'A request to meet in person has been raised. The other party needs to agree.'))
        .then(pull);
    } else {
      setMeets((xs) => (xs.some((x) => x.requestId === requestId) ? xs : [...xs, m]));
      systemNote(requestId, 'A request to meet in person has been raised. The other party needs to agree.');
    }
  }, [pull, systemNote]);

  const confirmMeet: Ctx['confirmMeet'] = useCallback((requestId, by) => {
    const r = snap.current.requests.find((x) => x.id === requestId);
    if (!r || (by !== r.manId && by !== r.womanId)) return;
    const existing = meets.find((m) => m.requestId === requestId);
    if (!existing || existing.initiatedBy === by) return; // the proposer cannot confirm alone
    if (isLive) {
      remote.upsertMeet({ ...existing, confirmedBy: by })
        .then(() => systemNote(requestId, 'Both parties have agreed to meet. Khitbah hands over to the wali from here.'))
        .then(pull);
    } else {
      setMeets((xs) => xs.map((m) => (m.requestId === requestId ? { ...m, confirmedBy: by } : m)));
      systemNote(requestId, 'Both parties have agreed to meet. Khitbah hands over to the wali from here.');
    }
  }, [meets, pull, systemNote]);

  const setWaliMaySend: Ctx['setWaliMaySend'] = useCallback((womanId, may) => {
    if (isLive) remote.setWaliMaySend(womanId, may).then(pull);
    else setProfiles((xs) => xs.map((p) => (p.id === womanId ? { ...p, waliMaySend: may } : p)));
  }, [pull]);

  const reset = useCallback(() => {
    setActor({ role: 'man', id: 'm1' });
    setWaliNotify('sms');
    if (isLive) { remote.clearDemo().then(pull); return; }
    setProfiles(SEED_PROFILES);
    setWalis(SEED_WALIS);
    setRequests([]);
    setMessages([]);
    setMeets([]);
  }, [pull]);

  const value = useMemo<Ctx>(() => ({
    profiles, walis, requests, messages, meets, actor,
    live: isLive, offline, loading,
    setActor, profile, wali, request,
    addProfile, addWali,
    sendRequest, waliDecide, womanDecide,
    sendMessage, proposeMeet, confirmMeet, meetFor,
    threadsFor, inboxFor, lastMessage, counterpart,
    waliNotify, setWaliNotify, setWaliMaySend,
    reset,
  }), [
    profiles, walis, requests, messages, meets, actor, offline, loading,
    profile, wali, request, addProfile, addWali,
    sendRequest, waliDecide, womanDecide, sendMessage, proposeMeet, confirmMeet, meetFor,
    threadsFor, inboxFor, lastMessage, counterpart, waliNotify, setWaliMaySend, reset,
  ]);

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
