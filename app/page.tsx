import { StartButton } from "@/components/start-button";

export default function HomePage() {
  return (
    <main className="min-h-svh bg-bone flex flex-col">
      <header className="px-6 sm:px-10 pt-8 flex items-center justify-between">
        <span className="text-ink text-base tracking-tight">intake</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          front desk · tablet
        </span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-ink-mute mb-10">
          welcome
        </p>

        <h1 className="font-serif text-ink text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight max-w-3xl text-balance">
          describe your symptoms{" "}
          <span className="italic text-clay">in any language</span>
        </h1>

        <p className="mt-10 max-w-md text-ink-soft text-lg leading-relaxed text-pretty">
          we&rsquo;ll listen, ask a few short questions, and prepare a summary
          for the nurse.
        </p>

        <div className="mt-14">
          <StartButton href="/intake" />
        </div>
      </section>

      <footer className="px-6 sm:px-10 pb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ink-mute">
        <span>emergency? dial 911</span>
        <span>multilingual</span>
      </footer>
    </main>
  );
}
