// ============================================================================
// Unified Status System
// ============================================================================
//
// THREE dimensions describe every parish. Each has its own type, labels, and
// colors drawn from the site's CSS variable palette. This file is the SINGLE
// source of truth — every page, table, map, and profile imports from here.
//
//   1. Lithuanian Identity — "Is it still ours?"
//   2. Current Signal      — "Is something happening right now?"
//   3. Building Fate       — "What happened to the physical structure?"
//
// Colors use the five --mark-* CSS variables defined in globals.css.
// No raw hex values, no per-page color overrides.
// ============================================================================

import type { LithuanianIdentity, BuildingFate } from "@/lib/parishes";
import { PARISH_STATUS_LABEL } from "@/lib/status-copy";

// ── Dimension 1: Lithuanian Identity ─────────────────────────────────────────
// The cultural inheritance question. Reuses LithuanianIdentity from
// lib/parishes.ts, plus "unknown" for parishes not yet verified.

export type IdentityStatus = LithuanianIdentity | "unknown";

export const IDENTITY_LABEL: Record<IdentityStatus, string> = {
  active_parish: PARISH_STATUS_LABEL.active_parish,
  mass_continues: PARISH_STATUS_LABEL.mass_continues,
  ethnically_transferred: PARISH_STATUS_LABEL.transferred,
  lost: "Identity lost",
  unknown: PARISH_STATUS_LABEL.unverified,
};

export const IDENTITY_COLOR: Record<IdentityStatus, string> = {
  active_parish: "var(--es-active)",
  mass_continues: "var(--es-mass)",
  ethnically_transferred: "var(--es-transferred)",
  lost: "var(--es-closed)",
  unknown: "var(--muted)",
};

export const IDENTITY_TEXT: Record<IdentityStatus, string> = {
  active_parish: "#fff",
  mass_continues: "#10261b",
  ethnically_transferred: "#1c1917",
  lost: "#fff",
  unknown: "var(--foreground)",
};

export const IDENTITY_ORDER: IdentityStatus[] = [
  "active_parish",
  "mass_continues",
  "ethnically_transferred",
  "lost",
  "unknown",
];

// ── Dimension 2: Current Signal ──────────────────────────────────────────────
// What is happening right now. Derived from the Brain current-events projection and the
// sustainabilityWatch array.

export type AlertStatus =
  | "active_campaign"
  | "watched"
  | "building_at_risk"
  | "sustainability"
  | "none";

export const ALERT_LABEL: Record<AlertStatus, string> = {
  active_campaign: "Active campaign",
  watched: "Development to monitor",
  building_at_risk: "Building at risk",
  sustainability: "Pastoral profile",
  none: "",
};

export const ALERT_COLOR: Record<AlertStatus, string> = {
  active_campaign: "var(--es-closed)",
  watched: "var(--es-transferred)",
  building_at_risk: "var(--mark-building)",
  sustainability: "var(--es-mass)",
  none: "transparent",
};

export const ALERT_TEXT: Record<AlertStatus, string> = {
  active_campaign: "#fff",
  watched: "#1c1917",
  building_at_risk: "#fff",
  sustainability: "#10261b",
  none: "",
};

/** Display order for filter dropdowns (excludes "none"). */
export const ALERT_ORDER: AlertStatus[] = [
  "active_campaign",
  "watched",
  "building_at_risk",
  "sustainability",
];

// ── Dimension 3: Building Fate ───────────────────────────────────────────────
// What happened to the physical structure. Reuses BuildingFate from
// lib/parishes.ts (already includes "unknown").

export type FateStatus = BuildingFate;

export const FATE_LABEL: Record<FateStatus, string> = {
  standing: "Building standing",
  demolished: "Demolished",
  repurposed_religious: "Repurposed (religious)",
  repurposed_secular: "Repurposed (secular)",
  derelict: "Derelict",
  unknown: "Fate unknown",
};

export const FATE_COLOR: Record<FateStatus, string> = {
  standing: "var(--es-active)",
  demolished: "var(--es-closed)",
  repurposed_religious: "var(--es-closed)",
  repurposed_secular: "var(--es-closed)",
  derelict: "var(--es-unverified)",
  unknown: "var(--muted)",
};

export const FATE_TEXT: Record<FateStatus, string> = {
  standing: "#fff",
  demolished: "#fff",
  repurposed_religious: "#fff",
  repurposed_secular: "#fff",
  derelict: "#1c1917",
  unknown: "var(--foreground)",
};

export const FATE_ORDER: FateStatus[] = [
  "standing",
  "demolished",
  "repurposed_religious",
  "repurposed_secular",
  "derelict",
  "unknown",
];

// ── Resolution helpers ───────────────────────────────────────────────────────

/** Map a canonical current-event kind plus sustainability-watch membership to AlertStatus. */
export function resolveAlertStatus(
  alertKind: "active" | "watch" | "building" | null,
  onSustainabilityWatch: boolean,
): AlertStatus {
  if (alertKind === "active") return "active_campaign";
  if (alertKind === "watch") return "watched";
  if (alertKind === "building") return "building_at_risk";
  if (onSustainabilityWatch) return "sustainability";
  return "none";
}

/** Map a nullable LithuanianIdentity to IdentityStatus. */
export function resolveIdentity(
  value: LithuanianIdentity | null | undefined,
): IdentityStatus {
  return value ?? "unknown";
}

/** Map a nullable BuildingFate to FateStatus. */
export function resolveFate(
  value: BuildingFate | null | undefined,
): FateStatus {
  return value ?? "unknown";
}
