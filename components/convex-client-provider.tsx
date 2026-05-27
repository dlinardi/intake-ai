"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

const client = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!client) {
    if (typeof window !== "undefined") {
      console.warn(
        "[convex] NEXT_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` to provision a dev deployment.",
      );
    }
    return <>{children}</>;
  }
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
