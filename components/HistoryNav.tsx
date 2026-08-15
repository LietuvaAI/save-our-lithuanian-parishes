import Link from "next/link";

const historyPages = [
  { href: "/history", label: "Overview" },
  { href: "/pennsylvania-coal-region", label: "Pennsylvania Coal Country" },
  {
    href: "/history/two-waves-across-a-century",
    label: "Two Waves Across a Century",
  },
  {
    href: "/history/parishes-alive-year-by-year",
    label: "Parishes Alive, Year by Year",
  },
  {
    href: "/history/loss-by-diocese",
    label: "The Loss, Diocese by Diocese",
  },
];

export default function HistoryNav({ current }: { current: string }) {
  return (
    <nav className="mb-7 border-y border-rule py-2" aria-label="History pages">
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {historyPages.map((page) => {
          const active = page.href === current;
          return (
            <Link
              key={page.href}
              href={page.href}
              aria-current={active ? "page" : undefined}
              className={`font-sans text-support-copy ${
                active
                  ? "font-semibold text-foreground"
                  : "text-muted hover:text-accent"
              }`}
            >
              {page.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
