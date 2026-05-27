"use client";

import { useState } from "react";
import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import { VoiceIndicator } from "@/components/voice-indicator";
import { TriageCard } from "@/components/triage-card";
import {
  EMERGENCY_OPTIONS,
  ENTRY_GREETINGS,
  EMERGENCY_SCREEN_QUESTION,
} from "@/lib/intake-voice-config";
import type { Triage } from "@/lib/triage-schema";
import { useVoiceIntake, type VoiceIntakeResult } from "@/hooks/use-voice-intake";

export default function IntakePage() {
  return (
    <ConversationProvider>
      <IntakeExperience />
    </ConversationProvider>
  );
}

function IntakeExperience() {
  const voice = useVoiceIntake();
  const [result, setResult] = useState<Triage | null>(null);

  async function handleStart() {
    setResult(null);
    await voice.start();
  }

  async function handleFinish() {
    const voiceResult = await voice.finish();
    setResult(buildDemoTriage(voiceResult));
  }

  function handleReset() {
    voice.reset();
    setResult(null);
  }

  return (
    <main className="min-h-svh bg-bone flex flex-col">
      <header className="px-6 sm:px-10 pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-ink text-base tracking-tight hover:text-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm"
        >
          intake
        </Link>
        {(voice.status !== "idle" || result) && (
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
        {result ? (
          <CompleteView data={result} onReset={handleReset} />
        ) : voice.status === "idle" ? (
          <EntryView onStart={handleStart} />
        ) : (
          <ActiveIntakeView
            status={voice.status}
            error={voice.error}
            transcript={voice.transcript}
            language={voice.language}
            emergencyFlags={voice.emergencyFlags}
            onFinish={handleFinish}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}

function EntryView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-10">
        choose your language by voice
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight max-w-2xl text-balance">
        tap the circle and say{" "}
        <span className="italic text-clay">hello</span>
      </h1>
      <p className="mt-6 max-w-md text-ink-soft text-lg leading-relaxed text-pretty">
        the assistant will answer in your language and ask only the details the
        front desk needs.
      </p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {ENTRY_GREETINGS.map((greeting) => (
          <li
            key={greeting.text}
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-soft"
          >
            <span className="text-ink">{greeting.text}</span>{" "}
            <span className="text-ink-mute">· {greeting.language}</span>
          </li>
        ))}
      </ul>
      <div className="mt-14">
        <VoiceIndicator state="idle" onStart={onStart} />
      </div>
    </div>
  );
}

function ActiveIntakeView({
  status,
  error,
  transcript,
  language,
  emergencyFlags,
  onFinish,
  onReset,
}: {
  status: ReturnType<typeof useVoiceIntake>["status"];
  error: string | null;
  transcript: string;
  language?: string;
  emergencyFlags: string[];
  onFinish: () => void;
  onReset: () => void;
}) {
  const showEmergencyScreen = transcript || status === "speaking";
  const isBusy = status === "requesting-permission" || status === "connecting";

  return (
    <div className="flex flex-col items-center text-center w-full">
      <p className="text-[11px] uppercase tracking-[0.24em] text-clay mb-8 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-clay motion-safe:animate-pulse"
        />
        {formatStatus(status)}
      </p>
      <h1 className="sr-only">voice intake in progress</h1>
      <VoiceIndicator state={status === "error" ? "idle" : "listening"} />

      {language && (
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          detected language · {language}
        </p>
      )}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="mt-10 w-full max-w-2xl min-h-[6.5rem]"
      >
        {error ? (
          <div className="rounded-2xl border border-line bg-paper p-6">
            <p className="font-serif text-2xl md:text-3xl text-ink leading-snug text-balance">
              we couldn&rsquo;t start the voice session
            </p>
            <p className="mt-4 text-ink-soft leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={onReset}
              className="mt-6 text-sm text-ink-soft underline underline-offset-[6px] decoration-line hover:text-ink hover:decoration-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm px-1"
            >
              try again
            </button>
          </div>
        ) : transcript ? (
          <p className="font-serif text-2xl md:text-3xl text-ink leading-snug text-balance">
            {transcript}
          </p>
        ) : (
          <p className="font-serif italic text-xl md:text-2xl text-ink-mute leading-snug">
            {isBusy
              ? "starting the secure voice session…"
              : "your words will appear here as you speak…"}
          </p>
        )}
      </div>

      {showEmergencyScreen && !error && (
        <EmergencyScreen emergencyFlags={emergencyFlags} />
      )}

      <button
        type="button"
        onClick={onFinish}
        disabled={isBusy || status === "error"}
        className="mt-14 text-sm text-ink-soft underline underline-offset-[6px] decoration-line hover:text-ink hover:decoration-clay disabled:opacity-40 disabled:hover:text-ink-soft disabled:hover:decoration-line transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm px-1"
      >
        finish intake
      </button>
    </div>
  );
}

function EmergencyScreen({ emergencyFlags }: { emergencyFlags: string[] }) {
  return (
    <section
      aria-label="emergency symptoms"
      className="mt-10 w-full max-w-3xl rounded-2xl border border-line bg-paper p-6 sm:p-8 text-left"
    >
      <h2 className="font-serif text-2xl md:text-3xl text-ink tracking-tight text-balance">
        {EMERGENCY_SCREEN_QUESTION}
      </h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {EMERGENCY_OPTIONS.map((option) => {
          const active = emergencyFlags.includes(option.label);

          return (
            <li
              key={option.label}
              className={[
                "rounded-full border px-4 py-2 text-sm",
                active
                  ? "border-clay bg-clay-tint text-ink"
                  : "border-line bg-bone text-ink-soft",
              ].join(" ")}
            >
              {option.label}
            </li>
          );
        })}
      </ul>
    </section>
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

function buildDemoTriage(result: VoiceIntakeResult): Triage {
  const hasEmergency = result.emergencyFlags.length > 0;
  const summary = result.transcript
    ? result.transcript
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4)
    : ["voice intake completed", "transcript pending from ElevenLabs session"];

  if (result.emergencyFlags.length > 0) {
    summary.unshift(`emergency screen flagged: ${result.emergencyFlags.join(", ")}`);
  }

  return {
    tier: hasEmergency ? "urgent" : "standard",
    summary: summary.slice(0, 5),
    language: result.language ?? "unknown",
    estimated_wait: hasEmergency ? "<15 min" : "~45 min",
    suggested_next_step: hasEmergency
      ? "send to ER nurse immediately"
      : "register at the front desk for triage nurse evaluation",
  };
}

function formatStatus(status: ReturnType<typeof useVoiceIntake>["status"]) {
  switch (status) {
    case "requesting-permission":
      return "requesting microphone";
    case "connecting":
      return "connecting";
    case "speaking":
      return "assistant speaking";
    case "complete":
      return "complete";
    case "error":
      return "voice unavailable";
    default:
      return "listening";
  }
}
