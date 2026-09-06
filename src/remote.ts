import { supabase } from './supabase';
import { Request, MeetIntent, Message, Profile, Wali } from './types';

/** DB rows are snake_case; the app is camelCase. Mapping lives here only. */
const toProfile = (r: any): Profile => ({
  id: r.id, role: r.role, name: r.name, age: r.age, location: r.location,
  education: r.education, career: r.career, timeline: r.timeline, about: r.about,
  email: r.email ?? '',
  photo: r.photo ?? undefined,
  waliId: r.wali_id ?? undefined, waliMaySend: r.wali_may_send ?? false,
});
const toWali = (r: any): Wali => ({
  id: r.id, name: r.name, relationship: r.relationship, contact: r.contact, wardId: r.ward_id,
});
const toRequest = (r: any): Request => ({
  id: r.id, manId: r.man_id, womanId: r.woman_id, waliId: r.wali_id,
  status: r.status, note: r.note ?? '', createdAt: new Date(r.created_at).getTime(),
});
const toMessage = (r: any): Message => ({
  id: r.id, requestId: r.request_id, senderId: r.sender_id,
  text: r.text, system: r.system, at: new Date(r.at).getTime(),
});
const toMeet = (r: any): MeetIntent => ({
  requestId: r.request_id, initiatedBy: r.initiated_by, confirmedBy: r.confirmed_by ?? undefined,
});

export async function fetchAll() {
  if (!supabase) throw new Error('no client');
  const [p, w, r, m, k] = await Promise.all([
    // Ordered so the list never reshuffles when a row is updated mid-demo.
    supabase.from('profiles').select('*').order('id'),
    supabase.from('walis').select('*').order('id'),
    supabase.from('requests').select('*').order('created_at'),
    supabase.from('messages').select('*').order('at'),
    supabase.from('meets').select('*'),
  ]);
  const err = p.error ?? w.error ?? r.error ?? m.error ?? k.error;
  if (err) throw err;
  return {
    profiles: (p.data ?? []).map(toProfile),
    walis: (w.data ?? []).map(toWali),
    requests: (r.data ?? []).map(toRequest),
    messages: (m.data ?? []).map(toMessage),
    meets: (k.data ?? []).map(toMeet),
  };
}

export const remote = {
  insertRequest: (r: Request) =>
    supabase!.from('requests').insert({
      id: r.id, man_id: r.manId, woman_id: r.womanId, wali_id: r.waliId,
      status: r.status, note: r.note,
    }),
  setRequestStatus: (id: string, status: Request['status']) =>
    supabase!.from('requests').update({ status }).eq('id', id),
  insertMessage: (m: Message) =>
    supabase!.from('messages').insert({
      id: m.id, request_id: m.requestId, sender_id: m.senderId,
      text: m.text, system: m.system ?? false,
    }),
  upsertMeet: (m: MeetIntent) =>
    supabase!.from('meets').upsert({
      request_id: m.requestId, initiated_by: m.initiatedBy, confirmed_by: m.confirmedBy ?? null,
    }),
  updateProfile: (id: string, patch: Partial<Profile>) =>
    supabase!.from('profiles').update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.age !== undefined && { age: patch.age }),
      ...(patch.location !== undefined && { location: patch.location }),
      ...(patch.education !== undefined && { education: patch.education }),
      ...(patch.career !== undefined && { career: patch.career }),
      ...(patch.timeline !== undefined && { timeline: patch.timeline }),
      ...(patch.about !== undefined && { about: patch.about }),
      ...(patch.email !== undefined && { email: patch.email }),
    }).eq('id', id),
  updateWali: (id: string, patch: Partial<Wali>) =>
    supabase!.from('walis').update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.relationship !== undefined && { relationship: patch.relationship }),
      ...(patch.contact !== undefined && { contact: patch.contact }),
    }).eq('id', id),
  setWaliMaySend: (womanId: string, may: boolean) =>
    supabase!.from('profiles').update({ wali_may_send: may }).eq('id', womanId),
  insertProfile: (p: Profile) =>
    supabase!.from('profiles').insert({
      id: p.id, role: p.role, name: p.name, age: p.age, location: p.location,
      education: p.education, career: p.career, timeline: p.timeline,
      about: p.about, email: p.email, wali_id: p.waliId ?? null,
    }),
  insertWali: (w: Wali) =>
    supabase!.from('walis').insert({
      id: w.id, name: w.name, relationship: w.relationship, contact: w.contact, ward_id: w.wardId,
    }),
  attachWali: (womanId: string, waliId: string) =>
    supabase!.from('profiles').update({ wali_id: waliId }).eq('id', womanId),
  clearDemo: async () => {
    await supabase!.from('meets').delete().neq('request_id', '');
    await supabase!.from('messages').delete().neq('id', '');
    await supabase!.from('requests').delete().neq('id', '');
    await supabase!.from('profiles').update({ wali_may_send: false }).neq('id', '');
  },
};

/** One channel for every table we care about. Fires `onChange` on any write. */
export function subscribeAll(onChange: () => void) {
  const client = supabase;
  if (!client) return () => {};
  const ch = client.channel('khitbah-live');
  ['profiles', 'requests', 'messages', 'meets'].forEach((table) =>
    ch.on('postgres_changes', { event: '*', schema: 'public', table }, onChange),
  );
  ch.subscribe();
  return () => { client.removeChannel(ch); };
}
