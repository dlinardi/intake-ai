"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/convex/_generated/api";
import { TriageCard } from "@/components/triage-card";

const STATUS_COPY: Record<
  "waiting" | "in-progress" | "completed" | "cancelled",
  { eyebrow: string; headline: string; tone: "neutral" | "active" | "done" }
> = {
  waiting: {
    eyebrow: "you're in line",
    headline: "we'll call you when it's your turn",
    tone: "neutral",
  },
  "in-progress": {
    eyebrow: "you're up",
    headline: "please head to the front desk now",
    tone: "active",
  },
  completed: {
    eyebrow: "complete",
    headline: "thank you — your visit has been recorded",
    tone: "done",
  },
  cancelled: {
    eyebrow: "cancelled",
    headline: "this intake was cancelled. please speak with the desk.",
    tone: "done",
  },
};

export default function QueuePage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code ?? "");
  const data = useQuery(api.intakes.getByShortCode, { shortCode: code });

  const [pageUrl, setPageUrl] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  if (data === undefined) return <LoadingState />;
  if (data === null) return <NotFoundState code={code} />;

  const { intake, position, ahead, effectiveTier } = data;
  const statusCopy = STATUS_COPY[intake.status];

  return (
    <main className="min-h-svh bg-bone flex flex-col">
      <header className="px-6 sm:px-10 pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-ink text-base tracking-tight hover:text-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm"
        >
          intake
        </Link>
        <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          your spot in line
        </span>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-10 md:py-14 flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-start">
          {/* left column: queue position + code + QR */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-4">
              {statusCopy.eyebrow}
            </p>

            {intake.status === "waiting" && position !== null ? (
              <div className="flex items-baseline gap-3">
                <span
                  className="font-serif text-[7rem] md:text-[10rem] leading-none text-ink tabular-nums"
                  aria-label={`number ${position} in line`}
                >
                  {position}
                </span>
                <span className="font-serif italic text-2xl md:text-3xl text-ink-mute">
                  in&nbsp;line
                </span>
              </div>
            ) : (
              <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight tracking-tight max-w-md text-balance">
                {statusCopy.headline}
              </h1>
            )}

            {intake.status === "waiting" && (
              <p className="mt-3 text-ink-soft text-lg">
                {ahead === 0
                  ? "you're next."
                  : `${ahead} ${ahead === 1 ? "person" : "people"} ahead of you · est. ${intake.ai.estimated_wait}`}
              </p>
            )}

            <div className="mt-10 flex flex-col items-center lg:items-start gap-5">
              <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
                your code
              </span>
              <span
                className="font-serif text-4xl md:text-5xl text-ink tracking-[0.04em] tabular-nums select-all"
                translate="no"
              >
                {intake.shortCode}
              </span>
            </div>

            {pageUrl && (
              <div className="mt-10 flex flex-col items-center lg:items-start gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
                  scan to follow on your phone
                </span>
                <div className="bg-paper border border-line rounded-2xl p-4">
                  <QRCodeSVG
                    value={pageUrl}
                    size={148}
                    bgColor="#fcfaf5"
                    fgColor="#1a1714"
                    level="M"
                  />
                </div>
              </div>
            )}
          </div>

          {/* right column: triage card for the desk handoff */}
          <div className="flex flex-col">
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-4">
              please show this to the front desk
            </p>
            <TriageCard
              data={{
                tier: effectiveTier,
                summary: intake.ai.summary,
                language: intake.language,
                suggested_next_step: intake.ai.suggested_next_step,
                estimated_wait: intake.ai.estimated_wait,
              }}
            />
            {intake.override && (
              <p className="mt-4 text-sm text-ink-soft italic">
                tier updated by staff
                {intake.override.note ? ` · "${intake.override.note}"` : ""}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-svh bg-bone flex items-center justify-center">
      <div
        className="h-10 w-10 rounded-full border-2 border-line border-t-clay motion-safe:animate-spin"
        role="status"
        aria-label="loading"
      />
    </main>
  );
}

function NotFoundState({ code }: { code: string }) {
  return (
    <main className="min-h-svh bg-bone flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-6">
        not found
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight tracking-tight max-w-md text-balance">
        we couldn&rsquo;t find code{" "}
        <span className="italic text-clay" translate="no">
          {code}
        </span>
      </h1>
      <p className="mt-6 max-w-md text-ink-soft text-lg">
        please ask the front desk for help, or start a new intake.
      </p>
      <Link
        href="/intake"
        className="mt-10 inline-flex items-center gap-3 rounded-full bg-clay text-paper px-8 py-4 text-base hover:bg-clay-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-clay/30 transition-colors touch-manipulation"
      >
        start a new intake →
      </Link>
    </main>
  );
}
