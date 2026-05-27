"use client";

type Props = {
  state: "idle" | "listening";
  onStart?: () => void;
};

export function VoiceIndicator({ state, onStart }: Props) {
  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={onStart}
        aria-label="start voice intake"
        className="
          relative
          h-44 w-44 md:h-56 md:w-56
          rounded-full
          bg-clay text-paper
          flex items-center justify-center
          ring-1 ring-clay-soft/40
          transition-[transform,background-color]
          hover:bg-clay-soft
          active:scale-[0.97]
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-clay/30
          touch-manipulation
        "
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full ring-1 ring-clay/40 motion-safe:[animation:pulse-ring_2.4s_ease-out_infinite]"
        />
        <MicIcon className="h-14 w-14 md:h-16 md:w-16" />
      </button>
    );
  }

  return (
    <div
      role="status"
      aria-label="listening"
      className="relative h-44 w-44 md:h-56 md:w-56 flex items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-clay/10 motion-safe:[animation:breathe_3s_ease-in-out_infinite]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-6 rounded-full bg-clay/20 motion-safe:[animation:breathe_3s_ease-in-out_infinite] motion-safe:[animation-delay:200ms]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-12 rounded-full bg-clay/40 motion-safe:[animation:breathe_3s_ease-in-out_infinite] motion-safe:[animation-delay:400ms]"
      />
      <span className="relative h-16 w-16 md:h-20 md:w-20 rounded-full bg-clay flex items-center justify-center">
        <MicIcon className="h-9 w-9 md:h-10 md:w-10 text-paper" />
      </span>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
