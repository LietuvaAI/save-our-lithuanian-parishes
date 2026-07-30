import Link from "next/link";
import ExportableSvg from "@/components/ExportableSvg";

type NationalRecordGraphicProps = {
  total: number;
  closed: number;
  closedSince1990: number;
  concentratedLosses: number;
  firstDiocese: string;
  firstDioceseLosses: number;
  secondDiocese: string;
  secondDioceseLosses: number;
  revision: string;
  revisionDate: string;
};

const INK = "#1c1917";
const MUTED = "#6b625d";
const RULE = "#d6d0c8";
const PAPER = "#fffdf9";
const RED = "#7d1f1f";
const GREEN = "#2d6a4f";
const GOLD = "#b08b33";

export default function NationalRecordGraphic({
  total,
  closed,
  closedSince1990,
  concentratedLosses,
  firstDiocese,
  firstDioceseLosses,
  secondDiocese,
  secondDioceseLosses,
  revision,
  revisionDate,
}: NationalRecordGraphicProps) {
  const stages = [
    {
      value: total,
      label: ["Roman Catholic", "Lithuanian parishes"],
      color: INK,
    },
    {
      value: closed,
      label: ["parishes", "closed"],
      color: RED,
    },
    {
      value: closedSince1990,
      label: ["closures dated", "1990 or later"],
      color: GOLD,
    },
    {
      value: concentratedLosses,
      label: ["closed in Scranton", "or Chicago"],
      color: GREEN,
    },
  ];

  return (
    <section className="mt-10 border-y border-rule py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted">
            The national record
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">
            Four figures tell the scale of the loss
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-muted">
          Every number is drawn from the same population of Roman Catholic
          Lithuanian parishes.
        </p>
      </div>

      <div className="mt-5">
        <ExportableSvg
          filename="lithuanian-parishes-national-record"
          label="National parish record graphic"
        >
          <svg
            viewBox="0 0 1200 520"
            role="img"
            aria-label={`${total} documented parishes, ${closed} closed, ${closedSince1990} closures dated since 1990, and ${concentratedLosses} losses concentrated in Scranton and Chicago`}
            className="hidden h-auto w-full sm:block"
          >
            <rect width="1200" height="520" fill={PAPER} />
            <text
              x="56"
              y="66"
              fill={INK}
              fontFamily="Georgia, serif"
              fontSize="36"
              fontWeight="700"
            >
              America&apos;s Lithuanian parish record
            </text>
            <text
              x="56"
              y="102"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="19"
            >
              One parish population, followed from the full record into the
              most concentrated losses
            </text>

            {stages.map((stage, index) => {
              const x = 56 + index * 286;
              const barWidth = Math.max(52, (stage.value / total) * 218);
              return (
                <g key={stage.value}>
                  <text
                    x={x}
                    y="224"
                    fill={stage.color}
                    fontFamily="Georgia, serif"
                    fontSize="82"
                    fontWeight="700"
                  >
                    {stage.value}
                  </text>
                  <text
                    x={x}
                    y="272"
                    fill={INK}
                    fontFamily="Arial, sans-serif"
                    fontSize="21"
                    fontWeight="700"
                  >
                    {stage.label[0]}
                  </text>
                  <text
                    x={x}
                    y="301"
                    fill={INK}
                    fontFamily="Arial, sans-serif"
                    fontSize="21"
                    fontWeight="700"
                  >
                    {stage.label[1]}
                  </text>
                  <rect
                    x={x}
                    y="336"
                    width="218"
                    height="13"
                    fill="#ece7df"
                  />
                  <rect
                    x={x}
                    y="336"
                    width={barWidth}
                    height="13"
                    fill={stage.color}
                  />
                  {index < stages.length - 1 ? (
                    <g aria-hidden="true">
                      <line
                        x1={x + 235}
                        y1="243"
                        x2={x + 264}
                        y2="243"
                        stroke={RULE}
                        strokeWidth="4"
                      />
                      <path
                        d={`M ${x + 257} 234 L ${x + 266} 243 L ${x + 257} 252`}
                        fill="none"
                        stroke={RULE}
                        strokeWidth="4"
                      />
                    </g>
                  ) : null}
                </g>
              );
            })}

            <line x1="56" y1="400" x2="1144" y2="400" stroke={RULE} />
            <text
              x="56"
              y="438"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="18"
            >
              {firstDiocese}: {firstDioceseLosses} closed parishes
            </text>
            <text
              x="465"
              y="438"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="18"
            >
              {secondDiocese}: {secondDioceseLosses} closed parishes
            </text>
            <text
              x="56"
              y="482"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="15"
            >
              Save Our Lithuanian Parishes - Registry Revision {revision},{" "}
              {revisionDate}
            </text>
            <rect x="1027" y="458" width="39" height="8" fill="#fdb913" />
            <rect x="1066" y="458" width="39" height="8" fill="#006a44" />
            <rect x="1105" y="458" width="39" height="8" fill="#c1272d" />
          </svg>
          <div
            className="divide-y divide-rule border-y border-rule sm:hidden"
            role="img"
            aria-label={`${total} documented parishes, ${closed} closed, ${closedSince1990} closures dated since 1990, and ${concentratedLosses} losses concentrated in Scranton and Chicago`}
          >
            {stages.map((stage, index) => (
              <div
                key={stage.value}
                className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 py-4"
              >
                <p
                  className="font-serif text-4xl font-semibold"
                  style={{ color: stage.color }}
                >
                  {stage.value}
                </p>
                <div>
                  <p className="text-sm font-semibold leading-snug">
                    {stage.label.join(" ")}
                  </p>
                  {index < stages.length - 1 ? (
                    <p className="mt-1 text-xs text-muted">
                      {Math.round(
                        (stages[index + 1].value / stage.value) * 100,
                      )}
                      % continue into the next figure
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="py-4 text-xs leading-relaxed text-muted">
              <p>
                {firstDiocese}: {firstDioceseLosses} closed parishes
              </p>
              <p>
                {secondDiocese}: {secondDioceseLosses} closed parishes
              </p>
              <p className="mt-2">
                Registry Revision {revision}, {revisionDate}
              </p>
            </div>
          </div>
        </ExportableSvg>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        <Link href="/history" className="underline hover:text-foreground">
          Follow the losses over time
        </Link>
        {" · "}
        <Link href="/by-diocese" className="underline hover:text-foreground">
          Inspect every diocese
        </Link>
      </p>
    </section>
  );
}
