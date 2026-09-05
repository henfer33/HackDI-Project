import { Linking, Platform } from 'react-native';
import { supabase } from './supabase';
import { Wali, WaliNotify } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Only the characters people actually type in a number: digits, a leading +,
// and spaces, brackets, dots or dashes as separators.
const PHONE_CHARS = /^\+?[\d\s().-]+$/;

export type ContactKind = 'email' | 'phone' | 'invalid';

export function contactKind(contact: string): ContactKind {
  const c = contact.trim();
  if (EMAIL.test(c)) return 'email';
  if (PHONE_CHARS.test(c)) {
    // Count the digits rather than the length, so "(416) 555-0142" passes and
    // "12345" does not. E.164 allows up to 15.
    const n = c.replace(/\D/g, '').length;
    if (n >= 7 && n <= 15) return 'phone';
  }
  return 'invalid';
}

/** Which channel can actually be used for this contact, whatever the preference. */
export function channelFor(contact: string, preferred: WaliNotify): WaliNotify {
  const kind = contactKind(contact);
  if (preferred === 'app') return 'app';
  if (kind === 'email') return 'email';
  if (kind === 'phone') return 'sms';
  return 'app';
}

const digits = (s: string) => s.replace(/[^\d+]/g, '');

export type SendPath = 'server' | 'apify' | 'composer';
export interface SendResult {
  ok: boolean;
  channel: WaliNotify;
  path?: SendPath;
  reason?: string;
}

const APIFY_TOKEN = process.env.EXPO_PUBLIC_APIFY_TOKEN;

/**
 * Sends email through the apify/send-mail actor, called straight from the app.
 *
 * The token is compiled into the bundle, so anyone who installs the app can read
 * it. That is acceptable for a hackathon demo and not beyond one: the Edge
 * Function above is the real path, and it is tried first.
 *
 * Apify has no SMS sender, so this covers email only.
 */
async function sendViaApify(to: string, subject: string, message: string): Promise<SendResult | null> {
  if (!APIFY_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~send-mail/runs?token=${APIFY_TOKEN}&waitForFinish=60`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text: message }),
      },
    );
    const body = await res.json().catch(() => null);
    const status = body?.data?.status;
    if (res.ok && status === 'SUCCEEDED') return { ok: true, channel: 'email', path: 'apify' };
    return {
      ok: false,
      channel: 'email',
      path: 'apify',
      reason: status ? `The mail actor finished as ${status}.` : `Apify returned ${res.status}.`,
    };
  } catch {
    return null; // offline or blocked: let the composer take over
  }
}

/**
 * Asks the Edge Function to send it for real. Returns null when there is no
 * backend or no provider configured, so the caller can fall back.
 */
async function sendViaServer(
  channel: 'sms' | 'email',
  to: string,
  subject: string,
  message: string,
): Promise<SendResult | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke('notify-wali', {
      body: { channel, to, subject, message },
    });
    // Function missing, or the provider keys are not set: fall back quietly.
    if (error && !data) return null;
    if (data?.reason === 'unconfigured') return null;
    if (data?.ok) return { ok: true, channel, path: 'server' };
    return { ok: false, channel, path: 'server', reason: data?.detail ?? 'The sender rejected it.' };
  } catch {
    return null;
  }
}

/**
 * Opens the phone's own Messages or Mail composer, pre-filled and addressed.
 * Nothing is sent until the person taps send. No gateway, no API key, and no
 * message leaves the device behind their back.
 */
export async function notifyWali(
  wali: Wali,
  preferred: WaliNotify,
  subject: string,
  body: string,
): Promise<SendResult> {
  const channel = channelFor(wali.contact, preferred);
  if (channel === 'app') {
    return { ok: false, channel, reason: 'This wali has no phone or email on file.' };
  }

  // Send it properly if a provider is wired up. Only if none is available do we
  // hand the message to the person's own Messages or Mail app.
  const to = wali.contact.trim();
  const server = await sendViaServer(channel, to, subject, body);
  if (server) return server;

  if (channel === 'email') {
    const viaApify = await sendViaApify(to, subject, body);
    if (viaApify) return viaApify;
  }

  const url =
    channel === 'sms'
      // iOS wants & before the body, Android wants ?
      ? `sms:${digits(wali.contact)}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(body)}`
      : `mailto:${wali.contact.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return { ok: false, channel, path: 'composer', reason: 'This device cannot open that composer.' };
    }
    await Linking.openURL(url);
    return { ok: true, channel, path: 'composer' };
  } catch {
    return { ok: false, channel, path: 'composer', reason: 'Could not open the composer.' };
  }
}

export function requestMessage(waliName: string, wardName: string, suitorName?: string) {
  const who = suitorName ? `${suitorName} has` : 'Someone has';
  return (
    `Assalamu alaikum ${waliName}, ` +
    `${who} sent a request for ${wardName} on Khitbah. ` +
    `It is waiting for your review. Nothing reaches ${wardName.split(' ')[0]} until you approve it.`
  );
}
