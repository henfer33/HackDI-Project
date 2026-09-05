// Sends a wali notification by SMS (Twilio) or email (Resend).
//
// Runs on Supabase Edge Functions so the provider keys stay on the server. They
// must never be bundled into the app: anyone can read strings out of a mobile
// binary, and a leaked Twilio key is billable.
//
// Deploy:   npx supabase functions deploy notify-wali --project-ref <ref>
// Secrets:  npx supabase secrets set RESEND_API_KEY=... EMAIL_FROM=...
//           npx supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM=...

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

interface Payload {
  channel: 'sms' | 'email';
  to: string;
  subject?: string;
  message: string;
}

async function sendViaApify(to: string, subject: string, message: string) {
  const token = Deno.env.get('APIFY_TOKEN');
  if (!token) return null;
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~send-mail/runs?token=${token}&waitForFinish=60`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text: message }),
    },
  );
  const body = await res.json().catch(() => null);
  const status = body?.data?.status;
  if (res.ok && status === 'SUCCEEDED') return { ok: true, id: body?.data?.id };
  return { ok: false, reason: 'provider', detail: status ? `Mail actor finished as ${status}.` : `Apify returned ${res.status}.` };
}

async function sendEmail(to: string, subject: string, message: string) {
  // Apify first when its token is set; Resend otherwise.
  const viaApify = await sendViaApify(to, subject, message);
  if (viaApify) return viaApify;

  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM');
  if (!key || !from) {
    return { ok: false, reason: 'unconfigured', detail: 'No email provider is configured (APIFY_TOKEN or RESEND_API_KEY).' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text: message }),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok
    ? { ok: true, id: body.id }
    : { ok: false, reason: 'provider', detail: body?.message ?? `Resend returned ${res.status}` };
}

async function sendSms(to: string, message: string) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_FROM');
  if (!sid || !token || !from) {
    return { ok: false, reason: 'unconfigured', detail: 'Twilio credentials are not set.' };
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: message }),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok
    ? { ok: true, id: body.sid }
    : { ok: false, reason: 'provider', detail: body?.message ?? `Twilio returned ${res.status}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ ok: false, reason: 'method' }, 405);

  let p: Payload;
  try {
    p = await req.json();
  } catch {
    return json({ ok: false, reason: 'bad-request', detail: 'Body must be JSON.' }, 400);
  }

  const to = (p.to ?? '').trim();
  const message = (p.message ?? '').trim();
  if (!to || !message) return json({ ok: false, reason: 'bad-request', detail: 'Missing "to" or "message".' }, 400);
  // A notification is short by nature; a long one is either a mistake or abuse.
  if (message.length > 1000) return json({ ok: false, reason: 'bad-request', detail: 'Message too long.' }, 400);

  const result =
    p.channel === 'email'
      ? await sendEmail(to, p.subject ?? 'A request on Khitbah', message)
      : await sendSms(to, message);

  return json({ ...result, channel: p.channel }, result.ok ? 200 : 502);
});
