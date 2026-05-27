"use client";

import { useState } from "react";
import Link from "next/link";
import { VoiceIndicator } from "@/components/voice-indicator";
import { TriageCard } from "@/components/triage-card";
import type { Triage } from "@/lib/triage-schema";

type IntakeState = "idle" | "listening" | "complete";

// PLACEHOLDER — replace once /api/triage is wired up. Lets the design be
// reviewed end-to-end without the live conversation running.
const DEMO_TRIAGE: Triage = {
  tier: "standard",
  summary: [
    "sharp pain in lower right abdomen for the past four hours",
    "pain rated 6 out of 10, worsens with movement",
    "no nausea, no fever reported",
    "currently takes lisinopril for blood pressure",
  ],
  language: "english",
  suggested_next_step: "register at the front desk for triage nurse evaluation",
  estimated_wait: "~45 min",
};

export default function IntakePage() {
  const [state, setState] = useState<IntakeState>("idle");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<Triage | null>(null);

  function handleStart() {
    // TODO: wire up — start ElevenLabs conversation; stream partial transcript
    // into setTranscript as the patient speaks.
    setState("listening");
  }

  function handleFinish() {
    // TODO: wire up — end ElevenLabs session, POST {transcript, language} to
    // /api/triage, then setResult with the parsed Triage object.
    setResult(DEMO_TRIAGE);
    setState("complete");
  }

  function handleReset() {
    setState("idle");
    setTranscript("");
    setResult(null);
  }

  // Mark setTranscript as intentionally retained for the wiring step.
  void setTranscript;

  return (
    <main className="min-h-svh bg-bone flex flex-col">
      <header className="px-6 sm:px-10 pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-ink text-base tracking-tight hover:text-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm"
        >
          intake
        </Link>
        {state !== "idle" && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] uppercase tracking-[0.22em] text-ink-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm px-1"
          >
            start over
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12">
        {state === "idle" && <IdleView onStart={handleStart} />}
        {state === "listening" && (
          <ListeningView transcript={transcript} onFinish={handleFinish} />
        )}
        {state === "complete" && result && (
          <CompleteView data={result} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}

function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-10">
        ready
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight max-w-2xl text-balance">
        tap the circle{" "}
        <span className="italic text-clay">and start speaking</span>
      </h1>
      <p className="mt-6 max-w-md text-ink-soft text-lg leading-relaxed text-pretty">
        speak in any language. the assistant will ask four short questions.
      </p>
      <div className="mt-14">
        <VoiceIndicator state="idle" onStart={onStart} />
      </div>
    </div>
  );
}

function ListeningView({
  transcript,
  onFinish,
}: {
  transcript: string;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center w-full">
      <p className="text-[11px] uppercase tracking-[0.24em] text-clay mb-8 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-clay motion-safe:animate-pulse"
        />
        listening
      </p>
      <h1 className="sr-only">listening to patient</h1>
      <VoiceIndicator state="listening" />
      <div
        aria-live="polite"
        aria-atomic="false"
        className="mt-12 w-full max-w-2xl min-h-[6.5rem]"
      >
        {transcript ? (
          <p className="font-serif text-2xl md:text-3xl text-ink leading-snug text-balance">
            {transcript}
          </p>
        ) : (
          <p className="font-serif italic text-xl md:text-2xl text-ink-mute leading-snug">
            your words will appear here as you speak…
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onFinish}
        className="mt-14 text-sm text-ink-soft underline underline-offset-[6px] decoration-line hover:text-ink hover:decoration-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm px-1"
      >
        i&rsquo;m done speaking
      </button>
    </div>
  );
}

function CompleteView({
  data,
  onReset,
}: {
  data: Triage;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-8">
        please show this to the front desk
      </p>
      <h1 className="sr-only">triage summary</h1>
      <TriageCard data={data} />
      <button
        type="button"
        onClick={onReset}
        className="mt-10 text-sm text-ink-soft underline underline-offset-[6px] decoration-line hover:text-ink hover:decoration-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm px-1"
      >
        new intake
      </button>
    </div>
  );
}
