# intake flow

## landing screen

display greeting in rotation (multilingual welcome):
- "Hello" (English)
- "Hola" (Spanish)
- "Ciao" (Italian)
- "Bonjour" (French)
- "Xin chào" (Vietnamese)
- "ਸਤ ਸ੍ਰੀ ਅਕਾਲ" (Punjabi)
- "你好" (Chinese)
- "مرحبا" (Arabic)

auto-detect spoken language on first utterance. respond in detected language for all follow-ups.

---

## step 1 — emergency screen

before anything else, ask:

> "Before we continue — are you experiencing any of the following?"

present as tappable options (visual + spoken):

- 🔴 Severe chest pain
- 🔴 Trouble breathing
- 🔴 Signs of stroke (face drooping, arm weakness, slurred speech)
- 🔴 Heavy bleeding
- 🔴 Another emergency

### if YES → emergency exit

do not proceed with intake. display + say:

> "Please call 911 or alert the front desk immediately. Show this screen to staff."

render large red alert card. end conversation.

### if NO → proceed to intake

---

## step 2 — chief complaint

> "Why are you here today?"

allow free-form voice response. extract what is volunteered. do not re-ask what was already answered.

---

## step 3 — basic intake (ask only what's missing)

| question | skip if already answered |
|---|---|
| Where is the pain or problem located? | ✓ |
| When did it start? | ✓ |
| How severe is it on a scale of 1 to 10? | ✓ |
| Is it constant or does it come and go? | ✓ |

---

## step 4 — OPQRST symptom detail (ask only what's missing)

| letter | question | skip if answered |
|---|---|---|
| O — Onset | Did it come on suddenly or gradually? | ✓ |
| P — Provocation/Palliation | What makes it better or worse? | ✓ |
| Q — Quality | How would you describe it? (sharp, dull, burning, pressure?) | ✓ |
| R — Radiation | Does it spread anywhere else? | ✓ |
| S — Severity | Pain scale 1–10 | ✓ |
| T — Time | How long does it last? Is it getting better or worse? | ✓ |

ask one question at a time. if patient answers multiple in one response, extract and skip covered items.

---

## step 5 — close

> "Thank you. Please show this screen to the front desk."

render triage card in english for staff.

---

## demo assumption

for demo purposes: patient is an **existing client**. system has access to:
- medical history
- current medications
- family history
- social history

no re-collection of background. focus entirely on present complaint.

---

## out of scope (v1)

- diagnosing or recommending treatment
- discussing wait times
- new patient registration flow
- document scanning (future)
