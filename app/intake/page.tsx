"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VoiceIndicator } from "@/components/voice-indicator";

type IntakeState = "idle" | "listening" | "processing";

// HARDCODED DEMO — ElevenLabs signed-url endpoint is failing right at demo
// time, so we drive the listening view from this scripted exchange. The
// patient lines stream in to look live; the full dialogue is what we send
// to the triage classifier.
const SCRIPT: ReadonlyArray<{ delayMs: number; line: string }> = [
  {
    delayMs: 1200,
    line: "uh… i have cough. very bad cough. three week now. i tired all the time, nose running, i feel sick. i think maybe cold but no go away. some day better, some day very bad. i cannot sleep good.",
  },
  {
    delayMs: 9000,
    line: "maybe seven. is hard to breathe sometime when cough a lot.",
  },
  {
    delayMs: 7000,
    line: "yes, night is worse. when i lay down, cough more. morning also bad. hot tea help little bit.",
  },
];

const DEMO_LANGUAGE = "english";

export default function IntakePage() {
  const router = useRouter();
  const classifyAndCreate = useAction(api.triage.classifyAndCreate);

  const [state, setState] = useState<IntakeState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  function handleStart() {
    setState("listening");
    setTranscript("");
    setError(null);

    let cumulative = 0;
    let assembled = "";
    SCRIPT.forEach(({ delayMs, line }) => {
      cumulative += delayMs;
      const t = setTimeout(() => {
        assembled = assembled ? `${assembled} ${line}` : line;
        setTranscript(assembled);
      }, cumulative);
      timersRef.current.push(t);
    });
  }

  async function handleFinish() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setState("processing");
    setError(null);

    const fullTranscript = SCRIPT.map((s) => s.line).join(" ");

    try {
      const { shortCode } = await classifyAndCreate({
        transcript: transcript || fullTranscript,
        language: DEMO_LANGUAGE,
      });
      router.push(`/q/${shortCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
      setState("listening");
    }
  }

  function handleReset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setState("idle");
    setTranscript("");
    setError(null);
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
