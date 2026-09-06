<h1 align="center">💍 Khitbah</h1>

<p align="center">
  <strong>Intent. Consent. Family.</strong><br/>
  A considered path to marriage for the Western Muslim diaspora.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-12352A?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-12352A?style=for-the-badge&logo=react&logoColor=7DE6A3" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-12352A?style=for-the-badge&logo=typescript&logoColor=7DE6A3" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-12352A?style=for-the-badge&logo=supabase&logoColor=7DE6A3" alt="Supabase" />
</p>

---

## Why we built it

Finding a spouse should bring clear intentions, family involvement, and personal choice together.

We built **Khitbah** as a marriage-app prototype designed around Sharia-compliant courtship. Wali involvement begins with the first introduction, and the woman's consent remains a separate, essential step.

## The journey

**Introduction → Wali approval → Her acceptance → Shared conversation → Mutual agreement to meet → Wali handoff**

Either approval stage can end with a decline. A conversation opens only after both gates are passed.

## What makes Khitbah different

| Principle | The experience |
| --- | --- |
| **Wali involvement from the start** | Introduction requests reach the wali before the woman. |
| **Her consent, always** | She independently accepts or declines after wali approval. |
| **Shared conversations** | The suitor, woman, and wali can access the conversation. The wali can always read; she decides whether he can write. |
| **A purposeful next step** | Both members of the couple must agree to meet before coordination passes to the wali. |

The MVP also includes profile discovery, role-specific inboxes, profile controls, and optional SMS or email notifications.

## System design

```mermaid
flowchart TB
    subgraph Client["APPLICATION · React Native + Expo"]
        UI["Suitor · Woman · Wali views"]
        Router["Expo Router"]
        Store["React Context Store<br/>Requests · Consent · Chat permissions"]
        Local["Seeded in-memory data<br/>Default demo mode"]
        Remote["Remote data adapter"]
        Notify["Notification handler"]

        UI <--> Router
        Router <--> Store
        Store <--> Local
        Store <-->|Optional live mode| Remote
        UI --> Notify
    end

    subgraph Backend["OPTIONAL BACKEND · Supabase"]
        DB[("Postgres<br/>Profiles · Walis · Requests<br/>Messages · Meeting intents")]
        RT["Realtime subscriptions"]
        Edge["notify-wali<br/>Edge Function"]

        DB --> RT
    end

    subgraph Delivery["NOTIFICATION DELIVERY"]
        Providers["Twilio · Apify · Resend<br/>SMS / Email"]
        Composer["Device SMS / Mail composer<br/>Fallback"]
    end

    Remote <-->|Read / Write| DB
    RT -->|Refresh data| Store
    Notify --> Edge
    Edge --> Providers
    Notify -->|When sender unavailable| Composer

    classDef green fill:#12352A,stroke:#7DE6A3,color:#F1FBE2
    classDef gold fill:#1E5240,stroke:#F4CE5E,color:#F1FBE2
    class UI,Router,Store,Local,Remote,Notify green
    class DB,RT,Edge,Providers,Composer gold
```

The core demo runs locally. Connecting Supabase adds persistence and updates across devices. Notifications use a separate delivery path, with an optional demo-only client Apify email fallback before the device composer.

## Built with

**React Native + Expo** for mobile and web · **TypeScript** for application logic · **Expo Router** for navigation · **React Context** for state · **Supabase** for optional persistence, live updates, and notification functions.

The visual identity pairs forest green, cream, mint, and gold with IBM Plex typography.

## Try the journey

Switch between **Yusuf**, **Maryam**, and **Imran** using **Settings → Viewing as** to experience the suitor, woman, and wali perspectives on one device.

**Send a request → approve as wali → accept as woman → open Messages → agree to meet.**

## Project status

Built during a **24-hour hackathon**. The default demo uses seeded, in-memory data; Supabase optionally enables shared data across devices.

Authentication, secure production permissions, and identity verification are not implemented. The prototype is intended for demo data.

---

<p align="center">
  <strong>💍 Khitbah — Intent. Consent. Family.</strong><br/>
  <a href="LICENSE">MIT License</a>
</p>
