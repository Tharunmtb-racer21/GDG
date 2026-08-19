import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoolNet AI — Compound Heat–Grid Risk Intelligence",
  description:
    "Climate-risk decision-support platform identifying compound heat and grid-stress risk by ward, with explainability, forecasting, scenario simulation, and recommended preventive actions. Phase 1 demo build.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-base-950 text-ink-100">
        {children}
      </body>
    </html>
  );
}
