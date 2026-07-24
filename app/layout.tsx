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
    "The public record of America's Lithuanian parishes — every parish we can document, what happened to it, where it stands today, and what communities can learn from each other.",
};

type NavItem =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

const NAV: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/record", label: "The Record" },
  { href: "/under-threat", label: "Under Threat" },
  { href: "/sustainability-watch", label: "Sustainability Watch" },
  { href: "/start-here", label: "Facing a Closure" },
  {
    label: "Other Congregations",
    children: [
      { href: "/national-catholic", label: "National Catholic" },
      { href: "/protestant", label: "Protestant" },
    ],
  },
  { href: "https://blog.saveourlithuanianparishes.org", label: "Židinys (The Hearth)" },
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
        <header>
          <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
              Save Our Lithuanian Parishes
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              {NAV.map((item) =>
                "children" in item ? (
                  <div key={item.label} className="relative group">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {item.label}
                      <span className="text-[10px] opacity-60">▾</span>
                    </button>
                    <div className="absolute top-full left-0 mt-2 hidden group-hover:flex flex-col bg-background border border-rule rounded-md shadow-md py-1 min-w-max z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="px-4 py-2 hover:bg-foreground/5 hover:text-foreground transition-colors whitespace-nowrap"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
          {/* Lithuanian flag stripe */}
          <div className="flex h-[3px]" aria-hidden>
            <div className="flex-1" style={{ background: "#FDB913" }} />
            <div className="flex-1" style={{ background: "#006A44" }} />
            <div className="flex-1" style={{ background: "#C1272D" }} />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-rule mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted space-y-2">
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
              <Link href="/start-here" className="hover:text-foreground">
                Facing a Closure
              </Link>
              <Link href="/reversals" className="hover:text-foreground">
                Reversals
              </Link>
              <Link href="/record" className="hover:text-foreground">
                The Record
              </Link>
              <Link href="/under-threat" className="hover:text-foreground">
                Under Threat
              </Link>
              <Link href="/sustainability-watch" className="hover:text-foreground">
                Sustainability Watch
              </Link>
              <Link href="/national-catholic" className="hover:text-foreground">
                National Catholic
              </Link>
              <Link href="/protestant" className="hover:text-foreground">
                Protestant
              </Link>
              <Link href="/what-canon-law-says" className="hover:text-foreground">
                What Canon Law Says
              </Link>
              <Link href="/about-the-data" className="hover:text-foreground">
                About the data
              </Link>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link href="/full-picture" className="hover:text-foreground">
                The Full Picture
              </Link>
              <Link
                href="/report"
                className="font-medium hover:text-foreground"
              >
                Report from your parish
              </Link>
            </nav>
            <p className="pt-3 mt-1 border-t border-rule">
              © 2026 Save Our Lithuanian Parishes · powered by{" "}
              <a
                href="https://lietuva.ai"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lietuva.AI
              </a>{" "}
              · supported by the Žiburio Foundation · data made possible by{" "}
              <a
                href="https://archyvas.ziburioltmokykla.org"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Skaitmeniniai Knygnešiai
              </a>
              , student interns from Detroit · a documented record, not legal
              or canonical advice ·{" "}
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
