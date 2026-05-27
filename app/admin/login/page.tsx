"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          data?.error === "admin_pin_not_configured"
            ? "ADMIN_PIN env var is not set on the server."
            : "incorrect pin.",
        );
      }
    } catch {
      setError("network error. try again.");
    } finally {
      setPending(false);
    }
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
        <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          staff access
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm flex flex-col gap-7"
        >
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-6">
              staff only
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-ink tracking-tight">
              enter your pin
            </h1>
          </div>

          <label className="flex flex-col gap-2">
            <span className="sr-only">staff pin</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-paper border border-line rounded-xl px-4 py-4 text-3xl tracking-[0.4em] text-center text-ink font-serif tabular-nums focus:outline-none focus:border-clay/60 transition-colors"
              placeholder="••••"
              name="pin"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-clay text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!pin || pending}
            className="rounded-full bg-clay text-paper px-6 py-4 text-base font-serif disabled:opacity-50 disabled:cursor-not-allowed hover:bg-clay-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-clay/30 transition-colors touch-manipulation"
          >
            {pending ? "checking…" : "unlock dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
