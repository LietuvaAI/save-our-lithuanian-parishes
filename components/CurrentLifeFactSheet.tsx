import ExportableSvg from "@/components/ExportableSvg";

type CurrentLifeFactSheetProps = {
  places: number;
  parishes: number;
  missions: number;
  hostedMasses: number;
  states: number;
  profiledCommunities: number;
  lithuanianPastors: number;
  weeklyMasses: number;
  standaloneGovernance: number;
  checked: string;
};

const PAPER = "#fffdf9";
const INK = "#1c1917";
const MUTED = "#6b625d";
const RULE = "#d6d0c8";
const GREEN = "#2d6a4f";
const PALE_GREEN = "#dce8df";
const GOLD = "#b08b33";
const RED = "#7d1f1f";

export default function CurrentLifeFactSheet({
  places,
  parishes,
  missions,
  hostedMasses,
  states,
  profiledCommunities,
  lithuanianPastors,
  weeklyMasses,
  standaloneGovernance,
  checked,
}: CurrentLifeFactSheetProps) {
  const networkFigures = [
    [parishes, "parishes"],
    [missions, "missions"],
    [hostedMasses, "hosted Masses"],
    [states, "states"],
  ] as const;
  const pastoralFigures = [
    [lithuanianPastors, "Lithuanian-speaking", "pastors"],
    [weeklyMasses, "weekly Lithuanian", "Masses"],
    [standaloneGovernance, "standalone parish", "governance"],
  ] as const;

  return (
    <section className="mt-12 border-y border-rule py-7">
      <div>
        <p className="text-xs font-medium uppercase text-muted">
          Shareable fact sheet
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">
          Lithuanian Catholic life today, at a glance
        </h2>
      </div>

      <div className="mt-5">
        <ExportableSvg
          filename="lithuanian-catholic-life-today"
          label="Current Lithuanian Catholic life fact sheet"
        >
          <svg
            viewBox="0 0 1200 760"
            role="img"
            aria-label={`${places} current worship places: ${parishes} parishes, ${missions} missions, ${hostedMasses} hosted Masses across ${states} states. Among ${profiledCommunities} profiled communities, ${lithuanianPastors} have Lithuanian-speaking pastors, ${weeklyMasses} have weekly Lithuanian Masses, and ${standaloneGovernance} retain standalone governance.`}
            className="hidden h-auto w-full sm:block"
          >
            <rect width="1200" height="760" fill={PAPER} />
            <text
              x="56"
              y="68"
              fill={INK}
              fontFamily="Georgia, serif"
              fontSize="36"
              fontWeight="700"
            >
              Lithuanian Catholic life today
            </text>
            <text
              x="56"
              y="104"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="19"
            >
              The current U.S. worship network
            </text>

            <rect x="56" y="148" width="322" height="260" fill={PALE_GREEN} />
            <text
              x="88"
              y="286"
              fill={GREEN}
              fontFamily="Georgia, serif"
              fontSize="126"
              fontWeight="700"
            >
              {places}
            </text>
            <text
              x="88"
              y="338"
              fill={INK}
              fontFamily="Arial, sans-serif"
              fontSize="25"
              fontWeight="700"
            >
              places still gather
            </text>
            <text
              x="88"
              y="372"
              fill={INK}
              fontFamily="Arial, sans-serif"
              fontSize="25"
              fontWeight="700"
            >
              for Lithuanian worship
            </text>

            {networkFigures.map(([value, label], index) => {
              const x = 432 + (index % 2) * 352;
              const y = 160 + Math.floor(index / 2) * 126;
              return (
                <g key={label}>
                  <text
                    x={x}
                    y={y + 60}
                    fill={index === 0 ? GREEN : index === 1 ? GOLD : INK}
                    fontFamily="Georgia, serif"
                    fontSize="62"
                    fontWeight="700"
                  >
                    {value}
                  </text>
                  <text
                    x={x + 88}
                    y={y + 53}
                    fill={INK}
                    fontFamily="Arial, sans-serif"
                    fontSize="23"
                    fontWeight="700"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            <line x1="56" y1="458" x2="1144" y2="458" stroke={RULE} />
            <text
              x="56"
              y="506"
              fill={INK}
              fontFamily="Arial, sans-serif"
              fontSize="22"
              fontWeight="700"
            >
              Pastoral conditions among {profiledCommunities} profiled worship
              communities
            </text>

            {pastoralFigures.map(([value, lineOne, lineTwo], index) => {
              const x = 56 + index * 362;
              const color = index === 0 ? RED : index === 1 ? GREEN : GOLD;
              return (
                <g key={lineOne}>
                  <text
                    x={x}
                    y="620"
                    fill={color}
                    fontFamily="Georgia, serif"
                    fontSize="76"
                    fontWeight="700"
                  >
                    {value}
                  </text>
                  <text
                    x={x + 82}
                    y="586"
                    fill={INK}
                    fontFamily="Arial, sans-serif"
                    fontSize="20"
                    fontWeight="700"
                  >
                    {lineOne}
                  </text>
                  <text
                    x={x + 82}
                    y="614"
                    fill={INK}
                    fontFamily="Arial, sans-serif"
                    fontSize="20"
                    fontWeight="700"
                  >
                    {lineTwo}
                  </text>
                </g>
              );
            })}

            <text
              x="56"
              y="710"
              fill={MUTED}
              fontFamily="Arial, sans-serif"
              fontSize="15"
            >
              Source: Sielovada North America and current parish evidence -
              checked {checked}
            </text>
            <rect x="1027" y="690" width="39" height="8" fill="#fdb913" />
            <rect x="1066" y="690" width="39" height="8" fill="#006a44" />
            <rect x="1105" y="690" width="39" height="8" fill="#c1272d" />
          </svg>
          <div
            className="sm:hidden"
            role="img"
            aria-label={`${places} current worship places: ${parishes} parishes, ${missions} missions, ${hostedMasses} hosted Masses across ${states} states. Among ${profiledCommunities} profiled communities, ${lithuanianPastors} have Lithuanian-speaking pastors, ${weeklyMasses} have weekly Lithuanian Masses, and ${standaloneGovernance} retain standalone governance.`}
          >
            <div className="border-y border-rule py-5">
              <p className="font-serif text-6xl font-semibold text-[var(--es-active)]">
                {places}
              </p>
              <p className="mt-1 font-serif text-xl font-semibold leading-tight">
                places still gather for Lithuanian Catholic worship
              </p>
            </div>
            <div className="grid grid-cols-2 border-b border-rule">
              {networkFigures.map(([value, label]) => (
                <div key={label} className="border-b border-rule py-4 odd:pr-3 even:border-l even:pl-3">
                  <p className="font-serif text-3xl font-semibold">{value}</p>
                  <p className="text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold leading-snug">
              Pastoral conditions among {profiledCommunities} profiled worship
              communities
            </p>
            <div className="mt-2 divide-y divide-rule border-y border-rule">
              {pastoralFigures.map(([value, lineOne, lineTwo]) => (
                <div
                  key={lineOne}
                  className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 py-3"
                >
                  <p className="font-serif text-3xl font-semibold">{value}</p>
                  <p className="text-sm font-medium">
                    {lineOne} {lineTwo}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Source: Sielovada North America and current parish evidence ·
              Checked {checked}
            </p>
          </div>
        </ExportableSvg>
      </div>
    </section>
  );
}
