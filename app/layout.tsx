import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serifDisplay = Source_Serif_4({
  variable: "--font-serif-display",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Save Our Lithuanian Parishes",
    template: "%s — Save Our Lithuanian Parishes",
  },
  description:
    "The record of America's Lithuanian parishes — who built them, who closed them, and what decides which ones survive.",
};

const NAV = [
  { href: "/who-does-the-parish-belong-to", label: "The Article" },
  { href: "/parishes", label: "The Record" },
  { href: "/data", label: "The Data" },
  { href: "https://blog.saveourlithuanianparishes.org", label: "Dispatches" },
  { href: "/network", label: "The Network" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${serifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-rule">
          <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
              Save Our Lithuanian Parishes
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/report"
                className="rounded-md px-3.5 py-1.5 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "var(--mark-closed)" }}
              >
                Report
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-rule mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted space-y-2">
            <p>
              Working for one goal: civil title to Lithuanian parishes aligned
              with{" "}
              <Link
                href="/what-canon-law-says"
                className="underline hover:text-foreground"
              >
                what the Church&rsquo;s own law already says
              </Link>{" "}
              — a parish&rsquo;s property belongs to the parish.
            </p>
            <p>
              Every figure on this site is derived from the parish record and
              verified at build time. Source: the <em>Draugas</em> archive,
              2008–2026 — 2,768 issues searched.
            </p>
            <p>
              The dataset is open.{" "}
              <a
                href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
                className="underline hover:text-foreground"
              >
                Check our numbers
              </a>
              . Follow the{" "}
              <a
                href="https://blog.saveourlithuanianparishes.org"
                className="underline hover:text-foreground"
              >
                dispatches
              </a>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
