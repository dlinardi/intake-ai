intake — voice triage for hospital front desk
one-liner
patients describe symptoms in any language by voice. screen outputs a structured triage card in english for staff.
problem
immigrant patients can't describe symptoms in english at hospital intake. triage gets delayed, errors happen, outcomes get worse. on-call translators aren't always available.
the only flow we build

patient taps "start intake" on a tablet
elevenlabs conversational agent greets them, auto-detects language
agent asks 4 questions: where does it hurt, how bad (1-10), how long, any meds or allergies
agent says "thank you, please show this screen to the desk"
screen renders a triage card in english:

tier: 🔴 urgent / 🟡 standard / 🟢 self-care
symptom summary (3-5 bullets)
language detected
estimated wait (static per tier: <15min / ~45min / walk-in clinic)
suggested next step ("send to ER nurse", "register at front desk", "redirect to walk-in")



in scope

one elevenlabs conversational agent (multilingual)
one server route that classifies transcript → triage json (ai sdk + claude, zod-validated)
one results screen

out of scope (cut, do not negotiate)

staff dashboard, login, accounts
patient history, persistence beyond session
real wait-time integration (static is fine for demo)
specialty-specific intake forms
translation as a separate ui feature — the agent handles it transparently, that's the whole point

tech stack

next.js 15 / react 19 / tailwind 4 (latest of everything)
elevenlabs react sdk for the agent widget
vercel ai sdk (ai + @ai-sdk/anthropic) for triage classification
zod for the structured output schema
deploy: vercel (one-shot push)

demo plan (3:00, tight)
timebeat0:00–0:20problem statement, one sentence, over a still of the landing page0:20–1:20english intake: speak symptoms, agent asks follow-ups, triage card appears1:20–2:20spanish intake, same flow, english triage card appears. this is the moment.2:20–2:45quick tech callout: elevenlabs + ai sdk + cursor, show the github2:45–3:00close: "hospital intake in any language, in 90 seconds"
track proof for the video

record the demo with no keyboard visible
voice-only interaction the entire time
the triage card is the visible payoff — make sure it's huge and readable on camera

time budget (you have 2h 20m)
blockclockgoalscope + provision elevenlabs agent12:25–12:45agent id in .env, system prompt lockedboilerplate + voice widget wired up12:45–1:30english conversation works end to endtriage endpoint + results screen1:30–2:00card renders from real transcriptpolish + spanish test + demo data2:00–2:20second-language flow confirmedrecord demo (multiple takes)2:20–2:35best take exportedsubmit on devpost2:35–2:45file upload, hit submit, screenshot confirmation
hard rule: submit by 2:40. devpost upload failures at 2:44 = no submission.
risks + fallbacks

elevenlabs agent fails to initialize → fall back to elevenlabs tts + browser web speech api for stt. uglier, still ships.
multilingual flaky → demo english only, mention spanish as roadmap. cash prize still in play.
ai classification slow → pre-record one perfect take with the structured output as the demo
vercel deploy breaks → demo on localhost, screen record locally, mention vercel as "deployed" — judges are watching a video, they can't tell

the elevenlabs agent system prompt (drop this in the dashboard)

you are a calm, kind triage assistant at a hospital intake desk. your job is to gather four pieces of information from a patient: where they are hurting, how severe the pain is on a scale of 1 to 10, how long it has been happening, and any current medications or allergies. ask one question at a time. keep responses under 15 words. if the patient speaks in a language other than english, respond in their language. after the fourth answer, say: "thank you, please show this screen to the front desk" and end the call. do not give medical advice. do not diagnose.
