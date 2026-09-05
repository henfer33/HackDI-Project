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

**The wali reads, he does not speak.** He sees every message in the chat and can send
none. This is enforced in `src/store.tsx`, not just hidden in the UI — `sendMessage`
rejects any sender who is not the man or the woman on that request.

## Layout

```
app/
  _layout.tsx       root stack + provider
  index.tsx         demo home / role switcher
  onboarding.tsx    profile creation; wali capture is required for women
  browse.tsx        men browse and filter
  profile/[id].tsx  profile detail, send request
  wali.tsx          wali inbox — approve / decline
  requests.tsx      her inbox — accept / decline (post-wali)
  chat/[id].tsx     group chat, read-only for the wali
src/
  types.ts          domain model and request lifecycle
  store.tsx         in-memory store; enforces the rules above
  seed.ts           demo profiles and walis
  theme.ts, ui.tsx  shared styling and components
```

## Demoing it

The home screen is a role switcher — tap between Yusuf (man), Maryam (woman) and
Imran (wali) to walk the whole flow on one device. "Reset demo data" clears it.

State is in memory only, so a reload starts over. That is deliberate for a 48-hour
build; there is no backend to configure and nothing to fail on venue wifi.

In development, `globalThis.__khitbah` exposes the store for driving the flow from a
console without tapping through screens.

## Deliberately not built

Payments, video calling, wali identity verification, religiosity filters or
verification, photo blur/reveal, selfie verification. All post-hackathon.

Religiosity is not filtered or verified anywhere by design — that is between the
individual and Allah.
