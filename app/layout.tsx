import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "intake — voice triage for hospital front desk",
  description:
    "describe your symptoms in any language. we'll prepare a summary for the front desk.",
};

export const viewport: Viewport = {
  themeColor: "#f5f1ea",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-bone text-ink font-serif">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
