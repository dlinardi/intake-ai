import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = {
  href: ComponentProps<typeof Link>["href"];
  children?: ReactNode;
};

export function StartButton({ href, children = "start intake" }: Props) {
  return (
    <Link
      href={href}
      className="
        group inline-flex items-center gap-3
        rounded-full bg-clay text-paper
        px-10 py-5 text-lg
        tracking-tight
        transition-[background-color,transform]
        hover:bg-clay-soft
        active:scale-[0.985]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-clay/30
        touch-manipulation
      "
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="text-paper/85 transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
