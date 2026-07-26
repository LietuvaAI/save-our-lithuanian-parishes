// One-off application of the 2026-07-25 parish-status research
// (data/candidates/research-2026-07-25-{midwest,east}.json) to:
//   - data/parish-situation.json  (classifier overlay — the source of truth)
//   - data/registry-unified.json  (web-historical source entries + caveats + year readings)
//   - data/case-records/dievo-apvaizdos-southfield-mi.json (clergy development)
// Deliberately conservative: single-source building fates stay "unknown" with
// the reported detail carried in situation text; identity flips follow the
// research confidence and are flagged in the PR body for review.
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(p, "utf-8"));
// Preserve each file's native indent and trailing-newline state so the diff
// shows only real changes.
const write = (p, v) => {
  const raw = readFileSync(p, "utf-8");
  const indent = (raw.split("\n")[1]?.match(/^ */)?.[0].length ?? 2) || 2;
  const nl = raw.endsWith("\n") ? "\n" : "";
  writeFileSync(p, JSON.stringify(v, null, indent) + nl);
};

const midwest = read("data/candidates/research-2026-07-25-midwest.json");
const east = read("data/candidates/research-2026-07-25-east.json");
const findings = [...midwest.parishes, ...east.parishes];
const byslug = Object.fromEntries(findings.map((f) => [f.registry_slug, f]));

// ── 1. parish-situation.json ────────────────────────────────────────────────
const sitFile = read("data/parish-situation.json");
const sit = sitFile.parishes;
const sitByRegistry = {};
for (const [k, v] of Object.entries(sit)) sitByRegistry[v.registry_slug] = k;

/** slug → curated classifier update (fields verified in the research files). */
const SITUATION = {
  "ss-peter-and-paul-rockford-il": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active Roman Catholic parish church at 617 Lincoln Ave., Rockford — Masses in English and Spanish.",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "Founded 1911 as the national parish of Rockford's Lithuanians; the 1929 church, built under Fr. V. Kulikauskas, was the 1951 wedding site of Alma and Valdas Adamkus, later President of Lithuania. The parish never closed — the Diocese of Rockford transferred its mission, making it home of the diocesan Office of Black Catholic Ministry in 1985 and the home parish for Spanish-speaking Catholics in 1992. No Lithuanian Mass or organized Lithuanian life remains; a 1949 commemorative plaque with Lithuanian donor names survives in the entrance hall.",
  },
  "ss-peter-and-paul-westville-il": {
    canonical_status: "closed",
    building_fate: "demolished",
    current_use:
      "Vacant lot at 502 W. Main St.; the cornerstone was relocated to SS. Peter and Paul Cemetery.",
    lithuanian_identity: "lost",
    pastoral_status: "not_applicable",
    situation:
      "Founded 1897, among the oldest Lithuanian parishes in America, serving Westville's coal-mining community for nearly a century. The parish closed and its members were received into St. Mary Parish, Westville in 1990 (church-affiliated sources give 1990; an earlier reading gives 1989). The church was demolished, leaving an empty lot; the cornerstone now stands in SS. Peter and Paul Cemetery near the grave of longtime pastor Fr. John Paukstis.",
  },
  "holy-cross-westville-il": {
    canonical_status: "closed",
    building_fate: "unknown",
    current_use:
      "Reportedly a private residence occupies the church site (single source, uncorroborated). A 2004 memorial built from the rescued bell and cornerstone stands in the separately run Westville Lithuanian Cemetery.",
    lithuanian_identity: "lost",
    pastoral_status: "not_applicable",
    situation:
      "An independent congregation formed in 1914 by a faction that broke from SS. Peter and Paul over fees, burial rules, and temperance — sources describe it as schismatic ('Old Catholic'), not a Roman Catholic diocesan parish. Led for decades by Zigmantas K. Vipartas, consecrated a bishop in the North American Old Roman Catholic Church in 1944; the congregation dissolved around 1960–61 after his death. The original building, a former Presbyterian church bought in 1914, is reported demolished.",
  },
  "st-ann-beverly-shores-in": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active Catholic worship site of St. Patrick Catholic Community, Chesterton (Diocese of Gary), at 433 E. Golfwood Rd.",
    lithuanian_identity: "mass_continues",
    pastoral_status: "visiting_priest",
    situation:
      "Begun in 1950 as a mission for the Lithuanian vacation colony of Beverly Shores — 'the Lithuanian Riviera' — and a full parish from 1956. It later lost independent canonical status and is now a worship site of St. Patrick Catholic Community in Chesterton, but it never closed: the 1954 church, remodeled in 1970 by architect E. Masiulis, holds Mass every weekend. A dedicated Lithuanian ministry led by Rev. Gediminas Kersys continues — Lithuanian Mass on the third Sunday of every month, with Lithuanian confession in Lent and Advent, confirmed on the parish and diocesan sites.",
  },
  "st-peter-kenosha-wi": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active parish church of the Archdiocese of Milwaukee at 2224 30th Ave., with a full Mass schedule.",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "Founded July 30, 1903 by Lithuanian immigrants, out of a joint Lithuanian-Polish St. Casimir benevolent society formed in 1898. Never merged or suppressed — it remains an independent parish of the Archdiocese of Milwaukee, staffed by the Marian Fathers, an order with historic Lithuanian roots. The Lithuanian identity survives culturally, not liturgically: the annual parish festival still advertises homemade kugelis and Lithuanian sausage, but no Lithuanian-language Mass was found. The present church is reported to date from 1966.",
  },
  "st-francis-athol-ma": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active Catholic worship site at 101 Main St., Athol — part of the North Quabbin Catholic Community (Diocese of Worcester).",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "Founded in 1913 for Athol's Lithuanian immigrants, with the church dedicated in 1921. Still a functioning parish, clustered with Our Lady Immaculate and St. Peter (Petersham) as the North Quabbin Catholic Community. No Lithuanian Mass or Lithuanian clergy remain; centennial coverage in 2021 described a small, English-language, increasingly Hispanic congregation, with the Lithuanian founding preserved in period stained glass and remembered history.",
  },
  "mary-custer-mi": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active Catholic worship site at 85 S. Madison St., Custer — Saint Mary–Saint Jerome Parish, Diocese of Grand Rapids.",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "The Lithuanian farm colony around Custer took shape from about 1912, with a parish established in 1933 under Lithuanian priests — though the Lithuanian cultural-heritage record notes it was always a territorial parish, never nationally erected. The 1966 A-frame church was designed by Lithuanian-American architect Jonas Mulokas and keeps Lithuanian artistic elements: an altar with Lithuanian textile motifs, an Our Lady of Vilnius relief over the entrance, an Our Lady of Šiluva statue. Today it is an English-language territorial parish, merged with the former St. Jerome, Scottville in 2012.",
  },
  "ignatius-luther-mi": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active mission chapel of Saint Ann–Saint Ignatius Parish, Baldwin (Diocese of Grand Rapids), at 701 State St., Luther — regular Sunday Mass.",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "Recorded by Wolkovich as identified 'Lithuanian' in a 1970 diocesan ethnic-makeup report, with no founding date or building history given. The church still stands and holds Sunday Mass, but it lost independent-parish status in 2011 when it was folded into Saint Ann Parish, Baldwin, as Saint Ann–Saint Ignatius Parish. No surviving Lithuanian Mass, identity, or heritage programming was found in diocesan or parish sources.",
  },
  "st-alphonsus-baltimore-md": {
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active parish and National Shrine of St. Alphonsus Liguori, 114 W. Saratoga St., administered by the Priestly Fraternity of St. Peter — Traditional Latin and English Masses.",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "Baltimore's Lithuanian national parish from 1917, described in a 2018 Draugas feature as the most impressive Lithuanian church on the U.S. East Coast. A dedicated 8:30 a.m. Lithuanian Mass was still offered as late as September 2017, when the archdiocese entrusted the shrine to the Priestly Fraternity of St. Peter for the Latin Mass apostolate. The field survey reports the Lithuanian Mass canceled in 2017, and none appears on the current published schedule — the parish is alive and the building stands, but the dedicated Lithuanian liturgical identity appears to have lapsed.",
  },
};

// Canonical (c83) updates keyed by canonical slug
const CANONICAL = {
  "sv-kazimiero-worcester-ma": (e) => {
    e.building_fate = "repurposed_religious";
    e.current_use =
      "Church of the Pentecost USA — sold by the Diocese of Worcester on Sept. 15, 2011 for $650,000, with the rectory and three house lots.";
    e.situation =
      "Established 1894 for Worcester's Lithuanian and Polish Catholics; one of five Worcester parishes closed by the diocese in 2008 over parishioner objections that it was financially viable, despite a canon-law challenge and planned Vatican appeal. Merged into St. John Parish effective July 1, 2008, with the last Mass in June 2009. The church was sold in 2011 to The Church of the Pentecost; the building stands, in religious use, no longer Catholic or Lithuanian.";
  },
  "unnamed-lithuanian-parish-baltimore-md": (e) => {
    e.lithuanian_identity = "lost";
    e.situation =
      "A single Draugas mention of January 2, 2010 describes a Baltimore Lithuanian congregation as de facto closed — sharing a building with an American parish, reduced to one token Sunday Lithuanian Mass, with no Lithuanian priest. Research in 2026 could not establish this as a parish distinct from the documented Baltimore Lithuanian sites (St. John the Baptist, 1905–1916, and St. Alphonsus, Lithuanian from 1917); it may be the St. Alphonsus community at a low point. The dedicated Lithuanian Mass at St. Alphonsus is reported to have ended in 2017.";
  },
};

for (const [slug, upd] of Object.entries(SITUATION)) {
  const key = sitByRegistry[slug];
  if (!key) throw new Error(`no situation entry for ${slug}`);
  Object.assign(sit[key], upd);
}
for (const [slug, fn] of Object.entries(CANONICAL)) {
  if (!sit[slug]) throw new Error(`no canonical situation entry ${slug}`);
  fn(sit[slug]);
}

write("data/parish-situation.json", sitFile);

// ── 2. registry-unified.json ────────────────────────────────────────────────
const reg = read("data/registry-unified.json");
const regBySlug = Object.fromEntries(reg.parishes.map((p) => [p.slug, p]));

const STATUS_FOR = {
  "ss-peter-and-paul-rockford-il": "standing",
  "ss-peter-and-paul-westville-il": "closed",
  "holy-cross-westville-il": "closed",
  "st-ann-beverly-shores-in": "standing",
  "st-peter-kenosha-wi": "standing",
  "st-francis-athol-ma": "standing",
  "casimir-worcester-ma": "repurposed",
  "mary-custer-mi": "standing",
  "ignatius-luther-mi": "standing",
  "st-alphonsus-baltimore-md": "standing",
  "holyname-baltimore-md": "unknown",
};

for (const f of findings) {
  const p = regBySlug[f.registry_slug];
  if (!p) throw new Error(`registry slug missing: ${f.registry_slug}`);
  p.sources.push({
    axis: "web-historical",
    kind: "web-survey",
    tier: 4,
    currentStatus: STATUS_FOR[f.registry_slug] ?? "unknown",
    confidence: f.confidence,
    sourceUrl: f.sources[0]?.url,
    ownership: "diocese_rc",
    surveyed: "2026-07-25",
  });
  p.axes_count = new Set(p.sources.map((s) => s.axis)).size;
}

// Year readings established by the research
regBySlug["ss-peter-and-paul-westville-il"].years.closed.push({
  value: "1990",
  source: "web-historical",
  cite: "The Catholic Post (Diocese of Peoria), 2014; St. Mary's Westville parish history",
});
regBySlug["holy-cross-westville-il"].years.closed.push({
  value: "1961",
  source: "web-historical",
  cite: "dissolved c. 1960–61 after the death of Bishop Z. K. Vipartas",
});

// Caveats — unresolved identities the research surfaced
regBySlug["holy-cross-westville-il"].caveat =
  "Independent sources describe Holy Cross itself as Westville's schismatic ('Old Catholic') congregation — the same kind of entity as the LNCC congregation documented separately, with conflicting closure years (1960–61 here; ~1969 there). The two records may describe one entity; reconciliation pending.";
if (regBySlug["parish-westville-il"])
  regBySlug["parish-westville-il"].caveat =
    "May describe the same congregation as the Holy Cross (Šv. Kryžiaus) Westville record — sources conflict on closure year (~1969 vs 1960–61). Reconciliation pending.";
regBySlug["holyname-baltimore-md"].caveat =
  "Identity unresolved: built on a single 2010 Draugas mention of a de facto closed Lithuanian congregation sharing a building with an American parish. 2026 research could not establish it as distinct from St. Alphonsus (Lithuanian from 1917) or St. John the Baptist (1905–1916); it may be the St. Alphonsus community at a low point.";
regBySlug["st-alphonsus-baltimore-md"].caveat =
  "The dedicated Lithuanian Mass is reported canceled in 2017 (Global True Lithuania; corroborated by absence from the current published schedule). Recent independent confirmation of any occasional Lithuanian Mass was not found.";

write("data/registry-unified.json", reg);

// ── 3. Divine Providence case record ────────────────────────────────────────
const crPath = "data/case-records/dievo-apvaizdos-southfield-mi.json";
const cr = read(crPath);
cr.asOf = "2026-07-25";
cr.summary = cr.summary.replace(
  "with Fr. Tomas Miliauskas as pastor and a regular Lithuanian/English Mass schedule",
  "with a regular Lithuanian/English Mass schedule. Fr. Tomas Miliauskas, MIC, pastor since December 2021, departed in May 2026, and no successor has been publicly named — as of late July 2026 the archdiocese had not decided whether to accept another priest from Lithuania",
);
cr.developments.push({
  date: "2026-07-23",
  headline: "No pastor named since Fr. Miliauskas departed in May",
  detail:
    "Lithuanian press reported that Fr. Tomas Miliauskas, MIC, who led the parish from December 2021, left in May 2026, and that during Archbishop Lionginas Virbalas's July 18–19 pastoral visit the Archdiocese of Detroit had not yet decided whether to accept another priest from Lithuania. The parish website and the archdiocesan directory still listed Fr. Miliauskas at the time — apparently stale listings.",
  sources: [
    {
      title: "Dar vienai lietuvių parapijai JAV gresia uždarymas",
      publisher: "Laikmetis.lt",
      date: "2026-07-23",
      url: "https://laikmetis.lt/dar-vienai-lietuviu-parapijai-jav-gresia-uzdarymas/",
    },
  ],
});
cr.gaps =
  (cr.gaps ? cr.gaps + " " : "") +
  "Where Fr. Miliauskas was reassigned after May 2026 is not established.";
write(crPath, cr);

console.log("applied: situation entries", Object.keys(SITUATION).length + Object.keys(CANONICAL).length,
  "| registry sources", findings.length, "| caveats 4 | case-record updated");
