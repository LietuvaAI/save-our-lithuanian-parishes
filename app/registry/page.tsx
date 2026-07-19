import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";

export const metadata: Metadata = {
  title: "The research record — all registry parishes",
  description:
    "Every parish in the wider research record — beyond the 83 core case files — with its documentation depth and sources, from the unified registry.",
};

type Rec = (typeof registry.parishes)[number] & Record<string, any>;

export default function RegistryIndexPage() {
  const recs = (registry.parishes as Rec[]).filter((p) => !p.c83_row);
  const byState = new Map<string, Rec[]>();
  for (const p of recs) {
    const key = p.state || "—";
    if (!byState.has(key)) byState.set(key, []);
    byState.get(key)!.push(p);
  }
  const states = [...byState.keys()].sort();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The research record
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold">
        {recs.length} more parishes, documented and climbing
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Beyond the{" "}
        <Link href="/parishes" className="underline hover:text-foreground">
          83 core case files
        </Link>{" "}
        (and the three Canadian comparator parishes, which carry their own
        profiles), the unified registry documents these parishes across the
        U.S. and Canada — drawn from the full <em>Draugas</em> run since 1909,
        published parish histories, and contemporary sources. Each carries a
        depth label, every fact cites its source, and every one will, in
        time, have its own researched case file. Method:{" "}
        <Link href="/about-the-data" className="underline hover:text-foreground">
          About the data
        </Link>
        .
      </p>

      <div className="mt-10 space-y-10">
        {states.map((st) => {
          const list = [...byState.get(st)!].sort((a, b) =>
            (a.city || "").localeCompare(b.city || "")
          );
          return (
            <section key={st}>
              <h2 className="font-serif text-xl font-semibold border-b border-rule pb-2">
                {st}{" "}
                <span className="text-muted text-sm font-normal">
                  · {list.length} {list.length === 1 ? "parish" : "parishes"}
                </span>
              </h2>
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {list.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/registry/${p.slug}`}
                      className="group flex items-baseline gap-2 py-1"
                    >
                      <span>
                        <span className="font-medium group-hover:underline">
                          {p.names.lt || p.names.en}
                        </span>{" "}
                        <span className="text-sm text-muted">
                          — {p.city}
                          {p.record_depth === "multi-source"
                            ? " · multi-source"
                            : " · single-source"}
                          {p.conflicts?.length ? " · sources differ" : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
