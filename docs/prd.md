# frontdesk — PRD

## one-liner

Voice-first ER intake kiosk that triages patients in their own language and routes urgency to staff in English.

---

## problem

Non-English-speaking patients in Canadian ERs wait longer, get misclassified, and avoid care entirely because intake forms and triage nurses don't speak their language. Translators take 20+ minutes to arrive — when they arrive at all.

**firsthand context:** immigrant patients in Vietnamese and Punjabi cultural hubs travel far out of their way to find doctors who speak their language. that's the gap this closes.

---

## who it's for (demo narrative)

**Maria.** Recent immigrant. Chest pain. Speaks only Spanish. Walks into Toronto General at 11pm. No translator on shift.

---

## scope — one flow, end to end

1. patient taps **Start** → picks language from visual grid (flags, no reading required)
2. AI greets in that language: *"Tell me what's wrong. Take your time."*
3. patient describes symptoms conversationally; AI asks 2–3 follow-ups (duration, severity, location)
4. AI generates **staff-facing card in English**: symptoms, triage level (CTAS 1–5 or Red/Yellow/Green), estimated wait, key risk flags
5. patient sees **confirmation in their language** with estimated wait

that's it. six people will be tempted to add a hospital dashboard, patient history, SMS notifications. **cut all of it.**

---

## out of scope (do not build)

- auth, accounts, patient records
- real EHR integration
- real wait time data — mock it: Red = "seen immediately", Yellow = "~45 min", Green = "~2 hours"
- more than 2 languages for demo (English + Spanish OR Mandarin — pick based on who can verify translation sounds right)
- admin dashboard
- mobile app

---

## intake flow detail

### screen 1 — language picker
visual grid of flags. no text required. tap to select.

### screen 2 — emergency gate
before intake: ask if patient has any of:
- 🔴 severe chest pain
- 🔴 trouble breathing
- 🔴 signs of stroke (face drooping, arm weakness, slurred speech)
- 🔴 heavy bleeding
- 🔴 another emergency

**if yes:** "Please call 911 or alert the front desk immediately." show screen to staff. end.

**if no:** proceed.

### screen 3 — voice intake
AI asks in patient's language. one question at a time. extracts OPQRST:

| | question | skip if answered |
|---|---|---|
| Chief complaint | Why are you here today? | — |
| Location | Where is the pain/problem? | ✓ |
| Onset | When did it start? Sudden or gradual? | ✓ |
| Severity | 1–10 scale | ✓ |
| Time pattern | Constant or comes and goes? | ✓ |
| Provocation | What makes it better or worse? | ✓ |
| Quality | Sharp, dull, burning, pressure? | ✓ |
| Radiation | Does it spread anywhere? | ✓ |

### screen 4 — staff card (English)
rendered for nurse/desk:
- triage tier: 🔴 Red / 🟡 Yellow / 🟢 Green (CTAS 1–5)
- symptom summary (3–5 bullets)
- language detected
- estimated wait (static per tier)
- key risk flags
- suggested routing ("route to ER nurse immediately" / "register at front desk" / "redirect to walk-in")

### screen 5 — patient confirmation (their language)
simple: "The front desk has been notified. Estimated wait: ~45 minutes. Please take a seat."

---

## demo flow (3-min video script)

| time | beat |
|---|---|
| 0:00–0:20 | problem framing — Ontario ER stat, immigrant communication gap |
| 0:20–0:50 | Maria walks up to kiosk, picks Spanish, describes chest pain in Spanish |
| 0:50–1:40 | AI asks follow-ups, English triage card renders — Red flag, possible cardiac, route immediately |
| 1:40–2:20 | second persona: kid with fever, ends Yellow (~45min wait), confirmation in Tagalog |
| 2:20–2:50 | how we built it: ElevenLabs Conversational AI, Claude for triage reasoning, Next.js, language detection |
| 2:50–3:00 | "This costs $X to deploy per hospital. ERs in the GTA could pilot it tomorrow." |

**the Maria scene is the hero shot. get it perfect.**

---

## team allocation (6 people, 2h 20m)

| person | owns | output |
|---|---|---|
| tech lead | architecture, schema, integration | glues everything together |
| voice 1 | ElevenLabs agent setup + system prompt | agent that conducts intake in target language |
| voice 2 | triage logic — Claude API: transcript → structured CTAS output | `{level, symptoms, flags, est_wait}` |
| frontend 1 | kiosk UI — language picker, live transcript, "thinking" states | screen the patient sees |
| frontend 2 | staff card UI — English triage output | screen the nurse sees |
| demo lead | script, personas, recording, Devpost submission, backup takes | **the actual deliverable** |

**critical:** demo lead does NOT code. their job is the video. if recording starts at 2:05 and something breaks, they save the project.

---

## tech stack

| layer | choice |
|---|---|
| voice agent | ElevenLabs Conversational AI (multilingual) — also track-fit proof |
| triage reasoning | Claude API — transcript → structured CTAS JSON |
| framework | Next.js + Convex |
| fallback STT | browser Web Speech API if ElevenLabs streaming has issues |

---

## triage output schema

```json
{
  "level": "red | yellow | green",
  "ctas": 1,
  "symptoms": ["chest pain", "radiating to left arm", "onset 2 hours ago"],
  "flags": ["possible cardiac event", "age 50+"],
  "est_wait": "seen immediately",
  "routing": "route to ER nurse immediately",
  "language_detected": "es"
}
```

---

## liability framing (critical)

do NOT call this "diagnosis."

say: **"frontdesk doesn't diagnose — it makes sure the nurse sees the right patient first, in any language."**

in all copy, UI, and demo narration: "intake assistance" or "pre-triage." never "diagnosis."

---

## time budget

| block | window | goal |
|---|---|---|
| kickoff + assign roles | 12:25–12:35 | everyone knows their file |
| parallel build | 12:35–2:00 | all 5 streams running |
| integration + bug squash | 2:00–2:15 | hero demo path works on Maria input |
| record | 2:15–2:35 | at least 2 takes |
| submit | 2:35–2:40 | Devpost, with buffer |

**submit by 2:40. five-minute buffer for Devpost failures.**

---

## risks + fallbacks

| risk | fallback |
|---|---|
| ElevenLabs agent fails | ElevenLabs TTS + browser Web Speech API for STT |
| multilingual flaky | demo English only, mention Spanish as roadmap |
| Claude classification slow | pre-record one perfect take with hardcoded structured output |
| Vercel deploy breaks | demo on localhost, screen record locally |
