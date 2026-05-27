export const ENTRY_GREETINGS = [
  { text: "Hello", language: "English" },
  { text: "Hola", language: "Spanish" },
  { text: "Ciao", language: "Italian" },
  { text: "Bonjour", language: "French" },
  { text: "Namaste", language: "Hindi" },
] as const;

export const EMERGENCY_OPTIONS = [
  {
    label: "severe chest pain",
    terms: ["chest pain", "severe chest", "heart pain"],
  },
  {
    label: "trouble breathing",
    terms: ["trouble breathing", "shortness of breath", "cannot breathe"],
  },
  {
    label: "signs of stroke",
    terms: ["stroke", "face drooping", "arm weakness", "slurred speech"],
  },
  {
    label: "heavy bleeding",
    terms: ["heavy bleeding", "severe bleeding", "bleeding a lot"],
  },
  {
    label: "another emergency",
    terms: ["emergency", "fainting", "allergic reaction", "anaphylaxis"],
  },
] as const;

export const CHIEF_COMPLAINT_PROMPTS = [
  "Where is the pain or problem located?",
  "When did it start?",
  "How severe is it from 1 to 10?",
  "Is it constant, or does it come and go?",
] as const;

export const OPQRST_PROMPTS = [
  "Did it come on suddenly or gradually?",
  "What makes it better or worse?",
  "How would you describe it, such as sharp, dull, burning, or pressure?",
  "Does it spread anywhere else?",
  "What number would you give it from 1 to 10?",
  "How long does it last, and is it getting better or worse?",
] as const;

export const EMERGENCY_SCREEN_QUESTION =
  "Before we continue, are you having chest pain, trouble breathing, severe bleeding, fainting, stroke-like symptoms such as face drooping or arm weakness, severe allergic reaction, or another emergency?";

export const INTAKE_AGENT_MAIN_GOAL = `
You are a calm hospital intake assistant for a front-desk kiosk. Your goal is to help patients describe why they are here in their own language, collect only the key symptom details needed for pre-triage, and produce a clear conversation transcript for clinical staff review.

Start by greeting the patient in their detected language. Ask why they are here today. After their first answer, always ask whether they are having chest pain, trouble breathing, severe bleeding, fainting, stroke-like symptoms such as face drooping or arm weakness, severe allergic reaction, or another emergency.

If they indicate an emergency symptom, do not diagnose or give medical advice. Calmly tell them to show the screen to the front desk immediately, then end the conversation.

If they do not indicate an emergency, ask only missing follow-up questions about the current problem: where it is located, when it started, severity from 1 to 10, whether it is constant or comes and goes, what makes it better or worse, how it feels, whether it spreads, and whether it is getting better or worse.

Ask one question at a time. Keep responses short. Do not diagnose, recommend treatment, or discuss wait times. If the patient speaks a language other than English, respond in that language. End by saying: "Thank you, please show this screen to the front desk."
`.trim();

export function extractEmergencyFlags(transcript: string) {
  const normalized = transcript.toLowerCase();

  return EMERGENCY_OPTIONS.filter((option) =>
    option.terms.some((term) => normalized.includes(term)),
  ).map((option) => option.label);
}

export function inferLanguageFromGreeting(transcript: string) {
  const normalized = transcript.toLowerCase();

  if (/\bhola\b/.test(normalized)) {
    return "Spanish";
  }

  if (/\bciao\b/.test(normalized)) {
    return "Italian";
  }

  if (/\bbonjour\b/.test(normalized)) {
    return "French";
  }

  if (/\bnamaste\b/.test(normalized)) {
    return "Hindi";
  }

  if (/\bhello\b|\bhi\b|\bhey\b/.test(normalized)) {
    return "English";
  }

  return undefined;
}
