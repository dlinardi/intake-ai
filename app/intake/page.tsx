"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VoiceIndicator } from "@/components/voice-indicator";

type IntakeState = "idle" | "listening" | "processing";

// PLACEHOLDER — used until the ElevenLabs widget is wired up so the demo flow
// can still produce a believable transcript end-to-end.
const PLACEHOLDER_TRANSCRIPT =
  "patient reports sharp pain in the lower right abdomen, started about four hours ago, rates pain six out of ten, worsens with movement. no nausea or fever. currently takes lisinopril daily.";

export default function IntakePage() {
  const router = useRouter();
  const classifyAndCreate = useAction(api.triage.classifyAndCreate);

  const [state, setState] = useState<IntakeState>("idle");
  const [transcript, setTranscript] = useState("");
  const [language] = useState("english");
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    // TODO: wire up — start ElevenLabs conversation; stream partial transcript
    // into setTranscript as the patient speaks.
    setState("listening");
  }

  async function handleFinish() {
    // TODO: wire up — end ElevenLabs session and pass its final transcript +
    // detected language to classifyAndCreate (instead of the placeholder).
    setState("processing");
    setError(null);
    try {
      const { shortCode } = await classifyAndCreate({
        transcript: transcript || PLACEHOLDER_TRANSCRIPT,
        language,
      });
      router.push(`/q/${shortCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
      setState("listening");
    }
  }

  function handleReset() {
    setState("idle");
    setTranscript("");
    setError(null);
  }

  // Mark setTranscript as intentionally retained for the ElevenLabs wiring step.
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
        {state !== "idle" && state !== "processing" && (
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
          <ListeningView
            transcript={transcript}
            onFinish={handleFinish}
            error={error}
          />
        )}
        {state === "processing" && <ProcessingView />}
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
  error,
}: {
  transcript: string;
  onFinish: () => void;
  error: string | null;
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
      {error && (
        <p role="alert" className="mt-6 text-sm text-clay">
          {error}
        </p>
      )}
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

function ProcessingView() {
  return (
    <div
      className="flex flex-col items-center text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-10">
        preparing your summary
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight max-w-md text-balance">
        one moment <span className="italic text-clay">…</span>
      </h1>
      <p className="mt-6 max-w-md text-ink-soft text-lg leading-relaxed">
        we&rsquo;re classifying your symptoms and finding your place in line.
      </p>
      <div className="mt-12 h-12 w-12 rounded-full border-2 border-line border-t-clay motion-safe:animate-spin" />
    </div>
  );
}
