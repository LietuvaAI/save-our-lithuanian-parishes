// One-time Registry Revision 1 reconciliation for the classifier overlay.
// Registry aliases are rewritten to canonical slugs and duplicate overlay-only
// rows are retired. Classifier evidence remains site-owned.
import { readFileSync, writeFileSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const registry = read("data/registry-unified.json");
const path = "data/parish-situation.json";
const situation = read(path);

const aliasToCanonical = new Map();
for (const record of registry.parishes) {
  for (const alias of record.aliases ?? []) {
    aliasToCanonical.set(alias, record.slug);
  }
}

for (const entry of Object.values(situation.parishes)) {
  entry.registry_slug =
    aliasToCanonical.get(entry.registry_slug) ?? entry.registry_slug;
  const record = registry.parishes.find(
    (candidate) => candidate.slug === entry.registry_slug,
  );
  if (record?.lifecycle?.identity) {
    entry.lithuanian_identity = record.lifecycle.identity;
  }
  if (record?.lifecycle?.canonical_status) {
    entry.canonical_status = record.lifecycle.canonical_status;
  }
}

const duplicateOverlayKeys = [
  "our-lady-of-sorrows-kearny-nj",
  "sorrows-kearny-nj",
  "mary-kearny-nj",
  "lithuanian-church-harrison-nj",
  "st-casimir-chicago-heights-il",
  "holyname-baltimore-md",
  "casimir-waterbury-ct",
  "parish-westville-il",
  "parish-westville-il-2",
];
for (const key of duplicateOverlayKeys) delete situation.parishes[key];

const replace = (key, oldText, newText) => {
  const entry = situation.parishes[key];
  if (entry?.situation?.includes(oldText)) {
    entry.situation = entry.situation.replace(oldText, newText);
  }
};
replace(
  "sv-kazimiero-chicago-il",
  "City correction queued upstream; the canonical row reads 'Chicago' until the next snapshot.",
  "Registry Revision 1 resolves the canonical city to Chicago Heights.",
);
replace(
  "unnamed-lithuanian-parish-baltimore-md",
  "The registry entry awaits merging into the St. Alphonsus record at the next refresh.",
  "Registry Revision 1 merges this source row into St. Alphonsus.",
);
replace(
  "sv-kazimiero-waterbury-ct",
  "The record holds the entry open pending reconciliation.",
  "Registry Revision 1 retires this false duplicate and carries its source into St. Joseph.",
);

writeFileSync(path, `${JSON.stringify(situation, null, 2)}\n`);
console.log(
  `Registry Revision 1 overlay: ${aliasToCanonical.size} aliases reconciled; ${duplicateOverlayKeys.length} duplicate overlay keys retired.`,
);
