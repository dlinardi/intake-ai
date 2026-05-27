# intake

**voice triage in any language — for the hospital front desk.**

> patients describe symptoms in their own language. the tablet renders a structured english triage card for staff in under a minute.

---

## the problem

immigrant patients can't always describe symptoms in english at hospital intake. on-call translators aren't always available. triage gets delayed, errors happen, outcomes get worse.

translation apps treat translation as a separate step. it shouldn't be. the patient should just *speak*.

## what it does

a patient taps **start intake** on a tablet at the front desk.

1. an elevenlabs conversational agent greets them and **auto-detects the spoken language**
2. the agent asks four short questions — *where it hurts · severity (1–10) · how long · meds or allergies*
3. when the conversation ends, the transcript is classified by **claude** into a structured triage object (zod-validated at the response boundary)
4. the screen renders a high-contrast triage card in english for the desk:
   - tier — 🔴 urgent / 🟡 standard / 🟢 self-care
   - 3–5 bullet symptom summary
   - detected language
   - estimated wait
   - suggested next step

no patient ever has to type. no staff member ever has to translate.

## the demo moment

a patient walks up and speaks **spanish**. four short follow-ups. the screen renders an **english** triage card the desk can act on immediately.

that's the whole pitch — translation disappears as a separate ui feature, because the agent handles it transparently.

## stack

| layer | choice |
|---|---|
| framework | next.js 16 (app router, react 19) |
| ui | tailwind v4 · fraunces serif · single warm-clay accent |
| voice | [`@elevenlabs/react`](https://elevenlabs.io) conversational agent (multilingual) |
| triage | [vercel ai sdk](https://sdk.vercel.ai) + [`@ai-sdk/anthropic`](https://www.npmjs.com/package/@ai-sdk/anthropic) — claude with structured output |
| schema | [zod](https://zod.dev) v4, validated server-side |
| deploy | vercel |

## running it locally

```bash
git clone git@github.com:dlinardi/intake-ai.git
cd intake-ai
npm install
```

create `.env.local` at the repo root with three keys:

```
ELEVENLABS_AGENT_ID=
ELEVENLABS_API_KEY=
ANTHROPIC_API_KEY=
```

then:

```bash
npm run dev
```

open [localhost:3000](http://localhost:3000).

### elevenlabs agent setup

the conversational agent is configured in the elevenlabs dashboard. drop this system prompt in and copy the agent id into `.env.local`:

> you are a calm, kind triage assistant at a hospital intake desk. your job is to gather four pieces of information from a patient: where they are hurting, how severe the pain is on a scale of 1 to 10, how long it has been happening, and any current medications or allergies. ask one question at a time. keep responses under 15 words. if the patient speaks in a language other than english, respond in their language. after the fourth answer, say: "thank you, please show this screen to the front desk" and end the call. do not give medical advice. do not diagnose.

## project map

```
app/
  page.tsx              landing — single "start intake" cta
  intake/page.tsx       three states: idle · listening · complete
  api/triage/route.ts   POST { transcript, language } → triage json
components/
  start-button.tsx      landing cta
  voice-indicator.tsx   animated mic + listening orb
  triage-card.tsx       the on-camera payoff
lib/
  triage-schema.ts      shared zod schema + inferred type
```

## design notes

the triage card has to read from three feet away on a hospital desk. that constraint drove the whole design system:

- **one font family** (fraunces, two weights) for cohesion and warmth
- **one accent** (warm clay, never the default blue) so the tier indicator is the only "loud" element
- **paper-and-ink palette** — bone background, soft ink text — chosen to feel like medical paperwork, not a chatbot
- **emoji used only for tier**, nowhere else — they're a clinical signal, not decoration
- **lowercase everywhere** to lower the temperature of the room

## what we cut (on purpose)

scope was locked tight. these are explicitly out of v1:

- staff dashboard, login, accounts
- patient history / persistence beyond the session
- live wait-time integration (static estimates per tier are fine for demo)
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

built with [elevenlabs](https://elevenlabs.io) · [anthropic](https://anthropic.com) · [vercel](https://vercel.com)
