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
  | {
      label: string;
      menuAlign?: "left" | "right";
      children: { href: string; label: string }[];
    };

const NAV: NavItem[] = [
  { href: "/record", label: "The Record" },
  { href: "/history", label: "The History" },
  {
    label: "Views",
    menuAlign: "right",
    children: [
      { href: "/by-diocese", label: "By Diocese" },
      {
        href: "/lithuanian-catholic-life-today",
        label: "Lithuanian Catholic Life Today",
      },
      { href: "/sustainability-watch", label: "Parish Sustainability" },
      { href: "/under-threat", label: "Parishes Under Threat" },
      {
        href: "/pennsylvania-coal-region",
        label: "Pennsylvania Coal Region",
      },
      { href: "/canadian-comparators", label: "Canadian Comparators" },
      { href: "/national-catholic", label: "National Catholic" },
      { href: "/protestant", label: "Protestant" },
    ],
  },
  {
    label: "Guidance",
    children: [
      { href: "/start-here", label: "Facing a Closure" },
      { href: "/reversals", label: "Reversals" },
      { href: "/what-canon-law-says", label: "What Canon Law Says" },
    ],
  },
  {
    label: "About",
    children: [
      { href: "/about", label: "About the Project" },
      { href: "/about-the-data", label: "About the Data" },
      {
        href: "/about/sources-and-archives",
        label: "Sources & Archives",
      },
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
            <nav className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted sm:w-auto sm:justify-end">
              {NAV.map((item) =>
                "children" in item ? (
                  <div key={item.label} className="relative group">
                    <button
                      type="button"
                      aria-haspopup="menu"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {item.label}
                      <span className="text-[10px] opacity-60">▾</span>
                    </button>
                    <div
                      className={`absolute top-full hidden min-w-max flex-col pt-2 z-50 group-hover:flex group-focus-within:flex ${
                        item.menuAlign === "right"
                          ? "right-0 sm:left-0 sm:right-auto"
                          : "left-0"
                      }`}
                    >
                      <div className="flex flex-col bg-background border border-rule rounded-md shadow-md py-1">
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
              A sourced public record of Lithuanian parish life in America.{" "}
              <Link
                href="/about-the-data"
                className="underline hover:text-foreground"
              >
                Research method
              </Link>
              {" · "}
              <Link
                href="/about/sources-and-archives"
                className="underline hover:text-foreground"
              >
                Sources &amp; Archives
              </Link>
              {" · "}
              <a
                href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
                className="underline hover:text-foreground"
              >
                Check our numbers
              </a>
              .
            </p>
            <p>
              Dispatches, alerts, and campaigns:{" "}
              <a
                href="https://blog.saveourlithuanianparishes.org"
                className="underline hover:text-foreground"
              >
                Židinys (The Hearth)
              </a>
              .
            </p>
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
              · data made possible by{" "}
              <a
                href="https://archyvas.ziburioltmokykla.org"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Skaitmeniniai Knygnešiai
              </a>
              , Žiburio Lithuanian School student interns at{" "}
              <Link
                href="/parishes/dievo-apvaizdos-southfield-mi"
                className="underline hover:text-foreground"
              >
                Divine Providence Lithuanian Parish
              </Link>{" "}
              in Southfield · a documented record, not legal or canonical
              advice ·{" "}
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
