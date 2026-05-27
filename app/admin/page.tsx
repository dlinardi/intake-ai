"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Tier = "urgent" | "standard" | "self-care";
type Status = "waiting" | "in-progress" | "completed" | "cancelled";
type Filter = "active" | "waiting" | "in-progress" | "all";

type AdminIntake = Doc<"intakes"> & { effectiveTier: Tier };

const TIER_META: Record<Tier, { emoji: string; label: string }> = {
  urgent: { emoji: "🔴", label: "urgent" },
  standard: { emoji: "🟡", label: "standard" },
  "self-care": { emoji: "🟢", label: "self-care" },
};

const STATUS_LABEL: Record<Status, string> = {
  waiting: "waiting",
  "in-progress": "in progress",
  completed: "done",
  cancelled: "cancelled",
};

const TIERS: Tier[] = ["urgent", "standard", "self-care"];
const STATUSES: Status[] = ["waiting", "in-progress", "completed", "cancelled"];

export default function AdminPage() {
  const intakes = useQuery(api.intakes.listForAdmin) as
    | AdminIntake[]
    | undefined;
  const overrideIntake = useMutation(api.intakes.overrideIntake);
  const updateStatus = useMutation(api.intakes.updateStatus);
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>("active");
  const [selectedId, setSelectedId] = useState<Id<"intakes"> | null>(null);
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_initials");
    if (stored) setInitials(stored);
  }, []);
  useEffect(() => {
    if (initials) localStorage.setItem("admin_initials", initials);
  }, [initials]);

  const { filtered, counts, selected } = useMemo(() => {
    if (!intakes)
      return {
        filtered: [] as AdminIntake[],
        counts: { waiting: 0, inProgress: 0 },
        selected: null as AdminIntake | null,
      };
    const filtered = intakes.filter((i) => {
      if (filter === "all") return true;
      if (filter === "waiting") return i.status === "waiting";
      if (filter === "in-progress") return i.status === "in-progress";
      return i.status === "waiting" || i.status === "in-progress";
    });
    const counts = {
      waiting: intakes.filter((i) => i.status === "waiting").length,
      inProgress: intakes.filter((i) => i.status === "in-progress").length,
    };
    const selected = selectedId
      ? (intakes.find((i) => i._id === selectedId) ?? null)
      : null;
    return { filtered, counts, selected };
  }, [intakes, filter, selectedId]);

  if (intakes === undefined) return <Loading />;

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-svh bg-bone flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-line">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="text-ink text-base tracking-tight hover:text-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm"
          >
            intake
          </Link>
          <h1 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            staff dashboard
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            <span>your initials</span>
            <input
              type="text"
              value={initials}
              onChange={(e) =>
                setInitials(e.target.value.toUpperCase().slice(0, 3))
              }
              maxLength={3}
              placeholder="—"
              className="w-12 bg-transparent border-b border-line focus:border-clay text-ink text-sm tracking-[0.1em] uppercase text-center focus:outline-none"
              aria-label="your initials"
              autoComplete="off"
              name="initials"
            />
          </label>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.22em] text-ink-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 rounded-sm px-1"
          >
            log out
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)]">
        <section
          className="border-b lg:border-b-0 lg:border-r border-line"
          aria-labelledby="patient-list-heading"
        >
          <div className="px-6 sm:px-10 py-6 flex items-center justify-between gap-4 flex-wrap">
            <h2
              id="patient-list-heading"
              className="font-serif text-2xl md:text-3xl text-ink tracking-tight"
            >
              patients{" "}
              <span className="text-ink-mute font-normal tabular-nums">
                · {counts.waiting} waiting · {counts.inProgress} in progress
              </span>
            </h2>
            <FilterPills value={filter} onChange={setFilter} />
          </div>

          <ul className="divide-y divide-line">
            {filtered.length === 0 && (
              <li className="px-6 sm:px-10 py-16 text-center text-ink-mute italic">
                no patients to show.
              </li>
            )}
            {filtered.map((intake, i) => {
              const meta = TIER_META[intake.effectiveTier];
              const queuePos =
                filter !== "all" && intake.status === "waiting" ? i + 1 : null;
              const isSelected = selectedId === intake._id;
              return (
                <li key={intake._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(intake._id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left px-6 sm:px-10 py-5 grid grid-cols-[2.5rem_minmax(0,5rem)_2rem_minmax(0,1fr)_auto] gap-4 items-center transition-colors ${
                      isSelected ? "bg-clay-tint" : "hover:bg-paper"
                    } focus-visible:outline-none focus-visible:bg-paper`}
                  >
                    <span className="font-serif text-2xl text-ink-mute tabular-nums">
                      {queuePos !== null ? queuePos : "—"}
                    </span>
                    <span
                      className="font-serif text-base text-ink tracking-[0.04em] tabular-nums"
                      translate="no"
                    >
                      {intake.shortCode}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-2xl leading-none select-none"
                    >
                      {meta.emoji}
                    </span>
                    <div className="min-w-0 flex flex-col gap-1">
                      <span className="text-ink truncate">
                        {intake.ai.summary[0] ?? "—"}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
                        {intake.language} · {STATUS_LABEL[intake.status]}
                        {intake.override ? " · staff-edited" : ""}
                      </span>
                    </div>
                    <span className="text-sm text-ink-soft tabular-nums whitespace-nowrap">
                      {intake.ai.estimated_wait}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="px-6 sm:px-10 py-8">
          {selected ? (
            <DetailPanel
              key={selected._id}
              intake={selected}
              initials={initials}
              onOverride={(args) => overrideIntake(args)}
              onStatus={(status) =>
                updateStatus({ id: selected._id, status })
              }
            />
          ) : (
            <EmptyDetail />
          )}
        </section>
      </div>
    </main>
  );
}

function FilterPills({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  const options: { id: Filter; label: string }[] = [
    { id: "active", label: "active" },
    { id: "waiting", label: "waiting" },
    { id: "in-progress", label: "in progress" },
    { id: "all", label: "all" },
  ];
  return (
    <div
      role="group"
      aria-label="filter patients"
      className="flex items-center gap-1 rounded-full bg-paper border border-line p-1"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`text-xs uppercase tracking-[0.16em] px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${
            value === o.id
              ? "bg-ink text-paper"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
      <p className="font-serif italic text-xl text-ink-mute">
        select a patient to review
      </p>
    </div>
  );
}

function DetailPanel({
  intake,
  initials,
  onOverride,
  onStatus,
}: {
  intake: AdminIntake;
  initials: string;
  onOverride: (args: {
    id: Id<"intakes">;
    tier?: Tier;
    note?: string;
    by: string;
  }) => Promise<unknown>;
  onStatus: (status: Status) => Promise<unknown>;
}) {
  const [tier, setTier] = useState<Tier>(intake.effectiveTier);
  const [note, setNote] = useState<string>(intake.override?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState<Status | null>(null);

  const meta = TIER_META[intake.effectiveTier];
  const tierChanged = tier !== intake.effectiveTier;
  const noteChanged = note !== (intake.override?.note ?? "");
  const dirty = tierChanged || noteChanged;

  async function handleSaveOverride() {
    setSaving(true);
    try {
      await onOverride({
        id: intake._id,
        tier,
        note: note.trim() || undefined,
        by: initials || "staff",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(s: Status) {
    if (intake.status === s) return;
    setStatusSaving(s);
    try {
      await onStatus(s);
    } finally {
      setStatusSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-9">
      <header className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            code
          </span>
          <span
            className="font-serif text-3xl md:text-4xl text-ink tracking-[0.04em] tabular-nums"
            translate="no"
          >
            {intake.shortCode}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            tier
          </span>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="text-3xl leading-none select-none"
            >
              {meta.emoji}
            </span>
            <span className="font-serif text-2xl text-ink">{meta.label}</span>
          </div>
          {intake.override?.tier && intake.override.tier !== intake.ai.tier && (
            <span className="text-xs text-ink-mute italic">
              ai said: {intake.ai.tier} · changed by {intake.override.by}
            </span>
          )}
        </div>
      </header>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleStatus(s)}
            aria-pressed={intake.status === s}
            disabled={intake.status === s || statusSaving !== null}
            className={`text-xs uppercase tracking-[0.16em] px-3 py-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${
              intake.status === s
                ? "bg-ink text-paper"
                : "border border-line text-ink-soft hover:bg-paper hover:text-ink"
            } disabled:cursor-default`}
          >
            {statusSaving === s ? "saving…" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          raw transcript (patient&rsquo;s own words)
        </h3>
        <p className="font-serif text-lg leading-relaxed text-ink bg-paper border border-line rounded-xl p-5 text-pretty whitespace-pre-wrap break-words">
          {intake.transcript}
        </p>
        <p className="text-xs text-ink-mute">language: {intake.language}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          ai summary
        </h3>
        <ul className="flex flex-col gap-2">
          {intake.ai.summary.map((s: string, i: number) => (
            <li
              key={i}
              className="font-serif text-lg text-ink leading-snug flex gap-3"
            >
              <span aria-hidden="true" className="text-clay">
                —
              </span>
              <span className="text-pretty">{s}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-soft mt-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute mr-2">
            next step
          </span>
          {intake.ai.suggested_next_step}
        </p>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          override
        </h3>

        <div
          role="radiogroup"
          aria-label="tier override"
          className="flex items-center gap-2 flex-wrap"
        >
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tier === t}
              onClick={() => setTier(t)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${
                tier === t
                  ? "bg-clay text-paper"
                  : "border border-line text-ink-soft hover:bg-paper hover:text-ink"
              }`}
            >
              <span aria-hidden="true">{TIER_META[t].emoji}</span>
              <span>{TIER_META[t].label}</span>
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            note (optional)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="why this change?"
            spellCheck={true}
            className="bg-paper border border-line rounded-xl px-4 py-3 text-base text-ink focus:outline-none focus:border-clay/60 resize-none"
          />
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSaveOverride}
            disabled={!dirty || saving}
            className="rounded-full bg-ink text-paper px-5 py-2.5 text-sm hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
          >
            {saving ? "saving…" : "save override"}
          </button>
          {intake.override && (
            <span className="text-xs text-ink-mute">
              last updated by {intake.override.by} ·{" "}
              {new Date(intake.override.at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function Loading() {
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
