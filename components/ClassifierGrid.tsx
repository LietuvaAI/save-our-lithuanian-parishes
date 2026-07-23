import Link from "next/link";
import {
  type BuildingFate,
  type LithuanianIdentity,
  type Ownership,
  type ParishSituation,
  BUILDING_FATE_LABEL,
  BUILDING_FATE_LINK,
  LITHUANIAN_IDENTITY_LABEL,
  LITHUANIAN_IDENTITY_LINK,
  OWNERSHIP_SHORT,
  OWNERSHIP_LINK,
} from "@/lib/parishes";

/**
 * Prominent, clickable classifier grid for parish profile pages.
 * Each cell links to the matching section on /full-picture so users
 * can explore all parishes with the same classification.
 */
export function ClassifierGrid({
  situation,
  ownership,
  coalRegion,
}: {
  situation: ParishSituation;
  ownership: Ownership;
  coalRegion?: boolean;
}) {
  const cells: {
    label: string;
    value: string;
    href?: string;
    accent?: string;
  }[] = [
    {
      label: "Building",
      value: BUILDING_FATE_LABEL[situation.building_fate],
      href: BUILDING_FATE_LINK[situation.building_fate],
      accent: accentForFate(situation.building_fate),
    },
    {
      label: "Lithuanian identity",
      value: LITHUANIAN_IDENTITY_LABEL[situation.lithuanian_identity],
      href: LITHUANIAN_IDENTITY_LINK[situation.lithuanian_identity],
      accent: accentForIdentity(situation.lithuanian_identity),
    },
    {
      label: "Ownership",
      value: OWNERSHIP_SHORT[ownership],
      href: OWNERSHIP_LINK,
    },
  ];

  if (
    situation.current_use &&
    situation.current_use !== "Unknown" &&
    situation.current_use !== "Demolished"
  ) {
    cells.push({
      label: "Current use",
      value: situation.current_use,
    });
  }

  if (coalRegion) {
    cells.push({
      label: "Region",
      value: "Pennsylvania coal region",
      href: "/full-picture#coal-region",
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {cells.map((cell) => {
        const inner = (
          <>
            <span className="text-xs uppercase tracking-wide text-muted">
              {cell.label}
            </span>
            <span className="mt-0.5 font-medium flex items-center gap-1.5">
              {cell.accent && (
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: cell.accent }}
                />
              )}
              {cell.value}
              {cell.href && (
                <span className="text-muted text-xs ml-auto shrink-0">
                  see all →
                </span>
              )}
            </span>
          </>
        );

        if (cell.href) {
          return (
            <Link
              key={cell.label}
              href={cell.href}
              className="flex flex-col rounded-lg border border-rule px-3.5 py-2.5 hover:border-foreground/40 transition-colors"
            >
              {inner}
            </Link>
          );
        }
        return (
          <div
            key={cell.label}
            className="flex flex-col rounded-lg border border-rule px-3.5 py-2.5"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

function accentForFate(fate: BuildingFate): string | undefined {
  switch (fate) {
    case "demolished":
      return "var(--mark-closed)";
    case "standing":
      return "var(--mark-standing)";
    case "derelict":
      return "var(--mark-closed)";
    default:
      return undefined;
  }
}

function accentForIdentity(id: LithuanianIdentity): string | undefined {
  switch (id) {
    case "active_parish":
      return "var(--mark-standing)";
    case "lost":
      return "var(--mark-closed)";
    default:
      return undefined;
  }
}
