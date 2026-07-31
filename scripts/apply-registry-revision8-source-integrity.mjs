// Apply Registry Revision 8 from the source-integrity and identity audit.
//
// Revision 7 made every published figure derive from one registry. This
// revision repairs the remaining cases where extraction rows were promoted to
// public institutions before entity identity had been adjudicated.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const registryPath = new URL("../data/registry-unified.json", import.meta.url);
const situationPath = new URL("../data/parish-situation.json", import.meta.url);
const revisionHistoryPath = new URL(
  "../data/registry-revisions.json",
  import.meta.url,
);
const reportPath = new URL(
  "../data/candidates/registry-revision-8-source-integrity-2026-07-31.md",
  import.meta.url,
);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const situations = JSON.parse(readFileSync(situationPath, "utf8"));
const revisionHistory = JSON.parse(
  readFileSync(revisionHistoryPath, "utf8"),
);

if (registry.registryRevision?.version !== 7) {
  throw new Error(
    `Expected Registry Revision 7, found ${registry.registryRevision?.version ?? "none"}.`,
  );
}
if (registry.parishes?.length !== 197) {
  throw new Error(`Expected 197 records, found ${registry.parishes?.length}.`);
}
if (revisionHistory.revisions?.at(-1)?.version !== 7) {
  throw new Error("Expected registry revision ledger to end at Revision 7.");
}

const bySlug = new Map(registry.parishes.map((record) => [record.slug, record]));
const requireRecord = (slug) => {
  const record = bySlug.get(slug);
  if (!record) throw new Error(`Missing registry record: ${slug}`);
  return record;
};
const uniqueByJson = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const uniqueStrings = (values) =>
  [...new Set(values.filter((value) => value != null && value !== ""))];
const addAliases = (record, aliases) => {
  record.aliases = uniqueStrings([...(record.aliases ?? []), ...aliases]);
};
const addSources = (record, sources) => {
  record.sources = uniqueByJson([...(record.sources ?? []), ...sources]);
};
const addConflict = (record, conflict) => {
  record.conflicts = uniqueByJson([...(record.conflicts ?? []), conflict]);
};
const mergeYears = (target, source) => {
  target.years = {
    founded: uniqueByJson([
      ...(target.years?.founded ?? []),
      ...(source.years?.founded ?? []),
    ]),
    closed: uniqueByJson([
      ...(target.years?.closed ?? []),
      ...(source.years?.closed ?? []),
    ]),
  };
};
const refreshDepth = (record) => {
  const axes = new Set(
    (record.sources ?? []).map((source) =>
      source.axis?.startsWith("draugas") ? "draugas" : source.axis,
    ),
  );
  record.axes_count = axes.size;
  record.record_depth = record.in_locked_scope
    ? "case-filed"
    : axes.size >= 2
      ? "multi-source"
      : "single-source";
};
const stamp = (record, status, caveat) => {
  record.adjudication = {
    date: "2026-07-31",
    cite: "data/candidates/registry-revision-8-source-integrity-2026-07-31.md",
    status,
  };
  if (caveat) record.caveat = caveat;
};
const publicTypes = new Set(["parish", "misija", "congregation"]);
const bookAxes = new Set(["wolkovich", "michelsonas-1961", "lukas-2009"]);
const qualifyingSourceFamily = (source) => {
  const axis = source.axis ?? "";
  if (bookAxes.has(axis)) return source.pages ? axis : null;
  if (axis.startsWith("draugas")) {
    const hasIssueDate = /\b(?:1[89]\d{2}|20[0-2]\d)-\d{2}-\d{2}\b/.test(
      `${source.cites ?? ""} ${source.first_mention ?? ""}`,
    );
    return hasIssueDate && source.total_mentions !== 0 ? "draugas" : null;
  }
  return /^https?:\/\//i.test(source.sourceUrl ?? "") ? axis : null;
};
const identitySupport = (record) => {
  if (record.in_locked_scope) return "canonical_case_file";
  const families = new Set(
    (record.sources ?? []).map(qualifyingSourceFamily).filter(Boolean),
  );
  if (families.size >= 2) return "multi_source_corroborated";
  if (families.size === 1) return "single_source_attested";
  return "unsupported";
};
const applyPublicCensusScope = (record) => {
  let scope;
  let reason;
  if (record.record_type === "phase") {
    scope = "historical_phase";
    reason = "Historical organizing phase or attempt; not counted as an institution.";
  } else if (record.record_type === "lead") {
    scope = "research_lead";
    reason = "Unresolved research lead; not counted until identity is adjudicated.";
  } else if (record.record_type === "context") {
    scope = "context_only";
    reason = "Contextual person, organization, site, or event; not an institution row.";
  } else if (record.country === "CA" && publicTypes.has(record.record_type)) {
    scope = "canadian_comparator";
    reason = "Canadian comparator institution; excluded from the U.S. census.";
  } else if (record.country !== "US" && publicTypes.has(record.record_type)) {
    scope = "international_institution";
    reason = "Institution outside the United States; excluded from the U.S. census.";
  } else if (record.country === "US" && publicTypes.has(record.record_type)) {
    scope = "public_us_institution";
    reason = "Adjudicated U.S. parish, mission, or congregation included in the public census.";
  } else {
    throw new Error(
      `${record.slug}: cannot assign public census scope for ${record.record_type}/${record.country}`,
    );
  }
  record.public_census = {
    included: scope === "public_us_institution",
    scope,
    reason,
    identity_support:
      scope === "public_us_institution"
        ? identitySupport(record)
        : null,
  };
  if (
    record.public_census.included &&
    record.public_census.identity_support === "unsupported"
  ) {
    throw new Error(`${record.slug}: public census record has no qualifying evidence`);
  }
};

const removedSlugs = new Set();
const mergeSameEntity = (
  canonicalSlug,
  duplicateSlug,
  { note, keepNames = true, keepYears = true, preferExactGeo = false },
) => {
  const canonical = requireRecord(canonicalSlug);
  const duplicate = requireRecord(duplicateSlug);

  addAliases(canonical, [duplicate.slug, ...(duplicate.aliases ?? [])]);
  addSources(canonical, duplicate.sources ?? []);
  canonical.conflicts = uniqueByJson([
    ...(canonical.conflicts ?? []),
    ...(duplicate.conflicts ?? []),
  ]);
  if (keepNames) {
    canonical.names.variants = uniqueStrings([
      ...(canonical.names?.variants ?? []),
      duplicate.names?.lt,
      duplicate.names?.en,
      ...(duplicate.names?.variants ?? []),
    ]);
  }
  if (keepYears) mergeYears(canonical, duplicate);
  if (
    preferExactGeo &&
    duplicate.geo?.precision === "exact" &&
    canonical.geo?.precision !== "exact"
  ) {
    canonical.geo = structuredClone(duplicate.geo);
  }
  stamp(canonical, "same-entity-shell-collapsed", note);
  removedSlugs.add(duplicateSlug);
  return canonical;
};

// Global True Lithuania point 131 is Brooklyn Annunciation. The old importer
// assigned it to Maspeth by nearest-city heuristic, creating a false parish.
const brooklynAnnunciation = mergeSameEntity(
  "annunciation-brooklyn-ny",
  "annunciation-maspeth-ny",
  {
    note:
      "The Global True Lithuania Annunciation point is in Williamsburg, Brooklyn. The Maspeth assignment was a nearest-city import error; Transfiguration remains the distinct Maspeth parish.",
    keepNames: true,
    keepYears: false,
    preferExactGeo: true,
  },
);
brooklynAnnunciation.sources = brooklynAnnunciation.sources.map((source) =>
  source.axis === "truelithuania" && source.tlId === 131
    ? { ...source, sourceUrl: source.sourceUrl.replace(/^http:/, "https:") }
    : source,
);
brooklynAnnunciation.conflicts = (brooklynAnnunciation.conflicts ?? []).filter(
  (conflict) => conflict.field !== "status+titular",
);

// Indian Harbor is an East Chicago neighborhood, not a second St. Francis.
mergeSameEntity("francis-east-chicago-in", "francis-indian-harbor-in", {
  note:
    "Wolkovich's Indian Harbor entry and the case-filed East Chicago St. Francis describe the same parish. The 1987 and 1989 end readings remain visible as a source conflict.",
  keepNames: true,
  keepYears: true,
});

// Michelsonas's Pittsburgh St. Vincent is the Esplen parish.
const esplen = mergeSameEntity("paul-esplen-pa", "vincent-pittsburgh-pa", {
  note:
    "Michelsonas's Pittsburgh St. Vincent entry is St. Vincent de Paul in the Esplen neighborhood, not an additional Pittsburgh parish.",
  keepNames: true,
  keepYears: true,
});
addSources(esplen, [
  {
    axis: "truelithuania",
    kind: "field-survey",
    work: "Global True Lithuania: Pittsburgh, Pennsylvania",
    sourceUrl: "https://global.truelithuania.com/pittsburgh-pennsylvania-1133/",
  },
]);

// These two source shells carry useful evidence, but their extracted names
// are not valid aliases. Preserve the source and record the identity repair
// without carrying the false titular or free-text pseudo-years into display.
const mahanoy = requireRecord("st-joseph-mahanoy-city-pa");
const falseMahanoy = requireRecord("george-mahanoy-city-pa");
addAliases(mahanoy, [falseMahanoy.slug]);
addSources(
  mahanoy,
  (falseMahanoy.sources ?? []).map((source) => ({
    ...source,
    identity_note:
      "This passage supports the early organization of Mahanoy City's Lithuanian St. Joseph parish; it does not establish a separate St. George parish.",
  })),
);
addSources(mahanoy, [
  {
    axis: "diocese-of-allentown",
    kind: "official-diocesan-directory",
    publisher: "Diocese of Allentown",
    work: "Diocese of Allentown 2025-2026 directory",
    accessed: "2026-07-31",
    sourceUrl:
      "https://www.allentowndiocese.org/sites/default/files/2025-11/2025-2026%20Directory_0.pdf",
  },
]);
addConflict(mahanoy, {
  field: "source identity and organization date",
  variants: [
    {
      value: "Lithuanian organizing and fundraising underway by 1874",
      source: "michelsonas-1961",
      cite: "pp. 21-22",
    },
    {
      value: "St. Joseph parish founded 1888",
      source: "draugas-registry-1909-2007",
    },
  ],
  note:
    "The earlier reading is an organizing phase, not a second parish or a selected parish-founding year.",
});
stamp(
  mahanoy,
  "false-identity-shell-collapsed",
  "The extracted St. George shell was a source-to-entity join error. Its evidence now supports St. Joseph without creating a false 1911 closure.",
);
removedSlugs.add(falseMahanoy.slug);

const custer = requireRecord("mary-custer-mi");
const falseCuster = requireRecord("joseph-custer-mi");
addAliases(custer, [falseCuster.slug]);
addSources(
  custer,
  (falseCuster.sources ?? []).map((source) => ({
    ...source,
    identity_note:
      "The land, school, Sisters of St. Casimir, and Custer farm-colony facts belong to St. Mary; the extracted St. Joseph name is not retained as a valid parish alias.",
  })),
);
addSources(custer, [
  {
    axis: "diocese-of-grand-rapids",
    kind: "official-current-institutional",
    publisher: "Diocese of Grand Rapids",
    work: "Saint Mary-Saint Jerome Parish, Custer",
    accessed: "2026-07-31",
    sourceUrl:
      "https://grdiocese.org/parishes-location/saint-mary-saint-james-parish-custer/",
  },
]);
addConflict(custer, {
  field: "source identity",
  variants: [
    {
      value: "Extracted as St. Joseph Church, Custer",
      source: "michelsonas-1961",
      cite: "pp. 58-59",
    },
    {
      value: "St. Mary is the documented Custer parish",
      source: "wolkovich and Diocese of Grand Rapids",
    },
  ],
  note:
    "The extracted shell duplicated the Custer community under the wrong titular; its historical facts are preserved here.",
});
custer.diocese = "Diocese of Grand Rapids";
stamp(
  custer,
  "false-identity-shell-collapsed",
  "The St. Joseph Custer shell duplicated St. Mary. Its evidence is preserved without publishing a second parish.",
);
removedSlugs.add(falseCuster.slug);

// New York Holy Trinity was the first short-lived attempt to organize a
// Lithuanian parish. It remains research evidence but is not a second durable
// public institution.
const newYorkAttempt = requireRecord("trinity-new-york-ny");
newYorkAttempt.record_type = "phase";
addSources(newYorkAttempt, [
  {
    axis: "catholic-encyclopedia-1914",
    kind: "historical-reference",
    work: "Catholic Encyclopedia: Lithuanians in the United States",
    publisher: "The Catholic Encyclopedia",
    accessed: "2026-07-31",
    sourceUrl: "https://www.newadvent.org/cathen/16054a.htm",
    note:
      "Describes the first purely Lithuanian New York congregation as organized in 1885 and ceasing the following year.",
  },
]);
addConflict(newYorkAttempt, {
  field: "organization year",
  variants: [
    { value: "1884", source: "michelsonas-1961", cite: "pp. 120, 162" },
    { value: "1885", source: "catholic-encyclopedia-1914" },
  ],
  note:
    "Both sources describe the same failed early New York organizing attempt, not a lasting Holy Trinity parish.",
});
stamp(
  newYorkAttempt,
  "historical-attempt-reclassified",
  "An 1884/1885 organizing attempt that ceased within about a year. Preserved as a research phase and excluded from public institutional counts.",
);

// Michelsonas describes the Baltimore record as an attempted independent
// organization, not an established institutional identity.
const baltimoreAttempt = requireRecord("parish-baltimore-md");
baltimoreAttempt.record_type = "phase";
stamp(
  baltimoreAttempt,
  "historical-attempt-reclassified",
  "A late-1880s independent organizing attempt attested by Michelsonas. Preserved as a research phase until a durable institution is established by further evidence.",
);

// The Jonistai record describes a missionary order and seminary, not a parish
// or congregation. It remains useful institutional context outside the census.
const jonistai = requireRecord("jonistai-chicago");
jonistai.record_type = "context";
stamp(
  jonistai,
  "organization-context-reclassified",
  "St. John Missionary Fathers and their Chicago seminary are an organization/site context record, not a congregation.",
);

// The sole source calls Brooklyn Holy Cross a national parish with no Roman
// Catholic diocese. Keep the institution attested but do not count it as RC.
const brooklynHolyCross = requireRecord("holycross-brooklyn-ny");
brooklynHolyCross.congregation_class = "independent_catholic";
brooklynHolyCross.diocese = null;
stamp(
  brooklynHolyCross,
  "denomination-corrected",
  "Michelsonas identifies Holy Cross as a Lithuanian national parish with no diocese. It remains single-source attested pending corroboration.",
);

// Chester has no dated Draugas mention and no URL or locator for its web
// candidate. Preserve the candidate, but do not publish it as an institution.
const chesterLead = requireRecord("lithuanian-church-chester-pa");
chesterLead.record_type = "lead";
stamp(
  chesterLead,
  "unsupported-candidate-reclassified",
  "The carried Draugas source records zero mentions and the web candidate has no URL or locator. Held as a research lead until institution identity is sourced.",
);

// These are Argentine institutions carried as international research context.
// Their old country value was a legacy U.S.-only schema default.
requireRecord("parish-avellaneda-ar").country = "AR";
requireRecord("casimir-rosario-ar").country = "AR";

// Public source-ledger repairs and current-status checks.
const zion = requireRecord("zion-lithuanian-lutheran-oak-lawn-il");
addSources(zion, [
  {
    axis: "lcms-northern-illinois",
    kind: "official-denominational-directory",
    publisher: "Northern Illinois District, Lutheran Church-Missouri Synod",
    work: "Congregations directory: Zion Lutheran Church, Oak Lawn",
    accessed: "2026-07-31",
    sourceUrl: "https://www.nidlcms.org/churches/",
  },
  {
    axis: "zion-oak-lawn-constitution",
    kind: "official-congregational-record",
    publisher: "Zion Lutheran Church, Oak Lawn",
    work: "Constitution of Zion Lutheran Church",
    accessed: "2026-07-31",
    sourceUrl:
      "https://nidlcms.org/wp-content/uploads/2017/03/Zion-Oak-Lawn-Constitution-2017-06.pdf",
    note:
      "The congregation identifies its December 4, 1910 founding by Lithuanian immigrants.",
  },
]);
stamp(
  zion,
  "current-status-source-repaired",
  "The official LCMS district directory confirms an active Oak Lawn congregation led by Rev. Dr. Valdas Ausra; its constitution confirms Lithuanian founding and continuing identity.",
);
situations.parishes["zion-lithuanian-lutheran-oak-lawn-il"] = {
  registry_slug: "zion-lithuanian-lutheran-oak-lawn-il",
  canonical_status: "standing",
  building_fate: "standing",
  current_use:
    "Active Zion Lithuanian Lutheran congregation at 9000 Menard Avenue in Oak Lawn, led by Rev. Dr. Valdas Ausra",
  lithuanian_identity: "active_parish",
  pastoral_status: "own_priest",
  situation:
    "Founded by Lithuanian immigrants in 1910, Zion remains an active LCMS congregation in Oak Lawn under Rev. Dr. Valdas Ausra. The official district directory and the congregation's constitution establish its current institutional life and Lithuanian founding.",
  sources: [
    {
      title: "Congregations directory: Zion Lutheran Church, Oak Lawn",
      publisher: "Northern Illinois District LCMS",
      date: "accessed 2026-07-31",
      url: "https://www.nidlcms.org/churches/",
    },
    {
      title: "Constitution of Zion Lutheran Church",
      publisher: "Zion Lutheran Church, Oak Lawn",
      date: "accessed 2026-07-31",
      url: "https://nidlcms.org/wp-content/uploads/2017/03/Zion-Oak-Lawn-Constitution-2017-06.pdf",
    },
  ],
};

const naugatuck = requireRecord("paul-naugatuck-ct");
addSources(naugatuck, [
  {
    axis: "lcms-new-england",
    kind: "official-denominational-directory",
    publisher: "New England District, Lutheran Church-Missouri Synod",
    work: "St. Paul Lutheran Church, Naugatuck",
    accessed: "2026-07-31",
    sourceUrl:
      "https://ned-lcms.org/church/st-paul-lutheran-church-naugatuck",
  },
  {
    axis: "naugatuck-historical-society",
    kind: "local-historical-record",
    publisher: "Naugatuck Historical Society",
    work: "Union City history",
    accessed: "2026-07-31",
    sourceUrl: "https://www.naugatuckhistory.org/unioncity",
    note:
      "Documents the church's service to Lithuanian Lutherans and rebuilding after the 1955 flood.",
  },
]);
stamp(
  naugatuck,
  "public-source-ledger-repaired",
  "The official district directory confirms the present congregation and address; current Lithuanian-language worship or identity remains unestablished.",
);
situations.parishes["paul-naugatuck-ct"] = {
  registry_slug: "paul-naugatuck-ct",
  canonical_status: "standing",
  building_fate: "standing",
  current_use:
    "Active St. Paul Lutheran Church at 350 Millville Avenue, Naugatuck",
  lithuanian_identity: "unknown",
  pastoral_status: "unknown",
  situation:
    "St. Paul remains an active LCMS congregation at its Naugatuck address. Historical sources document its Lithuanian Lutheran community and post-flood rebuilding; current Lithuanian-language worship or community identity has not yet been established.",
  sources: [
    {
      title: "St. Paul Lutheran Church, Naugatuck",
      publisher: "New England District LCMS",
      date: "accessed 2026-07-31",
      url: "https://ned-lcms.org/church/st-paul-lutheran-church-naugatuck",
    },
    {
      title: "Union City history",
      publisher: "Naugatuck Historical Society",
      date: "accessed 2026-07-31",
      url: "https://www.naugatuckhistory.org/unioncity",
    },
  ],
};

const philadelphiaAnthony = requireRecord("anthony-philadelphia-pa");
philadelphiaAnthony.diocese = "Archdiocese of Philadelphia";
stamp(
  philadelphiaAnthony,
  "governance-normalized",
  "Michelsonas p.128 identifies the Archdiocese of Philadelphia; the earlier free-text 'unspecified' label no longer suppresses the jurisdiction.",
);

const hazleton = requireRecord("ss-peter-and-paul-hazleton-pa");
hazleton.diocese = "Diocese of Scranton";
addSources(hazleton, [
  {
    axis: "diocese-of-scranton",
    kind: "official-diocesan-record",
    publisher: "Diocese of Scranton",
    work: "Consolidated Parishes",
    accessed: "2026-07-31",
    sourceUrl:
      "https://www.dioceseofscranton.org/wp-content/uploads/2025/07/Consolidated-Parishes-updated-7-2-25.pdf",
    note: "Lists Hazleton Ss. Peter and Paul Church and its diocesan closure.",
  },
]);
stamp(
  hazleton,
  "governance-normalized",
  "The Diocese of Scranton's official consolidated-parishes table establishes the jurisdiction and closure record.",
);

registry.parishes = registry.parishes.filter(
  (record) => !removedSlugs.has(record.slug),
);
for (const [profileSlug, overlay] of Object.entries(situations.parishes)) {
  if (removedSlugs.has(overlay.registry_slug)) delete situations.parishes[profileSlug];
}
delete situations.parishes["trinity-new-york-ny"];

for (const record of registry.parishes) {
  refreshDepth(record);
  applyPublicCensusScope(record);
}

const recalculateCounts = () => {
  const records = registry.parishes;
  return {
    records: records.length,
    parishes: records.filter((record) => record.record_type === "parish").length,
    phases: records.filter((record) => record.record_type === "phase").length,
    missions: records.filter((record) => record.record_type === "misija").length,
    congregations: records.filter(
      (record) => record.record_type === "congregation",
    ).length,
    leads: records.filter((record) => record.record_type === "lead").length,
    context: records.filter((record) => record.record_type === "context").length,
    case_filed: records
      .filter((record) => record.country === "US")
      .flatMap((record) => record.c83_rows ?? [])
      .filter((row) => row >= 1 && row <= 83).length,
    case_filed_records: records.filter(
      (record) =>
        record.country === "US" &&
        (record.c83_rows ?? []).some((row) => row >= 1 && row <= 83),
    ).length,
    multi_source: records.filter(
      (record) => record.record_depth === "multi-source",
    ).length,
    single_source: records.filter(
      (record) => record.record_depth === "single-source",
    ).length,
    with_exact_geo: records.filter(
      (record) => record.geo?.precision === "exact",
    ).length,
    with_city_geo: records.filter(
      (record) => record.geo?.precision === "city-centroid",
    ).length,
    needs_geocode: records.filter((record) => record.geo?.needs_geocode).length,
  };
};

registry.generated = "2026-07-31";
registry.counts = recalculateCounts();
registry.registryRevision = {
  ...registry.registryRevision,
  version: 8,
  date: "2026-07-31",
  changelog: [
    ...(registry.registryRevision.changelog ?? []),
    "Collapsed five residual duplicate or false-identity shells into Brooklyn Annunciation, East Chicago St. Francis, Mahanoy City St. Joseph, Custer St. Mary, and Esplen St. Vincent de Paul without losing source evidence or retired routes.",
    "Reclassified New York Holy Trinity as a short-lived 1884/1885 organizing phase so it cannot inflate public institutional counts.",
    "Reclassified the Baltimore independent-parish attempt as a phase, the Chicago Jonistai order/seminary as context, and the unsupported Chester shell as a lead; none is an institution in the public U.S. census.",
    "Corrected Brooklyn Holy Cross from Roman Catholic to independent Catholic on its sole source and marked the two Argentine institutions with an explicit international country scope.",
    "Assigned every research record an explicit public-census inclusion status and reason; public identities are separately labeled canonical case-filed, multi-source corroborated, or single-source attested using only qualifying located evidence.",
    "Added direct official source links for Zion Oak Lawn and St. Paul Naugatuck; confirmed Zion as an active Lithuanian Lutheran congregation while leaving Naugatuck's current Lithuanian identity unresolved.",
    "Normalized Philadelphia St. Anthony, Custer St. Mary, and Hazleton Ss. Peter and Paul to their source-supported jurisdictions.",
    "Recalculated every source-axis and record-depth label and established public source-ledger and release-count guards.",
  ],
  contentHash: "",
};
situations.generated = "2026-07-31";

const sortValue = (value) => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
};
const registryForHash = structuredClone(registry);
delete registryForHash.registryRevision.contentHash;
registry.registryRevision.contentHash = createHash("sha256")
  .update(JSON.stringify(sortValue(registryForHash)))
  .digest("hex");

writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
writeFileSync(situationPath, `${JSON.stringify(situations, null, 2)}\n`);

const usPublicRecords = registry.parishes.filter(
  (record) => record.public_census.included,
);
const usRomanParishes = usPublicRecords.filter(
  (record) =>
    record.record_type === "parish" &&
    record.congregation_class === "roman_catholic",
);
const supportCounts = {
  canonicalCaseFiled: usPublicRecords.filter(
    (record) => record.public_census.identity_support === "canonical_case_file",
  ).length,
  multiSourceCorroborated: usPublicRecords.filter(
    (record) =>
      record.public_census.identity_support === "multi_source_corroborated",
  ).length,
  singleSourceAttested: usPublicRecords.filter(
    (record) =>
      record.public_census.identity_support === "single_source_attested",
  ).length,
};

revisionHistory.revisions.push({
  version: 8,
  date: "2026-07-31",
  registryRecords: registry.counts.records,
  publicUSRecords: usPublicRecords.length,
  usRomanCatholicParishes: usRomanParishes.length,
  summary:
    "Completed the residual identity, census-scope, and source-integrity audit: collapsed five false or duplicate shells, removed unsupported and non-institutional records from public scope, repaired source ledgers and jurisdictions, and made every inclusion explicit.",
  evidence: [
    "data/candidates/registry-revision-8-source-integrity-2026-07-31.md",
    "data/candidates/public-institution-count-audit-2026-07-31.md",
    "data/public-institution-ledger.json",
  ],
});
writeFileSync(
  revisionHistoryPath,
  `${JSON.stringify(revisionHistory, null, 2)}\n`,
);

const report = `# Registry Revision 8: source integrity and residual identity audit

**Audit date:** 2026-07-31

**Registry revision:** 8

## Result

This audit reviewed every remaining single-source public record and every public profile source ledger after Registry Revision 7. It distinguishes source mentions from institutions and preserves uncertain evidence without allowing extraction shells, historical attempts, or free-text years to inflate public figures.

- Research registry records: **${registry.parishes.length}**
- Public U.S. institutions: **${usPublicRecords.length}**
- U.S. Roman Catholic parishes: **${usRomanParishes.length}**
- Canonical case-filed public identities: **${supportCounts.canonicalCaseFiled}**
- Additional multi-source corroborated identities: **${supportCounts.multiSourceCorroborated}**
- Single-source attested identities awaiting corroboration: **${supportCounts.singleSourceAttested}**
- Frozen C83 source rows: **${registry.counts.case_filed}**
- Locked C83 identities: **${registry.counts.case_filed_records}**
- Historical phases withheld from public counts: **${registry.counts.phases}**
- Research leads withheld from public counts: **${registry.counts.leads}**
- Context records withheld from public counts: **${registry.counts.context}**

## Identity adjudications

1. **Brooklyn Annunciation:** annunciation-brooklyn-ny absorbs the false annunciation-maspeth-ny import. Global True Lithuania point 131 is in Williamsburg; Transfiguration remains the distinct Maspeth parish.
2. **East Chicago St. Francis:** francis-east-chicago-in absorbs francis-indian-harbor-in. Indian Harbor is the East Chicago neighborhood named by Wolkovich.
3. **Mahanoy City St. Joseph:** st-joseph-mahanoy-city-pa absorbs the false george-mahanoy-city-pa shell. Michelsonas's 1874 passage supports early organizing, not a second St. George parish or a 1911 closure.
4. **Custer St. Mary:** mary-custer-mi absorbs joseph-custer-mi. The land, Sisters of St. Casimir, school, farm-colony, and current diocesan evidence describe St. Mary; the extracted St. Joseph name is retained only as source lineage.
5. **Esplen St. Vincent de Paul:** paul-esplen-pa absorbs vincent-pittsburgh-pa. Esplen is the Pittsburgh neighborhood of the same St. Vincent parish.
6. **New York Holy Trinity:** trinity-new-york-ny remains fully source-linked but is retyped as a historical phase. Contemporary summaries describe an 1884/1885 organizing attempt that ended within about a year.
7. **Baltimore independent attempt:** parish-baltimore-md remains source-linked but is retyped as a historical phase until a durable institution can be established.
8. **Chicago Jonistai:** jonistai-chicago is retyped as organization/site context; missionary fathers and a seminary are not a congregation.
9. **Brooklyn Holy Cross:** retained as a single-source attested institution but corrected from Roman Catholic to independent Catholic because its source calls it a national parish with no diocese.
10. **Chester Lithuanian church:** lithuanian-church-chester-pa is retyped as a lead because its carried Draugas source has zero mentions and its web candidate has no URL or locator.

Every retired slug remains an alias of its canonical profile. No C83 identity or campaign assignment changed.

## Source and governance repairs

- Zion Lithuanian Lutheran, Oak Lawn now cites the official LCMS Northern Illinois directory and the congregation's constitution. It is classified as an active Lithuanian Lutheran parish with its own pastor.
- St. Paul Lutheran, Naugatuck now cites the official LCMS New England directory and Naugatuck Historical Society. The institution and building are standing; current Lithuanian identity remains unresolved.
- Philadelphia St. Anthony, Custer St. Mary, and Hazleton Ss. Peter and Paul now carry source-supported present jurisdiction labels.
- Every record now states whether it enters the public U.S. census, why, and at what identity-support tier.
- All registry source-axis counts and depth labels were recalculated. No public profile is allowed to publish without a linkable source ledger.

## Sources used for identity adjudication

- Global True Lithuania, New York City: https://global.truelithuania.com/lt/new-york-city-new-york-604/
- Diocese of Allentown directory: https://www.allentowndiocese.org/sites/default/files/2025-11/2025-2026%20Directory_0.pdf
- Diocese of Grand Rapids, St. Mary-St. Jerome Custer: https://grdiocese.org/parishes-location/saint-mary-saint-james-parish-custer/
- Diocese of Pittsburgh, St. Vincent de Paul Esplen: https://diopitt.org/saint-vincent-de-paul-esplen
- Global True Lithuania, Pittsburgh: https://global.truelithuania.com/pittsburgh-pennsylvania-1133/
- Catholic Encyclopedia, Lithuanians in the United States: https://www.newadvent.org/cathen/16054a.htm
- Northern Illinois District LCMS congregations: https://www.nidlcms.org/churches/
- Zion Oak Lawn constitution: https://nidlcms.org/wp-content/uploads/2017/03/Zion-Oak-Lawn-Constitution-2017-06.pdf
- New England District LCMS, St. Paul Naugatuck: https://ned-lcms.org/church/st-paul-lutheran-church-naugatuck
- Naugatuck Historical Society, Union City: https://www.naugatuckhistory.org/unioncity
- Diocese of Scranton consolidated parishes: https://www.dioceseofscranton.org/wp-content/uploads/2025/07/Consolidated-Parishes-updated-7-2-25.pdf

The Wolkovich and Michelsonas page citations remain attached directly to the canonical registry records.
`;
writeFileSync(reportPath, report);

console.log(
  `Applied Registry Revision 8: ${registry.parishes.length} research records; ${usPublicRecords.length} public U.S. institutions; ${usRomanParishes.length} U.S. Roman Catholic parishes.`,
);
