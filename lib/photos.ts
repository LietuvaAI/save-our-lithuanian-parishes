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

/** Photo for a slug (canonical or registry), only if its rights are cleared. */
export function getClearedPhoto(slug: string): ParishPhoto | null {
  const entry = (
    photosData.parishes as Record<string, ParishPhoto | undefined>
  )[slug];
  if (!entry || !CLEARED_RIGHTS.has(entry.rights)) return null;
  return entry as ParishPhoto;
}

/** Same gate for photo objects carried on alerts.json entries. */
export function clearedOrNull<T extends { rights?: string }>(
  photo: T | null | undefined,
): T | null {
  if (!photo || !CLEARED_RIGHTS.has(photo.rights ?? "")) return null;
  return photo;
}
