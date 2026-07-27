// One-shot integration of the 2026-07-26/27 clean-source photo sweep.
// Reads the three verification files (data/candidates/photo-verify-{1,2,3}.json),
// downloads each cleared hero image into public/images/parishes/, and rewrites
// the matching data/photos.json entries with cleared rights + verbatim license
// evidence. Existing pending entries for the same slug (the held Lukas-book
// crops and the taken-down web photos) are preserved under `heldAlternate` so
// the slow-burn permission trail survives. Idempotent: safe to re-run.
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const root = new URL("..", import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));

const verify = [
  ...read("data/candidates/photo-verify-1.json").verified,
  ...read("data/candidates/photo-verify-2.json").verified,
  ...read("data/candidates/photo-verify-3.json").verified,
];

// Per-slug presentation: output filename + alt text. Slugs absent here are
// treated as alternates-only (merged into the hero entry, never standalone).
const PRESENT = {
  "sv-kryziaus-chicago-il": ["chicago-holy-cross-1914.jpg", "Holy Cross Lithuanian church in Chicago, photographed in 1914."],
  "sv-juozapo-waterbury-ct": ["waterbury-st-joseph.jpg", "Exterior of St. Joseph Lithuanian church in Waterbury."],
  "sv-jurgio-rochester-ny": ["rochester-st-george-interior.jpg", "Interior of St. George Lithuanian parish church in Rochester."],
  "siluvos-dievo-motinos-maizeville-pa": ["maizeville-our-lady-siluva.jpg", "Front of Our Lady of Šiluva church in Maizeville."],
  "sv-kryziaus-dayton-oh": ["dayton-holy-cross.jpg", "Exterior of Holy Cross Lithuanian church in Dayton."],
  "svc-m-marijos-apreiskimo-brooklyn-ny": ["brooklyn-annunciation-bvm.jpg", "Annunciation of the Blessed Virgin Mary church in Williamsburg, Brooklyn."],
  "kristaus-atsimainymo-maspeth-ny": ["maspeth-transfiguration.jpg", "The Church of the Transfiguration in Maspeth, Queens."],
  "svc-trejybes-hartford-ct": ["hartford-holy-trinity-2000.jpg", "Holy Trinity Lithuanian church on Capitol Avenue, Hartford, in 2000."],
  "sv-petro-boston-ma": ["boston-st-peter.jpg", "St. Peter Lithuanian church on Flaherty Way, South Boston."],
  "svc-trejybes-wilkes-barre-pa": ["wilkes-barre-holy-trinity-1899.jpg", "The first Holy Trinity Lithuanian church in Wilkes-Barre, from Lietuviai Amerikoj (1899)."],
  "sv-jurgio-shenandoah-pa": ["shenandoah-st-george-1899.jpg", "St. George Lithuanian church in Shenandoah, from Lietuviai Amerikoj (1899)."],
  "sv-kazimiero-pittston-pa": ["pittston-st-casimir.jpg", "The 1909 St. Casimir church building in Pittston."],
  "sv-kryziaus-mount-carmel-pa": ["mount-carmel-holy-cross-1899.jpg", "Holy Cross Lithuanian church in Mount Carmel, from Lietuviai Amerikoj (1899)."],
  "sv-kazimiero-pittsburgh-pa": ["pittsburgh-st-casimir.jpg", "St. Casimir church on the South Side of Pittsburgh."],
  "sv-kazimiero-philadelphia-pa": ["philadelphia-st-casimir.jpg", "St. Casimir Lithuanian church at 324 Wharton Street, Philadelphia."],
  "sv-jurgio-chicago-il": ["chicago-st-george-1913.jpg", "St. George Lithuanian church in Bridgeport, Chicago, photographed in 1913; demolished 1990."],
  "sv-kazimiero-amsterdam-ny": ["amsterdam-st-casimir.jpg", "The former St. Casimir church in Amsterdam, New York."],
  "sv-kazimiero-gary-in": ["gary-st-casimir.jpg", "The historical St. Casimir Lithuanian church in Gary, Indiana."],
  "ausros-vartu-worcester-ma": ["worcester-our-lady-of-vilna.jpg", "Our Lady of Vilna church on Sterling Street, Worcester."],
  "sv-vincento-de-paul-girardville-pa": ["girardville-st-vincent-de-paul.jpg", "St. Vincent de Paul church in Girardville."],
  "sv-kazimiero-delhi-on": ["delhi-st-casimir.jpg", "St. Casimir church in Delhi, Ontario."],
  "svc-m-marijos-nekalto-prasidejimo-chicago-il": ["brighton-park-immaculate-conception-1977.jpg", "A 1977 Lithuanian wedding inside Immaculate Conception church, Brighton Park, Chicago."],
  "sv-antano-cicero-il": ["cicero-st-anthony-1961.jpg", "The newly decorated interior of St. Anthony church, Cicero, from the parish's 1961 jubilee book."],
  "sv-pranciskaus-lawrence-ma": ["lawrence-st-francis-1958.jpg", "Bradford Street, Lawrence, in 1958, with St. Francis Lithuanian church in view."],
  "saldziausios-jezaus-sirdies-lawrence-ma": ["lawrence-sacred-heart-stereograph.jpg", "The Garden Street church building later acquired by Sacred Heart Lithuanian National Catholic parish, Lawrence."],
  "ausros-vartu-manhattan-ny": ["manhattan-our-lady-of-vilnius-2011.jpg", "Our Lady of Vilnius church on Broome Street, Manhattan, in 2011; demolished 2015."],
  "dievo-apvaizdos-scranton-pa": ["scranton-divine-providence.jpg", "Divine Providence Lithuanian church in Scranton."],
  "sv-petro-ir-povilo-grand-rapids-mi": ["grand-rapids-sts-peter-paul.jpg", "Sts. Peter and Paul Lithuanian church in Grand Rapids."],
};

const j = read("data/photos.json");
const heroes = new Map();
const alternatesBySlug = new Map();
for (const v of verify) {
  if (PRESENT[v.slug] && !heroes.has(v.slug)) heroes.set(v.slug, v);
  else {
    if (!alternatesBySlug.has(v.slug)) alternatesBySlug.set(v.slug, []);
    alternatesBySlug.get(v.slug).push(v);
  }
}

const rightsOf = (license) =>
  /public domain|no known|cc0|pd/i.test(license) ? "public_domain" : "open_license";

const attributionOf = (v) => {
  const lic = v.license || v.licenseVerbatim || "";
  if (/1899|Lietuviai Amerikoj/i.test(v.file + (v.identityEvidence ?? "")))
    return "Lietuviai Amerikoj (Jonas Žilius, 1899) — public domain, via Wikimedia Commons.";
  if (/loc\.gov/.test(v.filePageUrl))
    return `Library of Congress — ${lic}.`;
  if (/digitalcommonwealth/.test(v.filePageUrl))
    return `Digital Commonwealth (Boston Public Library) — ${lic}.`;
  if (/commons\.wikimedia/.test(v.filePageUrl))
    return `Photo: ${v.author}, Wikimedia Commons, ${lic}.`;
  return `${v.author ?? "Source"} — ${lic}.`;
};

let downloaded = 0;
for (const [slug, v] of heroes) {
  const [fname, alt] = PRESENT[slug];
  const dest = new URL(`public/images/parishes/${fname}`, root).pathname;
  if (!existsSync(dest)) {
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const res = await fetch(v.downloadUrl, {
          redirect: "follow",
          headers: { "user-agent": "SaveOurLithuanianParishes.org (vilija@lietuva.ai)" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 10000) throw new Error(`suspiciously small (${buf.length}B)`);
        writeFileSync(dest, buf);
        ok = true;
      } catch (e) {
        if (attempt === 3) throw new Error(`download failed for ${slug}: ${v.downloadUrl} (${e.message})`);
        // Back off hard on rate limits, gently on anything else.
        await new Promise((r) => setTimeout(r, /429/.test(e.message) ? 20000 : 2000));
      }
    }
    downloaded++;
    await new Promise((r) => setTimeout(r, 1500));
  }
  const prior = j.parishes[slug];
  const heldAlternate =
    prior && prior.rights === "pending_permission"
      ? {
          ...prior,
          src: prior.src.replace(/\.jpg$/, "-held.jpg"),
          note: "Held pending permission; staged outside the repo. Original staging filename: " + prior.src.split("/").pop(),
        }
      : prior?.heldAlternate;
  j.parishes[slug] = {
    src: `/images/parishes/${fname}`,
    alt,
    attribution: attributionOf(v),
    license: v.license,
    rights: rightsOf(v.license + " " + (v.licenseVerbatim ?? "")),
    rightsNote: `${v.licenseVerbatim ?? v.license} — verified 2026-07-27 against ${v.filePageUrl}. Identity: ${v.identityEvidence ?? "verified"}`.slice(0, 600),
    evidenceUrl: v.filePageUrl,
    ...(alternatesBySlug.has(slug) || v.alternates?.length
      ? { alternates: [...(v.alternates ?? []), ...(alternatesBySlug.get(slug) ?? []).map((a) => ({ file: a.file, filePageUrl: a.filePageUrl, license: a.license }))] }
      : {}),
    ...(heldAlternate ? { heldAlternate } : {}),
  };
}

// Vilija's own Divine Providence road-sign photo (confirmed own work 2026-07-27).
const dpSrc = "/private/tmp/claude-501/-Users-horse-dev/98cdb4da-1ded-4f07-b14a-b54a2b9a2827/scratchpad/hearth-audit/how-you-can-help-save-our-lithuanian--img1.jpg";
const dpDest = new URL("public/images/parishes/southfield-divine-providence-sign.jpg", root).pathname;
if (existsSync(dpSrc) && !existsSync(dpDest)) copyFileSync(dpSrc, dpDest);
if (existsSync(dpDest)) {
  const prior = j.parishes["dievo-apvaizdos-southfield-mi"];
  j.parishes["dievo-apvaizdos-southfield-mi"] = {
    src: "/images/parishes/southfield-divine-providence-sign.jpg",
    alt: "The Divine Providence Lithuanian Catholic Church sign and church on Nine Mile Road, Southfield.",
    attribution: "Photo: Vilija Jurgutis.",
    license: "Own work",
    rights: "own_work",
    rightsNote: "Vilija's own photograph; confirmed own work 2026-07-27 (Hearth session). Higher-resolution original available from the author.",
    ...(prior && prior.rights === "pending_permission"
      ? { heldAlternate: { ...prior, src: prior.src.replace(/\.jpg$/, "-held.jpg"), note: "Held pending permission; staged outside the repo." } }
      : {}),
  };
}

writeFileSync(new URL("data/photos.json", root), JSON.stringify(j, null, 2) + "\n");
const cleared = Object.values(j.parishes).filter((e) =>
  ["public_domain", "open_license", "own_work", "permission_granted"].includes(e.rights),
).length;
console.log(`OK: ${downloaded} images downloaded, ${heroes.size + 1} entries cleared (${cleared} total cleared in registry).`);
