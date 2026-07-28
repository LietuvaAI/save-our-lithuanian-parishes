import Link from "next/link";

type AboutSection = "project" | "data" | "sources";

const ABOUT_PAGES: {
  id: AboutSection;
  href: string;
  label: string;
}[] = [
  { id: "project", href: "/about", label: "About the Project" },
  { id: "data", href: "/about-the-data", label: "About the Data" },
  {
    id: "sources",
    href: "/about/sources-and-archives",
    label: "Sources & Archives",
  },
];

export default function AboutNav({ current }: { current: AboutSection }) {
  return (
    <nav
      aria-label="About pages"
      className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-b border-rule"
    >
      {ABOUT_PAGES.map((item) => {
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
