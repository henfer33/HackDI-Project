# Backend

## Schema

`schema.sql` is the whole database. Paste it into the Supabase SQL editor and run it.

## Sending SMS and email for real

`functions/notify-wali` sends a wali notification through Twilio (SMS) or Resend
(email). It runs on Supabase Edge Functions so the provider keys stay on the
server. Do not put those keys in `.env`: anything prefixed `EXPO_PUBLIC_` is
compiled into the app bundle, and strings can be read straight out of a mobile
binary. A leaked Twilio key is billable.

Until it is deployed and configured, the app falls back to opening the phone's
own Messages or Mail composer with the text ready. That path needs no keys and
works offline, but the person has to press send themselves.

### Deploy

```bash
npx supabase login
npx supabase functions deploy notify-wali --project-ref fwaglkvfvpzwtthicaxe
```

### Configure

Email, via [resend.com](https://resend.com). The free tier will only send to the
address you signed up with until you verify a domain:

```bash
npx supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="Khitbah <onboarding@resend.dev>"
```

SMS, via [twilio.com](https://twilio.com). A trial account can only send to
numbers you have verified in the console, and prefixes every message with a
trial notice:

```bash
npx supabase secrets set TWILIO_ACCOUNT_SID=ACxxx TWILIO_AUTH_TOKEN=xxx TWILIO_FROM=+15551234567
```

Set only the pair you need. With Resend configured and Twilio not, email sends
and SMS falls back to the composer.

### Check it

```bash
curl -X POST "https://fwaglkvfvpzwtthicaxe.supabase.co/functions/v1/notify-wali" \
  -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","to":"you@example.com","subject":"Test","message":"Test from Khitbah."}'
```

`{"ok":true,...}` means it sent. `{"reason":"unconfigured"}` means the secrets
are missing, and the app will use the composer instead.

## Before this touches real people

The access policies in `schema.sql` are wide open, and the function accepts any
recipient from any caller holding the publishable key. Both are fine for seeded
demo data and unacceptable beyond it. At minimum: real row-level security, and
the function taking a request id it verifies rather than a raw phone number.
