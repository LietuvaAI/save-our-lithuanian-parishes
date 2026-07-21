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
  { href: "/record", label: "The Record" },
  { href: "/reversals", label: "Reversals" },
  { href: "/start-here", label: "Start Here" },
  { href: "/parishes", label: "Parish Profiles" },
  { href: "https://blog.saveourlithuanianparishes.org", label: "Blog" },
  { href: "/about", label: "About" },
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
              Every figure on this site is recalculated automatically from
              the parish record — never typed in by hand. The canon: the
              full run of the{" "}
              <em>Draugas</em> archive since 1909 — the 2008–2026 issues, all
              2,768, read straight through; the 1909–2007 run mined issue by
              issue — with published parish histories and the national
              reversal research.
            </p>
            <p>
              The dataset is open.{" "}
              <a
                href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
                className="underline hover:text-foreground"
              >
                Check our numbers
              </a>
              . Dispatches, alerts, and campaigns:{" "}
              <a
                href="https://blog.saveourlithuanianparishes.org"
                className="underline hover:text-foreground"
              >
                Židinys (The Hearth)
              </a>
              .
            </p>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <Link href="/now" className="hover:text-foreground">
                Happening now
              </Link>
              <Link href="/record" className="hover:text-foreground">
                The Record
              </Link>
              <Link href="/reversals" className="hover:text-foreground">
                Reversals
              </Link>
              <Link href="/start-here" className="hover:text-foreground">
                Start Here
              </Link>
              <Link href="/parishes" className="hover:text-foreground">
                Parish Profiles
              </Link>
              <Link href="/about-the-data" className="hover:text-foreground">
                About the data
              </Link>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link
                href="/report"
                className="font-medium hover:text-foreground"
              >
                Report from your parish
              </Link>
            </nav>
            <p className="pt-3 mt-1 border-t border-rule">
              © 2026 Save Our Lithuanian Parishes · an initiative powered by
              Lietuva.AI · a documented record, not legal or canonical advice
              ·{" "}
              <Link
                href="/legal"
                className="underline hover:text-foreground"
              >
                Legal, attribution &amp; data use
              </Link>{" "}
              ·{" "}
              <a
                href="mailto:info@saveourlithuanianparishes.org"
                className="underline hover:text-foreground"
              >
                Contact
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
