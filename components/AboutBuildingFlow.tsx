type BuildingConditionCounts = {
  standing: number;
  repurposed: number;
  demolished: number;
  listed_for_sale: number;
  not_established: number;
};

type AboutBuildingFlowProps = {
  counts: BuildingConditionCounts;
};

const CONDITIONS = [
  { key: "standing", label: "Standing", color: "#2d6a4f" },
  { key: "repurposed", label: "Repurposed", color: "#78716c" },
  { key: "demolished", label: "Demolished", color: "#7d1f1f" },
  { key: "listed_for_sale", label: "Listed", color: "#8a6a12" },
  {
    key: "not_established",
    label: "Condition not established",
    color: "#ded9d1",
  },
] as const;

export default function AboutBuildingFlow({ counts }: AboutBuildingFlowProps) {
  const total = CONDITIONS.reduce((sum, condition) => sum + counts[condition.key], 0);
  const top = 18;
  const usableHeight = 256;
  const gap = 9;
  const flowHeight = usableHeight - gap * (CONDITIONS.length - 1);
  const heightFor = (condition: (typeof CONDITIONS)[number]) =>
    total === 0 ? 0 : (counts[condition.key] / total) * flowHeight;
  const bands = CONDITIONS.map((condition, index) => {
    const count = counts[condition.key];
    const height = heightFor(condition);
    const precedingHeight = CONDITIONS.slice(0, index).reduce(
      (sum, preceding) => sum + heightFor(preceding),
      0,
    );
    return {
      ...condition,
      count,
      height,
      sourceY: top + precedingHeight,
      targetY: top + precedingHeight + gap * index,
    };
  });

  return (
    <div className="mt-6" role="img" aria-label={`The ${total} documented physical worship sites resolve to ${counts.standing} standing, ${counts.repurposed} repurposed, ${counts.demolished} demolished, ${counts.listed_for_sale} listed, and ${counts.not_established} whose condition is not established.`}>
      <svg viewBox="0 0 860 300" className="h-auto w-full" aria-hidden="true">
        <rect x="24" y={top} width="14" height={flowHeight} fill="#1c1917" />
        <text x="24" y="292" fill="#1c1917" fontSize="13">
          {total} physical worship sites
        </text>

        {bands.map((band) => {
          const x1 = 38;
          const x2 = 590;
          const y1 = band.sourceY;
          const y2 = band.targetY;
          const h = band.height;
          const path = [
            `M ${x1} ${y1}`,
            `C 230 ${y1}, 390 ${y2}, ${x2} ${y2}`,
            `L ${x2} ${y2 + h}`,
            `C 390 ${y2 + h}, 230 ${y1 + h}, ${x1} ${y1 + h}`,
            "Z",
          ].join(" ");

          return (
            <g key={band.key}>
              <path
                d={path}
                fill={band.color}
                fillOpacity={band.key === "not_established" ? 0.52 : 0.78}
                stroke={band.key === "not_established" ? "#b3aca2" : "none"}
                strokeDasharray={band.key === "not_established" ? "5 4" : undefined}
              />
              <rect
                x={x2}
                y={y2}
                width="14"
                height={Math.max(h, 2)}
                fill={band.color}
                stroke={band.key === "not_established" ? "#b3aca2" : "none"}
                strokeDasharray={band.key === "not_established" ? "4 3" : undefined}
              />
              <text x="626" y={y2 + Math.max(h / 2, 8) - 2} fill="#1c1917" fontSize="15" fontWeight="600">
                {band.label} · {band.count}
              </text>
              {band.key === "not_established" ? (
                <text x="626" y={y2 + Math.max(h / 2, 8) + 16} fill="#78716c" fontSize="12.5">
                  a research gap, not an outcome
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
