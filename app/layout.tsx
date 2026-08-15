import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Source_Serif_4,
} from "next/font/google";
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

const timelineMono = IBM_Plex_Mono({
  variable: "--font-timeline-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    "The living history of America's Lithuanian parishes, missions, and congregations — how they began, how they changed, and where they stand today.",
};

type NavItem =
  | { href: string; label: string }
  | {
      label: string;
      menuAlign?: "left" | "right";
      children: (
        | { href: string; label: string }
        | { section: string }
      )[];
    };

const NAV: NavItem[] = [
  { href: "/parishes", label: "All Profiles" },
  {
    label: "Explore",
    children: [
      { section: "The record" },
      {
        href: "/where-every-parish-ended-up",
        label: "Where Every Parish Stands",
      },
      {
        href: "/lithuanian-catholic-life-today",
        label: "The Living Network",
      },
      {
        href: "/where-parish-life-continued",
        label: "Where Parish Life Continued",
      },
      { section: "History" },
      { href: "/history", label: "The Rise and the Loss" },
      {
        href: "/pennsylvania-coal-region",
        label: "Pennsylvania Coal Region",
      },
      { href: "/history#loss-by-diocese", label: "By Diocese" },
      { section: "Other traditions" },
      {
        href: "/national-catholic",
        label: "National & Independent Catholic",
      },
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
  { href: "https://blog.saveourlithuanianparishes.org", label: "Židinys ↗" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${timelineMono.variable} ${serifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b-[3px] border-transparent [border-image:linear-gradient(to_right,#f5b500_33.4%,#00694d_33.4%,#00694d_66.7%,#a72c2c_66.7%)_1]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-5 gap-y-1.5 px-4 py-3.5">
            <Link href="/" className="shrink-0 whitespace-nowrap font-serif text-site-wordmark font-medium uppercase tracking-[0.09em] text-foreground">
              Save Our Lithuanian Parishes
            </Link>
            <nav className="ml-auto flex w-full flex-wrap items-center gap-x-3.5 gap-y-1 font-serif text-site-nav font-medium uppercase tracking-[0.08em] text-foreground sm:w-auto sm:justify-end">
              {NAV.map((item) =>
                "children" in item ? (
                  <div key={item.label} className="relative group">
                    <button
                      type="button"
                      aria-haspopup="menu"
                      className="flex items-center gap-1 whitespace-nowrap border-b border-transparent py-1 transition-colors hover:border-[var(--es-active)] hover:text-[var(--es-active)]"
                    >
                      {item.label}
                      <span className="text-ui-label opacity-60">▾</span>
                    </button>
                    <div
                      className={`absolute top-full hidden min-w-max flex-col pt-2 z-50 group-hover:flex group-focus-within:flex ${
                        item.menuAlign === "right"
                          ? "right-0 sm:left-0 sm:right-auto"
                          : "left-0"
                      }`}
                    >
                      <div className="flex flex-col bg-background border border-rule rounded-md shadow-md py-1">
                        {item.children.map((child) =>
                          "section" in child ? (
                            <p
                              key={child.section}
                              className="mt-1 border-t border-rule px-4 pb-1 pt-2 text-ui-label font-semibold uppercase tracking-widest text-muted first:mt-0 first:border-t-0 first:pt-1"
                            >
                              {child.section}
                            </p>
                          ) : (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="px-4 py-2 font-sans text-support-copy normal-case tracking-normal hover:bg-foreground/5 hover:text-[var(--es-active)] transition-colors whitespace-nowrap"
                            >
                              {child.label}
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap border-b border-transparent py-1 text-foreground transition-colors hover:border-[var(--es-active)] hover:text-[var(--es-active)] ${
                      item.label.startsWith("Židinys")
                        ? "font-semibold !text-[var(--es-active)]"
                        : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-10 border-t border-foreground bg-[#faf7f1]">
          <div className="mx-auto max-w-6xl px-4 py-[22px] text-small-copy leading-[1.6] text-muted">
            <p className="font-serif text-site-footer-brand font-medium uppercase tracking-[0.09em] text-foreground">
              Save Our Lithuanian Parishes
            </p>
            <p className="mt-1.5 max-w-[76ch]">
              The living history of America&rsquo;s Lithuanian parishes, missions,
              and congregations — how they began, how they changed, and where
              they stand today. <Link href="/about">About the project</Link> ·{" "}
              <Link href="/about-the-data">About the data</Link>
            </p>
            <p className="mt-3.5 border-t border-rule pt-3">
              Archive and data foundation:{" "}
              <a
                href="https://archyvas.ziburioltmokykla.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Skaitmeniniai Knygnešiai
              </a>
              , Žiburio Lithuanian School student interns at{" "}
              <Link
                href="/parishes/dievo-apvaizdos-southfield-mi"
              >
                Divine Providence Lithuanian Parish
              </Link>{" "}
              in Southfield.
            </p>

            <p className="mt-1">
              © 2026 Save Our Lithuanian Parishes · Powered by{" "}
              <a href="https://lietuva.ai" target="_blank" rel="noopener noreferrer">Lietuva.AI</a>
              {" "}· Documentation, not legal or canonical advice ·{" "}
              <Link href="/legal">Legal, attribution &amp; data use</Link> ·{" "}
              <a href="mailto:info@saveourlithuanianparishes.org">Contact</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
