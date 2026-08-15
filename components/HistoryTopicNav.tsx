import Link from "next/link";

const historyTopics = [
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

export default function HistoryTopicNav({ current }: { current: string }) {
  return (
    <nav
      className="mb-7 flex flex-wrap border-y border-rule"
      aria-label="History topics"
    >
      {historyTopics.map((topic) => {
        const active = topic.href === current;
        return (
          <Link
            key={topic.href}
            href={topic.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-1.5 px-3 font-sans text-support-copy transition-colors first:pl-0 hover:text-accent sm:px-4 ${
              active ? "font-semibold text-foreground" : "text-muted"
            }`}
          >
            <span className="font-mono text-ui-label font-semibold">
              {topic.numeral}
            </span>
            <span>{topic.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
