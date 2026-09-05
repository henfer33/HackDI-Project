# Khitbah

A Sharia-compliant marriage app for the Western Muslim diaspora, where the wali is
structural rather than a toggle.

Hackathon MVP. React Native (Expo), in-memory state, no backend.

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` for the browser.

## The flow

The whole point sits in the request lifecycle, which has **two** gates:

```
man sends request
      │
      ▼
 pending_wali ──── wali declines ───▶ declined_wali
      │
   wali approves
      │
      ▼
 pending_woman ─── she declines ────▶ declined_woman
      │
   she accepts
      │
      ▼
   accepted  ──▶ group chat opens (man, woman, wali)
                       │
                 both agree to meet
                       │
                       ▼
              app hands over to the wali
```

Two things worth being explicit about:

**Her consent is a separate gate.** The wali screens the request; he does not decide
for her. In fiqh a woman's consent is a condition of the marriage — a wali facilitates,
he cannot compel. An app that let him accept on her behalf would be less compliant than
the mainstream apps it is competing with, not more.

**The wali always reads. Whether he writes is hers to decide.** He sees every message
in a chat he is party to, and that is not configurable. Whether he can also send
messages is a single switch on her settings, shown to no one else and scoped to her
alone. Both halves are enforced in `src/store.tsx` rather than the UI — `sendMessage`
rejects the wali unless that woman has enabled it.

**Everyone party to a chat can reach it.** The suitor, the woman and the wali each
have a Messages tab. The wali's lists the same conversations, marked read-only.

## Layout

```
app/
  _layout.tsx        root stack, font loading, provider
  (tabs)/
    _layout.tsx      bottom tabs; labels and badges follow the current role
    index.tsx        one tab, three faces — Find / Requests / Review
    messages.tsx     conversations for whoever is viewing
    me.tsx           own profile; the wali sees his ward instead
    settings.tsx     role switcher, locked guardianship rows, wali notify method
  person/[id].tsx    profile detail, send request, gate trail
  chat/[id].tsx      group chat, read-only for the wali
  onboarding.tsx     profile creation; wali capture required for women
src/
  types.ts           domain model and request lifecycle
  store.tsx          in-memory store; enforces the rules above
  seed.ts            demo profiles and walis
  theme.ts, ui.tsx   dark jungle palette and the component kit
  screens/
    Browse.tsx       filterable list of women's profiles
    HerRequests.tsx  her inbox
    WaliInbox.tsx    his inbox, with a small activity summary
    Gate.tsx         the two-gate progress trail, drawn
```

## Demoing it

Settings → "Viewing as" switches between Yusuf (suitor), Maryam (woman) and Imran
(wali) so the whole flow runs on one device. The tab bar relabels itself per role and
badges the pending count. "Reset demo data" clears everything.

Wali oversight and her consent are not settings at all — they are the flow, with no
UI to turn them off. The one guardianship control that exists, **Wali can send
messages**, belongs to the woman and appears only in her settings.

State is in memory only, so a reload starts over. That is deliberate for a 48-hour
build; there is no backend to configure and nothing to fail on venue wifi.

In development, `globalThis.__khitbah` exposes the store for driving the flow from a
console without tapping through screens.

## Deliberately not built

Payments, video calling, wali identity verification, religiosity filters or
verification, photo blur/reveal, selfie verification. All post-hackathon.

Religiosity is not filtered or verified anywhere by design — that is between the
individual and Allah.
