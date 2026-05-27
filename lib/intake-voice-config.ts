const EMERGENCY_TERMS: ReadonlyArray<{
  label: string;
  terms: readonly string[];
}> = [
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
];

export function extractEmergencyFlags(transcript: string) {
  const normalized = transcript.toLowerCase();

  return EMERGENCY_TERMS.filter((option) =>
    option.terms.some((term) => normalized.includes(term)),
  ).map((option) => option.label);
}

// ElevenLabs doesn't reliably expose the detected language through the
// browser SDK's message stream, so we infer from the first greeting word.
// Covers the demo languages; falls back to undefined (intake page defaults
// to "english").
export function inferLanguageFromGreeting(transcript: string) {
  const normalized = transcript.toLowerCase();

  if (/\bhola\b/.test(normalized)) return "spanish";
  if (/\bciao\b/.test(normalized)) return "italian";
  if (/\bbonjour\b/.test(normalized)) return "french";
  if (/\bnamaste\b/.test(normalized)) return "hindi";
  if (/\bhello\b|\bhi\b|\bhey\b/.test(normalized)) return "english";

  return undefined;
}
