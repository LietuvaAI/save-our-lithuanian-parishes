// The one photo-rights gate. Every image the site displays must carry a
// cleared rights status — "legit across the board" (Vilija, 2026-07-26):
// no photograph renders on any page until its rights are traced and cleared.
// Entries with rights still being sought stay in data/photos.json as the
// provenance registry (pending_permission), but never reach a page.
// Enforced at build time by scripts/verify-photo-rights.mjs.
import photosData from "@/data/photos.json";

export type PhotoRights =
  | "permission_granted"
  | "public_domain"
  | "open_license"
  | "own_work"
  | "pending_permission";

export const CLEARED_RIGHTS: ReadonlySet<string> = new Set([
  "permission_granted",
  "public_domain",
  "open_license",
  "own_work",
]);

export type ParishPhoto = {
  src: string;
  alt: string;
  attribution: string;
  license?: string;
  archiveUrl?: string;
  evidenceUrl?: string;
  rights: PhotoRights;
  rightsNote?: string;
};

export type ParishPortraitState =
  | { state: "cleared"; photo: ParishPhoto }
  | { state: "pending_permission"; photo: null }
  | { state: "not_gathered"; photo: null };

function photoEntry(slug: string): ParishPhoto | null {
  return (
    (photosData.parishes as Record<string, ParishPhoto | undefined>)[slug] ??
    null
  );
}

/** Photo for a slug (canonical or registry), only if its rights are cleared. */
export function getClearedPhoto(slug: string): ParishPhoto | null {
  const entry = photoEntry(slug);
  if (!entry || !CLEARED_RIGHTS.has(entry.rights)) return null;
  return entry;
}

/** Prefer the site's line-art portrait when cleared, then fall back to the photo. */
export function getClearedParishPortrait(slug: string): ParishPhoto | null {
  return getClearedPhoto(`${slug}-line-drawing`) ?? getClearedPhoto(slug);
}

/**
 * Publication state for the reserved profile-image slot. Pending files never
 * leave the rights gate, but they remain distinguishable from images that have
 * not yet been gathered.
 */
export function getParishPortraitState(
  slugs: string | string[],
): ParishPortraitState {
  const candidates = [...new Set(Array.isArray(slugs) ? slugs : [slugs])]
    .flatMap((slug) => [photoEntry(`${slug}-line-drawing`), photoEntry(slug)])
    .filter((entry): entry is ParishPhoto => entry !== null);
  const cleared = candidates.find((entry) => CLEARED_RIGHTS.has(entry.rights));
  if (cleared) return { state: "cleared", photo: cleared };
  if (candidates.some((entry) => entry.rights === "pending_permission")) {
    return { state: "pending_permission", photo: null };
  }
  return { state: "not_gathered", photo: null };
}

/** Same gate for photo objects carried on canonical current-event entries. */
export function clearedOrNull<T extends { rights?: string }>(
  photo: T | null | undefined,
): T | null {
  if (!photo || !CLEARED_RIGHTS.has(photo.rights ?? "")) return null;
  return photo;
}
