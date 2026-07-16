import type { Metadata } from "next";
import Link from "next/link";
import { readdirSync } from "fs";
import { join } from "path";
import { MarkIcon } from "@/components/marks";
import { usParishes, ENDING_MODE_LABEL } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "Parish Profiles",
  description:
    "A profile for every documented U.S. Lithuanian parish — its history, its ownership, its ending or its survival, and the sources behind every fact.",
};

/** Slugs that have a researched present-day case record on disk. */
function caseRecordSlugs(): Set<string> {
  try {
    return new Set(
      readdirSync(join(process.cwd(), "data", "case-records"))
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""))
    );
  } catch {
    return new Set();
  }
}

const STATE_NAME: Record<string, string> = {
  CA: "California",
  CT: "Connecticut",
  IA: "Iowa",
  IL: "Illinois",
  IN: "Indiana",
  MA: "Massachusetts",
  MD: "Maryland",
  MI: "Michigan",
  MO: "Missouri",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NY: "New York",
  OH: "Ohio",
  PA: "Pennsylvania",
  RI: "Rhode Island",
};

export default function ParishProfilesPage() {
  const withRecord = caseRecordSlugs();

  const byState = new Map<string, typeof usParishes>();
  for (const p of usParishes) {
    const list = byState.get(p.state) ?? [];
    list.push(p);
    byState.set(p.state, list);
  }
  const states = [...byState.keys()].sort();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Parish Profiles</h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        A profile for each of the {usParishes.length} documented U.S.
        Lithuanian parishes: who built it, who owned it, what happened to it —
        with every fact traced to its published source. Profiles grow as the
        research does; if you know one of these parishes,{" "}
        <Link href="/report" className="underline hover:text-foreground">
          add what you know
        </Link>
        .
      </p>

      <div className="mt-10 space-y-10">
        {states.map((st) => {
          const list = [...byState.get(st)!].sort((a, b) =>
            a.city.localeCompare(b.city)
          );
          return (
            <section key={st}>
              <h2 className="font-serif text-xl font-semibold border-b border-rule pb-2">
                {STATE_NAME[st] ?? st}{" "}
                <span className="text-muted text-sm font-normal">
                  · {list.length} {list.length === 1 ? "parish" : "parishes"}
                </span>
              </h2>
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {list.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/parishes/${p.slug}`}
                      className="group flex items-baseline gap-2 py-1"
                    >
                      <span className="shrink-0 translate-y-px">
                        <MarkIcon mode={p.endingMode} />
                      </span>
                      <span>
                        <span className="font-medium group-hover:underline">
                          {p.nameLt}
                        </span>{" "}
                        <span className="text-sm text-muted">
                          — {p.city} · {ENDING_MODE_LABEL[p.endingMode]}
                          {p.yearFounded && p.yearClosed
                            ? ` · ${p.yearFounded}–${p.yearClosed}`
                            : p.yearFounded
                              ? ` · founded ${p.yearFounded}`
                              : p.yearClosed
                                ? ` · lost ${p.yearClosed}`
                                : ""}
                        </span>
                        {withRecord.has(p.slug) && (
                          <span
                            className="ml-2 rounded border border-rule px-1.5 py-px text-xs text-muted"
                            title="Has a researched present-day case record"
                          >
                            present record
                          </span>
                        )}
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
