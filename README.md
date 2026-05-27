# intake

**voice triage in any language — for the hospital front desk.**

> patients describe symptoms in their own language. the tablet renders a structured english triage card for staff in under a minute. live queue + live admin dashboard, no refreshes.

---

## the problem

immigrant patients can't always describe symptoms in english at hospital intake. on-call translators aren't always available. triage gets delayed, errors happen, outcomes get worse.

translation apps treat translation as a separate step. it shouldn't be. the patient should just *speak*.

## what it does

a patient taps **start intake** on a tablet at the front desk.

1. an elevenlabs conversational agent greets them and **auto-detects the spoken language**
2. the agent asks four short questions — *where it hurts · severity (1–10) · how long · meds or allergies*
3. when the conversation ends, the transcript is classified by an llm into a structured triage object (zod-validated), and the row is written to convex
4. the patient is redirected to their own queue page (`/q/<code>`) with their spot in line, a qr code to follow on their phone, and the triage card for the desk handoff
5. staff see every new intake appear live on the admin dashboard (`/admin`), pin-gated, with the raw transcript, the ai analysis, and one-click controls to override the tier, add a note, or change status

no patient ever has to type. no staff member ever has to translate. nothing requires a page refresh — convex pushes updates to both views in real time.

## the demo moment

a patient walks up and speaks **spanish**. four short follow-ups. the screen renders an **english** triage card the desk can act on immediately — and in another window, the admin dashboard already shows the new row, sorted by tier.

that's the whole pitch — translation disappears as a separate ui feature, because the agent handles it transparently, and there's no "refresh to see new patients" beat because the dashboard is live.

## stack

| layer | choice |
|---|---|
| framework | next.js 16 (app router, react 19) |
| ui | tailwind v4 · fraunces serif · single warm-clay accent |
| voice | [`@elevenlabs/react`](https://elevenlabs.io) conversational agent (multilingual) |
| triage | [vercel ai sdk](https://sdk.vercel.ai) + [`@ai-sdk/openai`](https://www.npmjs.com/package/@ai-sdk/openai) — gpt with structured output |
| backend & realtime | [convex](https://convex.dev) — db, server functions, live queries |
| schema | [zod](https://zod.dev) v4, validated server-side |
| qr | [`qrcode.react`](https://www.npmjs.com/package/qrcode.react) |
| deploy | vercel |

## running it locally

```bash
git clone git@github.com:dlinardi/intake-ai.git
cd intake-ai
npm install
```

create `.env.local` at the repo root (already gitignored — `.env.local` is the file next.js loads in dev, no separate `.env` needed):

```
ELEVENLABS_AGENT_ID=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=

# auto-managed by `npx convex dev`
NEXT_PUBLIC_CONVEX_URL=

# any short string — used to unlock /admin
ADMIN_PIN=
```

then **in a separate terminal**, start the convex dev server (creates `convex/_generated/` types and pushes your schema + functions):

```bash
npx convex dev
```

first run will prompt you to log in (browser), then ask which project — pick the existing one (or create a new one). leave this running while you develop. it watches `convex/` for changes and re-pushes.

then in your main terminal:

```bash
npm run dev
```

open [localhost:3000](http://localhost:3000).

### convex environment variables

next.js's `.env.local` is for the next dev server. **convex actions** (e.g. the triage classifier) run on convex's own runtime and need their env vars set there:

```bash
npx convex env set OPENAI_API_KEY <your-key>
```

### elevenlabs agent setup

the conversational agent is configured in the elevenlabs dashboard. drop this system prompt in and copy the agent id into `.env.local`:

> you are a calm, kind triage assistant at a hospital intake desk. your job is to gather four pieces of information from a patient: where they are hurting, how severe the pain is on a scale of 1 to 10, how long it has been happening, and any current medications or allergies. ask one question at a time. keep responses under 15 words. if the patient speaks in a language other than english, respond in their language. after the fourth answer, say: "thank you, please show this screen to the front desk" and end the call. do not give medical advice. do not diagnose.

## routes

| path | who it's for | what it does |
|---|---|---|
| `/` | everyone | landing — single "start intake" cta |
| `/intake` | patient | three states: idle · listening · processing; calls the convex action on finish |
| `/q/[code]` | patient + desk | live queue position, qr to follow on phone, triage card for desk handoff |
| `/admin` | staff | pin-gated · live table sorted by priority · raw transcript, ai analysis, override controls |
| `/admin/login` | staff | pin entry |

## project map

```
app/
  page.tsx                     landing
  intake/page.tsx              voice intake flow (calls convex action)
  q/[code]/page.tsx            patient queue view + qr
  admin/page.tsx               staff dashboard (reactive)
  admin/login/page.tsx         pin entry
  api/admin/login/route.ts     pin check → sets httpOnly session cookie
  api/admin/logout/route.ts    clears cookie
convex/
  schema.ts                    intakes table + tier/status validators
  intakes.ts                   queries + mutations (create, getByShortCode, listForAdmin, override, updateStatus)
  triage.ts                    action — calls the llm, writes the row
components/
  start-button.tsx
  voice-indicator.tsx          animated mic + listening orb
  triage-card.tsx              the on-camera payoff
  convex-client-provider.tsx   wraps the app in ConvexProvider
lib/
  triage-schema.ts             shared zod schema + inferred type
middleware.ts                  /admin gate (session-cookie check)
```

## data model

```ts
intakes: {
  shortCode: "PT-49A2",                    // patient-facing, confusion-free alphabet
  transcript: "...",                        // raw — doctor reads this, not the summary
  language: "spanish",
  ai: { tier, summary[], suggested_next_step, estimated_wait },
  override?: { tier?, note?, by, at },      // staff edits — effective tier = override.tier ?? ai.tier
  status: "waiting" | "in-progress" | "completed" | "cancelled",
}
```

queue position is a *derived* reactive query: sort by effective tier → creation time → index of this code + 1. that means when an admin re-tiers a patient, every open `/q/<code>` page reshuffles instantly with zero extra code.

## design notes

the triage card has to read from three feet away on a hospital desk. that constraint drove the whole design system:

- **one font family** (fraunces, two weights) for cohesion and warmth
- **one accent** (warm clay, never the default blue) so the tier indicator is the only "loud" element
- **paper-and-ink palette** — bone background, soft ink text — chosen to feel like medical paperwork, not a chatbot
- **emoji used only for tier**, nowhere else — they're a clinical signal, not decoration
- **lowercase everywhere** to lower the temperature of the room

## what we cut

scope was locked tight. these are explicitly out of v1:

- account-per-staff identity & audit log (we store initials on the override but there's no real login behind it)
- patient history across visits
- live wait-time integration with the hospital's real scheduling system (static estimates per tier)
- specialty-specific intake forms
- a separate translation ui — the agent does it transparently

## team

| | github |
|---|---|
| dave | [@dlinardi](https://github.com/dlinardi) |
| melissa | [@mtatran](https://github.com/mtatran) |
| paarth | [@Pounce81](https://github.com/Pounce81) |
| kavir | [@kavir7](https://github.com/kavir7) |
| rithik | [@rithik279](https://github.com/rithik279) |
| will | [@willcagas](https://github.com/willcagas) |

---

built with [elevenlabs](https://elevenlabs.io) · [openai](https://openai.com) · [convex](https://convex.dev) · [vercel](https://vercel.com)
