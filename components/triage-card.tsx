import type { Triage } from "@/lib/triage-schema";

type TierMeta = { emoji: string; label: string };

const TIER_META: Record<Triage["tier"], TierMeta> = {
  urgent: { emoji: "🔴", label: "urgent" },
  standard: { emoji: "🟡", label: "standard" },
  "self-care": { emoji: "🟢", label: "self-care" },
};

export function TriageCard({ data }: { data: Triage }) {
  const meta = TIER_META[data.tier];

  return (
    <article
      aria-label="triage summary"
      className="
        w-full max-w-2xl
        bg-paper text-ink
        border border-line
        rounded-2xl
        p-8 sm:p-10 md:p-12
        flex flex-col gap-10
      "
    >
      <header className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ink-mute">
        <span>triage summary</span>
        <span>language · {data.language}</span>
      </header>

      <div className="flex items-center gap-6">
        <span
          aria-hidden="true"
          className="text-6xl md:text-7xl leading-none select-none"
        >
          {meta.emoji}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute mb-1">
            tier
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-ink leading-none tracking-tight">
            {meta.label}
          </h2>
        </div>
      </div>

      <section>
        <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute mb-4">
          summary
        </h3>
        <ul className="flex flex-col gap-3">
          {data.summary.map((line, i) => (
            <li
              key={i}
              className="font-serif text-xl md:text-2xl text-ink leading-snug flex gap-4"
            >
              <span aria-hidden="true" className="text-clay select-none">
                —
              </span>
              <span className="text-pretty">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-line">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute mb-2">
            estimated wait
          </h3>
          <p className="font-serif text-3xl md:text-4xl text-ink tracking-tight tabular-nums">
            {data.estimated_wait}
          </p>
        </div>
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute mb-2">
            next step
          </h3>
          <p className="font-serif text-2xl md:text-3xl text-ink leading-tight text-pretty font-medium">
            {data.suggested_next_step}
          </p>
        </div>
      </section>
    </article>
  );
}
