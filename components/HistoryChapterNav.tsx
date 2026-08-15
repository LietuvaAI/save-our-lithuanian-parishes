import Link from "next/link";

const chapters = [
  { numeral: "I", href: "/pennsylvania-coal-region", label: "Coal Country" },
  {
    numeral: "II",
    href: "/history/two-waves-across-a-century",
    label: "Two Waves",
  },
  {
    numeral: "III",
    href: "/history/parishes-alive-year-by-year",
    label: "Alive Year by Year",
  },
  {
    numeral: "IV",
    href: "/history/loss-by-diocese",
    label: "By Diocese",
  },
];

export default function HistoryChapterNav({ current }: { current: string }) {
  return (
    <nav className="mb-7 border-y border-rule py-2" aria-label="History chapters">
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {chapters.map((chapter) => {
          const active = chapter.href === current;
          return (
            <Link
              key={chapter.href}
              href={chapter.href}
              aria-current={active ? "page" : undefined}
              className={`font-sans text-support-copy ${
                active
                  ? "font-semibold text-foreground"
                  : "text-muted hover:text-accent"
              }`}
            >
              <span className="mr-1.5 font-mono text-ui-label">
                {chapter.numeral}
              </span>
              {chapter.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
