"use client";

// ============================================================================
// ParishContextMap — the parish among its neighbors: a diocese-level zoom
// showing which diocese the parish sits in and what happened to every
// recorded Lithuanian parish around it. The site's thesis in one graphic —
// no parish in isolation.
//
// Shares its data layer with the Hearth dispatch renderer
// (data/context-points.json + data/diocese-overlay.json) and follows the
// dispatch map's Vilija-approved v6 construction spec (2026-07-26):
// 1.5:1 landscape frame padded from the diocese bbox; cell-based same-city
// fanning at zoom scale (subject never displaced); living parishes as open
// rings, lost as filled dots; subject enlarged with a dashed halo; label
// HIERARCHY over completeness — subject always (with sub-line), everything
// inside the subject diocese named, outside it only canonical parishes,
// quiet; unresolved parishes bold-ink and always explained; collision-
// avoiding placement with leader lines and text halos. Colors are the
// site's own CSS variables (dark mode included), which the dispatch
// renderer mirrors from globals.css.
// ============================================================================

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import overlay from "@/data/diocese-overlay.json";
import contextPoints from "@/data/context-points.json";
import {
  GROUP_LABEL,
  END_STATE_COLOR,
  type EndStateGroup,
} from "@/lib/end-state";

interface CtxPoint {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  group: EndStateGroup;
  closed: number | null;
  congregationClass: string | null;
  diocese: string | null;
  href: string | null;
}

interface OverlayDiocese {
  name: string;
  path: string;
  cx: number;
  cy: number;
  bbox: [number, number, number, number];
  counties: number;
}

const ASPECT = 1.5;
const ALIVE = new Set(["active_parish", "mass_continues"]);

const STATE_WORD: Record<EndStateGroup, string> = {
  active_parish: "active Lithuanian parish",
  mass_continues: "Lithuanian Mass continues",
  transferred: "ethnically transferred",
  unresolved: "unresolved",
  closed: "closed",
  unverified: "in the record",
};

const isNameable = (p: CtxPoint) =>
  !/^\(|unnamed|^record$/i.test(p.name) && p.name !== p.slug;

interface Placed extends CtxPoint {
  px: number;
  py: number;
}
interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ParishContextMap({ slug }: { slug: string }) {
  const router = useRouter();
  const [hot, setHot] = useState<CtxPoint | null>(null);

  const model = useMemo(() => {
    const points = (contextPoints.points as CtxPoint[]).filter(
      (p) => p.congregationClass === "roman_catholic",
    );
    const subject = points.find((p) => p.slug === slug);
    if (!subject?.diocese) return null;
    const dio = (overlay.dioceses as OverlayDiocese[]).find(
      (d) => d.name === subject.diocese,
    );
    if (!dio) return null;

    // ── Frame: bbox pad = max(0.35 × max(bw,bh), 8), settled to 1.5:1 ──
    let [x0, y0, x1, y1] = dio.bbox;
    const pad = Math.max(0.35 * Math.max(x1 - x0, y1 - y0), 8);
    x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    let w = x1 - x0;
    let h = y1 - y0;
    if (w / h < ASPECT) {
      const grow = h * ASPECT - w;
      x0 -= grow / 2; w = h * ASPECT;
    } else {
      const grow = w / ASPECT - h;
      y0 -= grow / 2; h = w / ASPECT;
    }
    const S = w / 45; // the spec's scale unit

    // ── Points in view; cell-based fanning (0.6-unit cells) ──
    const inView = points.filter(
      (p) => p.x >= x0 && p.x <= x0 + w && p.y >= y0 && p.y <= y0 + h,
    );
    const cells = new Map<string, CtxPoint[]>();
    for (const p of inView) {
      const k = `${Math.floor(p.x / 0.6)}|${Math.floor(p.y / 0.6)}`;
      if (!cells.has(k)) cells.set(k, []);
      cells.get(k)!.push(p);
    }
    const placed: Placed[] = [];
    for (const group of cells.values()) {
      if (group.length === 1) {
        placed.push({ ...group[0], px: group[0].x, py: group[0].y });
        continue;
      }
      const ring = group.filter((p) => p.slug !== slug);
      const subj = group.find((p) => p.slug === slug);
      if (subj) placed.push({ ...subj, px: subj.x, py: subj.y });
      const fanR = 1.35 * S;
      ring.forEach((p, i) => {
        const a = (2 * Math.PI * i) / ring.length - Math.PI / 2.5;
        placed.push({
          ...p,
          px: p.x + fanR * Math.cos(a),
          py: p.y + fanR * Math.sin(a),
        });
      });
    }

    // ── Label plan: hierarchy over completeness ──
    const est = (text: string, fs: number): { w: number; h: number } => ({
      w: text.length * fs * 0.56,
      h: fs * 1.15,
    });
    const reserved: LabelBox[] = [];
    const inFrame = (b: LabelBox) =>
      b.x >= x0 && b.x + b.w <= x0 + w && b.y >= y0 && b.y + b.h <= y0 + h;
    const collides = (b: LabelBox) =>
      reserved.some(
        (r) =>
          b.x < r.x + r.w && b.x + b.w > r.x && b.y < r.y + r.h && b.y + b.h > r.y,
      ) ||
      placed.some(
        (p) =>
          p.px > b.x - S * 0.4 && p.px < b.x + b.w + S * 0.4 &&
          p.py > b.y - S * 0.4 && p.py < b.y + b.h + S * 0.4,
      );

    const candidates = (p: Placed, bw: number, bh: number): LabelBox[] => {
      const out: LabelBox[] = [];
      for (const r of [1.4 * S, 2.4 * S, 3.6 * S]) {
        for (let i = 0; i < (r === 1.4 * S ? 8 : r === 2.4 * S ? 6 : 4); i++) {
          const n = r === 1.4 * S ? 8 : r === 2.4 * S ? 6 : 4;
          const a = (2 * Math.PI * i) / n - Math.PI / 2;
          out.push({
            x: p.px + r * Math.cos(a) - (Math.cos(a) < -0.3 ? bw : Math.cos(a) > 0.3 ? 0 : bw / 2),
            y: p.py + r * Math.sin(a) - bh / 2,
            w: bw,
            h: bh,
          });
        }
      }
      return out;
    };

    interface PlannedLabel {
      p: Placed;
      box: LabelBox;
      fs: number;
      bold: boolean;
      quiet: boolean;
      leader: boolean;
    }
    const labels: PlannedLabel[] = [];
    const tryLabel = (
      p: Placed,
      fs: number,
      bold: boolean,
      quiet: boolean,
      force: boolean,
    ) => {
      for (const scale of force ? [1, 0.85] : [1]) {
        const f = fs * scale;
        const { w: bw, h: bh } = est(p.name, f);
        for (const c of candidates(p, bw, bh)) {
          if (inFrame(c) && !collides(c)) {
            reserved.push(c);
            labels.push({
              p, box: c, fs: f, bold, quiet,
              leader:
                Math.hypot(c.x + bw / 2 - p.px, c.y + bh / 2 - p.py) > 1.7 * S + bw / 2,
            });
            return true;
          }
        }
      }
      if (force) {
        // Force-place beside the dot — and RESERVE it (the hard-learned rule).
        const f = fs * 0.85;
        const { w: bw, h: bh } = est(p.name, f);
        const box = { x: p.px + S, y: p.py - bh / 2, w: bw, h: bh };
        reserved.push(box);
        labels.push({ p, box, fs: f, bold, quiet, leader: false });
        return true;
      }
      return false;
    };

    const subjPlaced =
      placed.find((p) => p.slug === slug) ?? { ...subject, px: subject.x, py: subject.y };
    // Subject label box (title + sub-line) reserved first
    {
      const fs = 1.55 * S;
      const { w: bw } = est(subject.name, fs);
      const bh = fs * 1.15 + 1.12 * S * 1.3;
      const box = {
        x: subjPlaced.px - bw / 2,
        y: subjPlaced.py - 2.0 * S - bh - 0.6 * S,
        w: bw,
        h: bh,
      };
      reserved.push(box);
    }

    const rest = placed.filter((p) => p.slug !== slug);
    const unresolvedPts = rest.filter((p) => p.group === "unresolved");
    const inDio = rest.filter(
      (p) => p.diocese === subject.diocese && p.group !== "unresolved" && isNameable(p),
    );
    const outCanonical = rest.filter(
      (p) =>
        p.diocese !== subject.diocese &&
        p.group !== "unresolved" &&
        p.href?.startsWith("/parishes/") &&
        isNameable(p),
    );
    for (const p of unresolvedPts) tryLabel(p, 1.18 * S, true, false, true);
    for (const p of inDio) tryLabel(p, 1.18 * S, true, false, false);
    for (const p of outCanonical) tryLabel(p, 0.95 * S, false, true, false);

    // Neighbor diocese names — skip when the text would clip the frame
    const dioNames = (overlay.dioceses as OverlayDiocese[])
      .filter((d) => d.name !== dio.name)
      .filter((d) => d.cx > x0 && d.cx < x0 + w && d.cy > y0 && d.cy < y0 + h)
      .filter((d) => {
        const tw = est(d.name, 1.0 * S).w;
        return d.cx - tw / 2 > x0 && d.cx + tw / 2 < x0 + w;
      });

    const inDiocese = points.filter((p) => p.diocese === subject.diocese);
    return {
      subject,
      subjPlaced,
      dio,
      vb: { x0, y0, w, h },
      S,
      placed,
      labels,
      dioNames,
      inDioceseN: inDiocese.length,
      closedN: inDiocese.filter((p) => p.group === "closed").length,
    };
  }, [slug]);

  if (!model) return null;
  const { subject, subjPlaced, dio, vb, S, placed, labels, dioNames } = model;
  const subjWord =
    subject.group === "closed" && subject.closed
      ? `closed ${subject.closed}`
      : STATE_WORD[subject.group];

  return (
    <div>
      <div className="rounded-lg border border-rule overflow-hidden">
        <svg
          viewBox={`${vb.x0} ${vb.y0} ${vb.w} ${vb.h}`}
          className="w-full h-auto"
          role="img"
          aria-label={`${subject.name} in the ${dio.name} diocese, with every recorded Lithuanian parish around it`}
        >
          {/* Diocese layer */}
          {(overlay.dioceses as OverlayDiocese[]).map((d) => (
            <path
              key={d.name}
              d={d.path}
              fill={d.name === dio.name ? "var(--band)" : "var(--background)"}
              stroke="none"
            />
          ))}
          <path
            d={overlay.borders}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.22}
            strokeWidth={0.12 * S}
          />
          <path
            d={dio.path}
            fill="none"
            stroke="var(--mark-ink)"
            strokeOpacity={0.8}
            strokeWidth={0.3 * S}
          />

          {/* Diocese names */}
          {dioNames.map((d) => (
            <text
              key={d.name}
              x={d.cx}
              y={d.cy}
              textAnchor="middle"
              fontSize={1.0 * S}
              fontWeight={600}
              fill="var(--muted)"
              opacity={0.7}
              style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
              pointerEvents="none"
            >
              {d.name}
            </text>
          ))}
          <text
            x={dio.cx}
            y={Math.min(dio.bbox[3] + 1.6 * S, vb.y0 + vb.h - S)}
            textAnchor="middle"
            fontSize={1.0 * S}
            fontWeight={600}
            fill="var(--muted)"
            style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            pointerEvents="none"
          >
            {dio.name}
          </text>

          {/* Neighbor dots — living as open rings, the rest filled */}
          {placed
            .filter((p) => p.slug !== slug)
            .map((p) => {
              const alive = ALIVE.has(p.group);
              const r = (hot?.slug === p.slug ? 0.85 : 0.62) * S;
              return (
                <circle
                  key={p.slug}
                  cx={p.px}
                  cy={p.py}
                  r={r}
                  fill={alive ? "var(--background)" : END_STATE_COLOR[p.group]}
                  stroke={alive ? END_STATE_COLOR[p.group] : "var(--background)"}
                  strokeWidth={(alive ? 0.28 : 0.12) * S}
                  className={p.href ? "cursor-pointer" : undefined}
                  onMouseEnter={() => setHot(p)}
                  onMouseLeave={() => setHot(null)}
                  onClick={() => p.href && router.push(p.href)}
                >
                  <title>{`${p.name} — ${p.city}, ${p.state} · ${GROUP_LABEL[p.group]}${p.closed ? ` (${p.closed})` : ""}`}</title>
                </circle>
              );
            })}

          {/* Neighbor labels with halos + leaders */}
          {labels.map(({ p, box, fs, bold, quiet, leader }) => (
            <g key={`l-${p.slug}`} pointerEvents="none">
              {leader && (
                <line
                  x1={p.px}
                  y1={p.py}
                  x2={box.x + box.w / 2}
                  y2={box.y + box.h / 2}
                  stroke="var(--muted)"
                  strokeOpacity={0.55}
                  strokeWidth={0.07 * S}
                />
              )}
              <text
                x={box.x}
                y={box.y + box.h * 0.8}
                fontSize={fs}
                fontWeight={bold ? 700 : 400}
                fill={quiet ? "var(--muted)" : "var(--foreground)"}
                stroke="var(--background)"
                strokeWidth={fs * 0.22}
                paintOrder="stroke"
              >
                {p.name}
              </text>
            </g>
          ))}

          {/* The subject — filled, dashed halo, named with sub-line */}
          <g>
            <circle
              cx={subjPlaced.px}
              cy={subjPlaced.py}
              r={2.0 * S}
              fill="none"
              stroke={END_STATE_COLOR[subject.group]}
              strokeWidth={0.28 * S}
              strokeDasharray={`${0.5 * S} ${0.35 * S}`}
            />
            <circle
              cx={subjPlaced.px}
              cy={subjPlaced.py}
              r={1.25 * S}
              fill={END_STATE_COLOR[subject.group]}
              stroke="var(--background)"
              strokeWidth={0.2 * S}
            />
            <text
              x={subjPlaced.px}
              y={subjPlaced.py - 2.0 * S - 1.12 * S * 1.5 - 0.7 * S}
              textAnchor="middle"
              fontSize={1.55 * S}
              fontWeight={700}
              fill="var(--foreground)"
              stroke="var(--background)"
              strokeWidth={0.34 * S}
              paintOrder="stroke"
              className="font-serif"
              pointerEvents="none"
            >
              {subject.name}
            </text>
            <text
              x={subjPlaced.px}
              y={subjPlaced.py - 2.0 * S - 0.7 * S}
              textAnchor="middle"
              fontSize={1.12 * S}
              fontStyle="italic"
              fill="var(--muted)"
              stroke="var(--background)"
              strokeWidth={0.25 * S}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {`${subject.city} · ${subjWord}`}
            </text>
          </g>
        </svg>
      </div>

      {/* Readout + legend-caption */}
      <div className="mt-1.5 min-h-5 text-sm" aria-live="polite">
        {hot ? (
          <span>
            <span className="font-medium">{hot.name}</span>
            <span className="text-muted">
              {" "}
              — {hot.city}, {hot.state} · {GROUP_LABEL[hot.group]}
              {hot.closed ? ` (${hot.closed})` : ""}
              {hot.href ? " · click to open" : ""}
            </span>
          </span>
        ) : (
          <span className="text-muted">
            {`The ${dio.name} diocese holds ${model.inDioceseN} recorded Lithuanian ${
              model.inDioceseN === 1 ? "parish" : "parishes"
            }; ${model.closedN} ${model.closedN === 1 ? "is" : "are"} closed. Open rings are living parishes; filled dots are gone. Hover any dot; click to open its record.`}
          </span>
        )}
      </div>
    </div>
  );
}
