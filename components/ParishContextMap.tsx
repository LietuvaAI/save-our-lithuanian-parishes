"use client";

// ============================================================================
// ParishContextMap — the parish among its neighbors: a diocese-level zoom
// showing which diocese the parish sits in and what happened to every
// recorded Lithuanian parish around it. The site's thesis in one graphic —
// no parish in isolation. Shares its data layer with the Hearth dispatch
// renderer (data/context-points.json + data/diocese-overlay.json), so a
// dispatch map and a profile map can never disagree.
// Same-city points are fanned at THIS zoom's scale (true coordinates
// underneath — the national map's fanning is wrong at diocese zoom).
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

const PAD = 0.35;
const ASPECT = 4 / 3;

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

    // View: diocese bbox, padded, aspect-corrected
    let [x0, y0, x1, y1] = dio.bbox;
    const pw = (x1 - x0) * PAD;
    const ph = (y1 - y0) * PAD;
    x0 -= pw; x1 += pw; y0 -= ph; y1 += ph;
    let w = x1 - x0;
    let h = y1 - y0;
    if (w / h < ASPECT) {
      const grow = h * ASPECT - w;
      x0 -= grow / 2; w = h * ASPECT;
    } else {
      const grow = w / ASPECT - h;
      y0 -= grow / 2; h = w / ASPECT;
    }

    // Points in view
    const inView = points.filter(
      (p) => p.x >= x0 && p.x <= x0 + w && p.y >= y0 && p.y <= y0 + h,
    );

    // Fan same-city groups at this zoom's scale; the subject keeps center.
    const byCity = new Map<string, CtxPoint[]>();
    for (const p of inView) {
      const k = `${p.city}|${p.state}`;
      if (!byCity.has(k)) byCity.set(k, []);
      byCity.get(k)!.push(p);
    }
    const placed: (CtxPoint & { px: number; py: number })[] = [];
    const fanR = w * 0.03;
    for (const group of byCity.values()) {
      if (group.length === 1) {
        placed.push({ ...group[0], px: group[0].x, py: group[0].y });
        continue;
      }
      const subjIdx = group.findIndex((p) => p.slug === slug);
      const ring = group.filter((_, i) => i !== subjIdx);
      if (subjIdx >= 0)
        placed.push({ ...group[subjIdx], px: group[subjIdx].x, py: group[subjIdx].y });
      ring.forEach((p, i) => {
        const a = (2 * Math.PI * i) / ring.length - Math.PI / 2.5;
        placed.push({
          ...p,
          px: p.x + fanR * Math.cos(a),
          py: p.y + fanR * Math.sin(a),
        });
      });
    }

    // Diocese loss line for the caption
    const inDiocese = points.filter((p) => p.diocese === subject.diocese);
    const closedN = inDiocese.filter((p) => p.group === "closed").length;

    return {
      subject,
      dio,
      vb: { x0, y0, w, h },
      placed,
      dotR: Math.max(w * 0.011, 1.6),
      inDioceseN: inDiocese.length,
      closedN,
    };
  }, [slug]);

  if (!model) return null;
  const { subject, dio, vb, placed, dotR } = model;

  return (
    <div>
      <div className="rounded-lg border border-rule overflow-hidden">
        <svg
          viewBox={`${vb.x0} ${vb.y0} ${vb.w} ${vb.h}`}
          className="w-full h-auto"
          role="img"
          aria-label={`${subject.name} in the ${dio.name} diocese, with every recorded Lithuanian parish around it`}
        >
          {/* Diocese fills — the subject's diocese carries a whisper of tint */}
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
            strokeOpacity={0.25}
            strokeWidth={vb.w * 0.0022}
          />

          {/* Diocese name, small caps in the corner of its territory */}
          <text
            x={dio.cx}
            y={dio.cy}
            textAnchor="middle"
            fontSize={vb.w * 0.028}
            fontWeight={600}
            fill="var(--muted)"
            opacity={0.55}
            style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            pointerEvents="none"
          >
            {dio.name}
          </text>

          {/* Neighbor parishes */}
          {placed
            .filter((p) => p.slug !== slug)
            .map((p) => (
              <circle
                key={p.slug}
                cx={p.px}
                cy={p.py}
                r={hot?.slug === p.slug ? dotR * 1.5 : dotR}
                fill={END_STATE_COLOR[p.group]}
                stroke="var(--background)"
                strokeWidth={dotR * 0.28}
                className={p.href ? "cursor-pointer" : undefined}
                onMouseEnter={() => setHot(p)}
                onMouseLeave={() => setHot(null)}
                onClick={() => p.href && router.push(p.href)}
              >
                <title>{`${p.name} — ${p.city}, ${p.state} · ${GROUP_LABEL[p.group]}${p.closed ? ` (${p.closed})` : ""}`}</title>
              </circle>
            ))}

          {/* The subject — enlarged, ringed, named */}
          {(() => {
            const s = placed.find((p) => p.slug === slug) ?? {
              ...subject,
              px: subject.x,
              py: subject.y,
            };
            const r = dotR * 1.9;
            const labelY = s.py - r - vb.w * 0.012;
            return (
              <g>
                <circle
                  cx={s.px}
                  cy={s.py}
                  r={r * 1.55}
                  fill="none"
                  stroke={END_STATE_COLOR[s.group]}
                  strokeOpacity={0.45}
                  strokeWidth={r * 0.28}
                />
                <circle
                  cx={s.px}
                  cy={s.py}
                  r={r}
                  fill={END_STATE_COLOR[s.group]}
                  stroke="var(--background)"
                  strokeWidth={r * 0.22}
                />
                <text
                  x={s.px}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={vb.w * 0.03}
                  fontWeight={700}
                  fill="var(--foreground)"
                  stroke="var(--background)"
                  strokeWidth={vb.w * 0.008}
                  paintOrder="stroke"
                  className="font-serif"
                >
                  {subject.name}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Readout + caption */}
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
            }; ${model.closedN} ${model.closedN === 1 ? "is" : "are"} closed. Hover any dot; click to open its record.`}
          </span>
        )}
      </div>
    </div>
  );
}
