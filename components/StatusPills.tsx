"use client";

// ============================================================================
// StatusPills — the shared pill components for the unified status system.
// Used by: RegistryTable, parish profiles, ClassifierGrid, map popups.
// ============================================================================

import {
  type IdentityStatus,
  type AlertStatus,
  type FateStatus,
  IDENTITY_LABEL,
  IDENTITY_COLOR,
  IDENTITY_TEXT,
  ALERT_LABEL,
  ALERT_COLOR,
  ALERT_TEXT,
  FATE_LABEL,
  FATE_COLOR,
  FATE_TEXT,
} from "@/lib/unified-status";

function Pill({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  if (!label) return null;
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

export function IdentityPill({ value }: { value: IdentityStatus }) {
  return (
    <Pill
      label={IDENTITY_LABEL[value]}
      bg={IDENTITY_COLOR[value]}
      fg={IDENTITY_TEXT[value]}
    />
  );
}

export function AlertPill({ value }: { value: AlertStatus }) {
  if (value === "none") return null;
  return (
    <Pill
      label={ALERT_LABEL[value]}
      bg={ALERT_COLOR[value]}
      fg={ALERT_TEXT[value]}
    />
  );
}

export function FatePill({ value }: { value: FateStatus }) {
  return (
    <Pill
      label={FATE_LABEL[value]}
      bg={FATE_COLOR[value]}
      fg={FATE_TEXT[value]}
    />
  );
}

/** Renders all three dimension pills together in a row. */
export function StatusPills({
  identity,
  alert,
  fate,
  compact,
}: {
  identity: IdentityStatus;
  alert: AlertStatus;
  fate: FateStatus;
  /** When true, suppress "unknown" / "none" pills to reduce noise. */
  compact?: boolean;
}) {
  const showIdentity = !compact || identity !== "unknown";
  const showAlert = alert !== "none";
  const showFate = !compact || fate !== "unknown";

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {showIdentity && <IdentityPill value={identity} />}
      {showAlert && <AlertPill value={alert} />}
      {showFate && <FatePill value={fate} />}
    </span>
  );
}
