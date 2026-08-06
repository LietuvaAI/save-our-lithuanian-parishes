import Link from "next/link";
import ExportableSvg from "@/components/ExportableSvg";
import { toGroup } from "@/lib/end-state";
import type { DioceseExplorerEntry } from "@/components/DioceseExplorer";

type DioceseClosureRankingProps = {
  dioceses: DioceseExplorerEntry[];
};

const PAPER = "#fffdf9";
const INK = "#1c1917";
const MUTED = "#6b625d";
const RULE = "#d6d0c8";
const RED = "#7d1f1f";
const GOLD = "#b08b33";

function anchorFor(name: string) {
  return `closures-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export default function DioceseClosureRanking({
  dioceses,
}: DioceseClosureRankingProps) {
  const ranked = dioceses
    .filter((diocese) => diocese.formalClosed > 0)
    .sort(
      (a, b) =>
        b.formalClosed - a.formalClosed ||
        b.total - a.total ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 10);
  const maximum = ranked[0]?.formalClosed ?? 1;
  const chartHeight = 154 + ranked.length * 68;

  return (
    <section className="mt-8 border-y border-rule py-5">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase text-muted">
          Diocese comparison
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">
          Which dioceses closed the most Lithuanian parishes?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          The ranking counts formal parish closures, not transfers to another
          congregation. Open any row below the graphic to inspect the parish
          profiles behind its number.
        </p>
      </div>

      <div className="mt-4">
        <ExportableSvg
          filename="lithuanian-parish-closures-by-diocese"
          label="Ranked diocesan closure graphic"
        >
          <svg
            viewBox={`0 0 1200 ${chartHeight}`}
            role="img"
            aria-label={`Ten dioceses ranked by formal Lithuanian parish closures, led by ${ranked[0]?.shortName} with ${ranked[0]?.formalClosed}`}
            className="hidden h-auto w-full sm:block"
          >
            <rect width="1200" height={chartHeight} fill={PAPER} />
            <text
              x="56"
              y="62"
              fill={INK}
              fontFamily="Georgia, serif"
              fontSize="34"
              fontWeight="700"
            >
              Lithuanian parish closures by diocese
            </text>
            <text
              x="56"
              y="98"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="18"
            >
              Formal closures among U.S. Lithuanian Roman Catholic parishes
            </text>

            {ranked.map((diocese, index) => {
              const y = 142 + index * 68;
              const barWidth = (diocese.formalClosed / maximum) * 620;
              return (
                <g key={diocese.name}>
                  <text
                    x="56"
                    y={y + 25}
                    fill={MUTED}
                    fontFamily="Arial, sans-serif"
                    fontSize="16"
                    fontWeight="700"
                  >
                    {index + 1}
                  </text>
                  <text
                    x="92"
                    y={y + 25}
                    fill={INK}
                    fontFamily="Arial, sans-serif"
                    fontSize="20"
                    fontWeight="700"
                  >
                    {diocese.shortName}
                  </text>
                  <rect
                    x="420"
                    y={y + 5}
                    width="620"
                    height="28"
                    fill="#ece7df"
                  />
                  <rect
                    x="420"
                    y={y + 5}
                    width={barWidth}
                    height="28"
                    fill={index < 2 ? RED : GOLD}
                  />
                  <text
                    x="1072"
                    y={y + 27}
                    fill={INK}
                    fontFamily="Georgia, serif"
                    fontSize="26"
                    fontWeight="700"
                  >
                    {diocese.formalClosed}
                  </text>
                </g>
              );
            })}

            <line
              x1="56"
              y1={chartHeight - 62}
              x2="1144"
              y2={chartHeight - 62}
              stroke={RULE}
            />
            <text
              x="56"
              y={chartHeight - 25}
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="15"
            >
              Save Our Lithuanian Parishes · formal parish closures
            </text>
          </svg>
          <div
            className="space-y-3 border-y border-rule py-4 sm:hidden"
            role="img"
            aria-label={`Ten dioceses ranked by formal Lithuanian parish closures, led by ${ranked[0]?.shortName} with ${ranked[0]?.formalClosed}`}
          >
            {ranked.map((diocese, index) => (
              <div key={diocese.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">
                    {index + 1}. {diocese.shortName}
                  </p>
                  <p className="font-serif text-xl font-semibold">
                    {diocese.formalClosed}
                  </p>
                </div>
                <div className="mt-1 h-2 bg-rule">
                  <div
                    className="h-2"
                    style={{
                      width: `${(diocese.formalClosed / maximum) * 100}%`,
                      background: index < 2 ? RED : GOLD,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ExportableSvg>
      </div>

      <div className="mt-4 grid gap-x-6 border-y border-rule sm:grid-cols-2">
        {ranked.map((diocese, index) => {
          const closedParishes = diocese.parishes.filter(
            (parish) => toGroup(parish.endState) === "closed",
          );
          return (
            <details
              key={diocese.name}
              id={anchorFor(diocese.name)}
              className="group border-b border-rule"
            >
              <summary className="grid min-h-10 cursor-pointer list-none grid-cols-[1.5rem_minmax(0,1fr)_auto_1rem] items-center gap-2 px-1 py-2 text-xs hover:bg-band">
                <span className="text-[10px] text-muted">{index + 1}</span>
                <span className="min-w-0 font-medium">
                  {diocese.shortName}
                </span>
                <span className="font-serif text-base font-semibold text-accent">
                  {diocese.formalClosed}
                </span>
                <span
                  className="text-center text-sm leading-none text-muted"
                  aria-hidden
                >
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <div className="border-t border-rule bg-band px-2 py-2">
                {closedParishes.map((parish) => (
                  <p key={parish.slug} className="py-1 text-[11px] leading-snug">
                    {parish.profileHref ? (
                      <Link
                        href={parish.profileHref}
                        className="font-medium underline underline-offset-2 hover:text-accent"
                      >
                        {parish.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{parish.name}</span>
                    )}
                    <span className="text-muted">
                      {" "}
                      · {parish.city}, {parish.state}
                    </span>
                  </p>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
