"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface BarParish {
  slug: string;
  name: string;
  city: string;
  state: string;
  situation: string;
  currentUse: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
}

export interface BarItem {
  key: string;
  label: string;
  count: number;
  color: string;
  opacity: number;
  parishes: BarParish[];
}

export default function ExpandableBarChart({
  items,
  total,
}: {
  items: BarItem[];
  total: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <dl className="space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          const isExpanded = expanded === item.key;
          return (
            <div key={item.key}>
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : item.key)}
                className="w-full flex items-baseline gap-3 text-left group cursor-pointer"
              >
                <dd className="font-serif text-section-title font-semibold w-10 text-right shrink-0">
                  {item.count}
                </dd>
                <div className="flex-1">
                  <dt className="font-medium group-hover:underline">
                    {item.label}
                    <span className="ml-1.5 text-small-copy text-muted font-normal">
                      {isExpanded ? "▴" : "▾"}
                    </span>
                  </dt>
                  <div className="mt-1 h-2 rounded-full bg-rule overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: item.color,
                        opacity: item.opacity,
                      }}
                    />
                  </div>
                </div>
              </button>
              {isExpanded && (
                <ul className="mt-3 ml-[3.25rem] space-y-2">
                  {item.parishes.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/parishes/${p.slug}`}
                        className="group/item flex gap-3 rounded-lg border border-rule px-4 py-3 hover:border-foreground/40 transition-colors"
                      >
                        {p.photoUrl && (
                          <div className="w-16 h-12 shrink-0 overflow-hidden rounded mt-0.5">
                            <Image
                              src={p.photoUrl}
                              alt={p.photoAlt ?? p.name}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-medium group-hover/item:underline">
                              {p.name}
                            </span>
                            <span className="text-body-copy text-muted">
                              {p.city}, {p.state}
                            </span>
                          </div>
                          <p className="mt-1 text-body-copy text-muted leading-relaxed">
                            {p.situation}
                          </p>
                          {p.currentUse &&
                            p.currentUse !== "Unknown" && (
                              <p className="mt-0.5 text-small-copy text-muted">
                                Now: {p.currentUse}
                              </p>
                            )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
