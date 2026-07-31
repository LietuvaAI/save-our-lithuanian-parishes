// Blocking source and depth guard for every publishable registry profile.
//
// Extraction placeholders may remain in research provenance, but a public
// institution must expose at least one source that the profile renderer can
// turn into a working evidence-ledger link.
import { readFileSync } from "node:fs";

const registry = JSON.parse(
  readFileSync(new URL("../data/registry-unified.json", import.meta.url), "utf8"),
);
const records = registry.parishes;
const errors = [];

const bookAxes = new Set(["wolkovich", "michelsonas-1961", "lukas-2009"]);
const isAbsoluteWebUrl = (value) => /^https?:\/\//i.test(value ?? "");
const isLinkableSource = (source) => {
  const axis = source.axis ?? "";
  if (bookAxes.has(axis)) return true;
  if (axis.startsWith("draugas")) return true;
  return isAbsoluteWebUrl(source.sourceUrl);
};
const expectedDepth = (record) => {
  const axes = new Set(
    (record.sources ?? []).map((source) =>
      source.axis?.startsWith("draugas") ? "draugas" : source.axis,
    ),
  );
  return {
    axes: axes.size,
    depth: record.in_locked_scope
      ? "case-filed"
      : axes.size >= 2
        ? "multi-source"
        : "single-source",
  };
};

for (const record of records) {
  const expected = expectedDepth(record);
  if (record.axes_count !== expected.axes) {
    errors.push(
      `${record.slug}: axes_count=${record.axes_count}, expected ${expected.axes}`,
    );
  }
  if (record.record_depth !== expected.depth) {
    errors.push(
      `${record.slug}: record_depth=${record.record_depth}, expected ${expected.depth}`,
    );
  }

  if (!record.public_census?.included) continue;
  if (!(record.sources ?? []).some(isLinkableSource)) {
    errors.push(
      `${record.slug}: public profile has no linkable registry source`,
    );
  }
}

if (errors.length) {
  console.error(`PUBLIC SOURCE INTEGRITY VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const publicRecords = records.filter((record) => record.public_census?.included);
console.log(
  `OK: public source integrity — ${publicRecords.length} U.S. institutions have linkable evidence; ${records.length} depth labels reconciled.`,
);
