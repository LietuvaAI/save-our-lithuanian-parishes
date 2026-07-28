import Link from "next/link";

type GuidanceSection = "closure" | "reversals" | "canon-law";

const GUIDANCE_PAGES: {
  id: GuidanceSection;
  href: string;
  label: string;
}[] = [
  { id: "closure", href: "/start-here", label: "Facing a Closure" },
  { id: "reversals", href: "/reversals", label: "Reversal Precedents" },
  {
    id: "canon-law",
    href: "/what-canon-law-says",
    label: "What Canon Law Says",
  },
];

export default function GuidanceNav({
  current,
}: {
  current: GuidanceSection;
}) {
  return (
    <nav
      aria-label="Guidance pages"
      className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-b border-rule"
    >
      {GUIDANCE_PAGES.map((item) => {
        const active = item.id === current;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
