#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publication = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/canonical-publication-projection.json"), "utf8"),
);
const infographic = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/canonical-infographic-projection.json"), "utf8"),
);
const photos = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/photos.json"), "utf8"),
).parishes;

const clearedRights = new Set([
  "open_license",
  "own_work",
  "permission_granted",
  "public_domain",
]);
const historyByProfile = new Map(
  infographic.institution_history.map((row) => [row.public_profile, row]),
);

const records = publication.public_institutions.map((institution) => {
  const profile = institution.public_profile;
  const slug = profile.split("/").filter(Boolean).at(-1);
  const drawingKey = `${slug}-line-drawing`;
  const drawing = photos[drawingKey] ?? null;
  const sourcePhoto = photos[slug] ?? null;
  const history = historyByProfile.get(profile) ?? null;
  const terminalSiteIds = history?.terminal_worship_site_ids ?? [];
  const drawingCleared = Boolean(drawing && clearedRights.has(drawing.rights));
  const drawingAssetExists = Boolean(
    drawing?.src && fs.existsSync(path.join(ROOT, "public", drawing.src)),
  );
  const sourcePhotoCleared = Boolean(
    sourcePhoto && clearedRights.has(sourcePhoto.rights),
  );

  let queue = "covered";
  if (!drawingCleared && sourcePhotoCleared) {
    queue = "cleared_reference_ready";
  } else if (!drawingCleared && terminalSiteIds.length > 0) {
    queue = "reference_needed_for_identified_terminal_site";
  } else if (!drawingCleared) {
    queue = "depicted_site_identity_needed";
  }

  return {
    profile,
    slug,
    name: institution.name,
    city: institution.city,
    state: institution.state,
    institution_class: institution.institution_class,
    record_type: institution.record_type,
    drawing_key: drawingKey,
    drawing_cleared: drawingCleared,
    drawing_asset_exists: drawingAssetExists,
    drawing_rights: drawing?.rights ?? null,
    source_photo_rights: sourcePhoto?.rights ?? null,
    terminal_worship_site_ids: terminalSiteIds,
    queue,
  };
});

const broken = records.filter(
  (record) => record.drawing_cleared && !record.drawing_asset_exists,
);
if (broken.length > 0) {
  throw new Error(
    `Cleared drawing entries have missing assets: ${broken.map((row) => row.drawing_key).join(", ")}`,
  );
}

const queueCounts = Object.fromEntries(
  [...new Set(records.map((record) => record.queue))]
    .sort()
    .map((queue) => [queue, records.filter((record) => record.queue === queue).length]),
);
const result = {
  projection_revision: publication.revision_id,
  infographic_revision: infographic.revision_id,
  public_profiles: records.length,
  cleared_line_drawings: records.filter((record) => record.drawing_cleared).length,
  remaining_profiles: records.filter((record) => !record.drawing_cleared).length,
  queue_counts: queueCounts,
  records,
};

if (process.argv.includes("--summary")) {
  console.log(
    JSON.stringify(
      {
        projection_revision: result.projection_revision,
        infographic_revision: result.infographic_revision,
        public_profiles: result.public_profiles,
        cleared_line_drawings: result.cleared_line_drawings,
        remaining_profiles: result.remaining_profiles,
        queue_counts: result.queue_counts,
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify(result, null, 2));
}
