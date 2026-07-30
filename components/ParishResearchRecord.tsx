import type {
  CanonicalParishProfile,
  RegistrySource,
  YearReading,
} from "@/lib/parish-profile";

const AXIS_LABEL: Record<string, string> = {
  "draugas-registry-1909-2007": "Draugas archive, 1909–2007",
  "draugas-2008-2026": "Draugas archive, 2008–2026",
  "draugas-jubilee-implied": "Draugas jubilee-implied dating",
  "michelsonas-1961":
    "Michelsonas, Lietuvių Išeivija Amerikoje (1868–1961), Keleivis, 1961",
  wolkovich:
    "Wolkovich-Valkavičius, Lithuanian Religious Life in America, Vol. 3 (1998)",
  "lukas-2009":
    "Lukas, Lietuvių Kultūrinis Paveldas Amerikoje (2009)",
  "web-historical": "Contemporary web survey",
  truelithuania: "Global True Lithuania field survey",
};

const SOURCE_ORDER: Record<string, number> = {
  wolkovich: 0,
  "michelsonas-1961": 1,
  "lukas-2009": 2,
  "draugas-registry-1909-2007": 3,
  "draugas-2008-2026": 4,
  "draugas-jubilee-implied": 5,
  "web-historical": 6,
  truelithuania: 7,
};

export const CONGREGATION_CLASS_LABEL: Record<string, string> = {
  roman_catholic: "Roman Catholic parish",
  national_catholic_pncc: "Lithuanian National Catholic parish",
  independent_catholic: "Independent Catholic parish",
  non_catholic_christian: "Lithuanian Protestant congregation",
};

export const RECORD_TYPE_LABEL: Record<string, string> = {
  parish: "Lithuanian parish (parapija)",
  parapija: "Lithuanian parish (parapija)",
  misija: "Lithuanian mission (misija)",
  phase: "Historical independent/national phase",
  lead: "Unresolved research lead",
  context: "Contextual historical reference",
};

const SETTLEMENT_PATTERNS = [
  /not a distinct Lithuanian parish/i,
  /\bno parish\b/i,
  /\bsecular\b/i,
  /territorial parish attended by/i,
  /memorial chapel/i,
  /no distinct parish/i,
];

export function isCommunityRecord(sources: RegistrySource[]): boolean {
  return sources.some(
    (source) =>
      !!source.ethnic_status &&
      SETTLEMENT_PATTERNS.some((pattern) =>
        pattern.test(source.ethnic_status ?? ""),
      ),
  );
}

function isYearValue(value: string) {
  return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(value).trim());
}

function sourceShortName(axis: string) {
  return AXIS_LABEL[axis]?.split(",")[0] ?? axis;
}

function YearList({
  label,
  items,
}: {
  label: string;
  items?: YearReading[];
}) {
  if (!items?.length) return null;
  const yearItems = items.filter((item) => isYearValue(item.value));
  const noteItems = items.filter((item) => !isYearValue(item.value));
  const differ = new Set(yearItems.map((item) => item.value)).size > 1;

  return (
    <div className="space-y-1.5">
      {yearItems.length > 0 && (
        <div>
          <span className="font-medium">{label}:</span>{" "}
          {yearItems.map((item, index) => (
            <span key={`${item.source}-${item.value}-${index}`}>
              {index > 0 && " · "}
              {item.value}{" "}
              <span className="text-sm text-muted">
                ({sourceShortName(item.source)}
                {item.cite ? `, ${item.cite}` : ""})
              </span>
            </span>
          ))}
          {differ && (
            <span className="ml-2 inline-block rounded border border-rule px-1.5 py-px text-xs text-muted">
              sources differ — all readings kept
            </span>
          )}
        </div>
      )}
      {noteItems.map((item, index) => (
        <p
          key={`${item.source}-${item.value}-${index}`}
          className="text-sm leading-relaxed text-muted"
        >
          {item.value}{" "}
          <span className="text-xs">
            — {sourceShortName(item.source)}
            {item.cite ? `, ${item.cite}` : ""}
          </span>
        </p>
      ))}
    </div>
  );
}

export function ParishRecordReadings({
  profile,
}: {
  profile: CanonicalParishProfile;
}) {
  const entry = profile.registry;
  const name = entry.names.lt || entry.names.en;
  const altName = entry.names.lt && entry.names.en ? entry.names.en : null;
  const variants = (entry.names.variants ?? []).filter(
    (variant) => variant && variant !== name && variant !== altName,
  );
  const conflicts = entry.conflicts ?? [];

  if (
    !entry.years?.founded?.length &&
    !entry.years?.closed?.length &&
    variants.length === 0 &&
    conflicts.length === 0 &&
    !entry.caveat
  ) {
    return null;
  }

  return (
    <details className="mt-5 border-t border-rule pt-4 text-sm leading-relaxed">
      <summary className="cursor-pointer font-medium underline decoration-rule underline-offset-4 hover:decoration-foreground">
        Names, date readings, and source conflicts
      </summary>
      <div className="mt-3 space-y-3">
        <YearList label="Founding readings" items={entry.years?.founded} />
        <YearList label="Closure readings" items={entry.years?.closed} />
        {variants.length > 0 && (
          <p>
            <span className="font-medium">Also recorded as:</span>{" "}
            <span className="text-muted">{variants.join(" · ")}</span>
          </p>
        )}
        {entry.caveat && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-muted dark:border-amber-900 dark:bg-amber-950/30">
            <span className="font-medium text-foreground">Data note: </span>
            {entry.caveat}
          </p>
        )}
        {conflicts.length > 0 && (
          <div className="rounded-md border border-rule px-3 py-2">
            <p className="font-medium">Where the sources disagree</p>
            {conflicts.map((conflict, index) => (
              <div
                key={`${conflict.field}-${index}`}
                className="mt-2 text-muted"
              >
                <span className="font-medium text-foreground">
                  {conflict.field}:
                </span>{" "}
                {(conflict.variants ?? [])
                  .map(
                    (variant) =>
                      `${variant.value} (${variant.source}${
                        variant.cite ? `, ${variant.cite}` : ""
                      })`,
                  )
                  .join(" · ")}
                {conflict.note && (
                  <p className="mt-1 italic">{conflict.note}</p>
                )}
              </div>
            ))}
            <p className="mt-2 text-xs text-muted">
              Every documented reading remains attached to its source; a
              difference is never silently flattened.
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

function cleanFact(value: string | undefined) {
  const fact = value?.trim();
  if (!fact || /^(none|unknown|unspecified)$/i.test(fact)) return null;
  return fact.replace(/\s+/g, " ");
}

function labeledFact(label: string, value: string | undefined) {
  const fact = cleanFact(value);
  return fact ? `${label}: ${fact.replace(/\.$/, "")}.` : null;
}

function isCitationOnly(value: string) {
  return (
    /^(?:c83 row\s*)?\d+(?:[-–/]\d+)*(?:\s*(?:p{1,2}\.?\s*)?\d+(?:[-–]\d+)?)?(?:\s*[;,]\s*\d+(?:[-–/]\d+)*)*$/i.test(
      value,
    ) ||
    /^(?:\d{4}-\d{2}-\d{2})(?:\s*;\s*\d{4}-\d{2}-\d{2})*$/i.test(
      value,
    )
  );
}

function sourceHistoryFacts(
  source: RegistrySource,
  profile: CanonicalParishProfile,
) {
  const foundingNotes = (profile.registry.years?.founded ?? []).filter(
    (reading) =>
      reading.source === source.axis && !isYearValue(reading.value),
  );
  const facts = [
    cleanFact(source.note),
    cleanFact(source.description),
    source.cites && !isCitationOnly(source.cites)
      ? cleanFact(source.cites)
      : null,
    cleanFact(source.ethnic_status),
    ...foundingNotes.map((reading) => cleanFact(reading.value)),
    labeledFact("School", source.school),
    labeledFact("Convent", source.convent),
    labeledFact("Cemetery", source.cemetery),
    labeledFact("Architect", source.architect),
    labeledFact("Historic address", source.address),
  ].filter((fact): fact is string => !!fact);

  return [...new Map(facts.map((fact) => [fact.toLowerCase(), fact])).values()];
}

function sourceCitationLine(source: RegistrySource) {
  const pages = source.pages
    ? /^(?:p{1,2}[.]?\s*)/i.test(source.pages)
      ? source.pages
      : `p. ${source.pages}`
    : null;
  const parts = [
    pages,
    source.cites && isCitationOnly(source.cites) ? source.cites : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function displayFact(fact: string) {
  const sentence = `${fact.charAt(0).toUpperCase()}${fact.slice(1)}`;
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function sourceTitle(source: RegistrySource) {
  return (
    source.work ??
    AXIS_LABEL[source.axis] ??
    source.axis.replaceAll("-", " ")
  );
}

function sortedHistorySources(profile: CanonicalParishProfile) {
  return [...(profile.registry.sources ?? [])]
    .sort(
      (left, right) =>
        (SOURCE_ORDER[left.axis] ?? 99) - (SOURCE_ORDER[right.axis] ?? 99),
    )
    .map((source) => ({
      source,
      facts: sourceHistoryFacts(source, profile),
    }))
    .filter((entry) => entry.facts.length > 0);
}

export function parishHistoryLead(profile: CanonicalParishProfile) {
  return sortedHistorySources(profile)[0]?.facts[0] ?? null;
}

export function ParishPublishedRecord({
  profile,
  excludeFact,
}: {
  profile: CanonicalParishProfile;
  excludeFact?: string | null;
}) {
  const normalizedExclude = excludeFact?.trim().toLowerCase();
  const sources = sortedHistorySources(profile)
    .map(({ source, facts }) => ({
      source,
      facts: normalizedExclude
        ? facts.filter((fact) => fact.trim().toLowerCase() !== normalizedExclude)
        : facts,
    }))
    .filter((entry) => entry.facts.length > 0);
  if (sources.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="parish-history-heading">
      <h2 id="parish-history-heading" className="font-serif text-xl font-semibold">
        Parish history
      </h2>
      <div className="mt-4 space-y-7 border-l-2 border-rule pl-5">
        {sources.map(({ source, facts }, index) => (
          <article key={`${source.axis}-${index}`}>
            <div className="space-y-2">
              {facts.map((fact) => (
                <p key={fact} className="leading-relaxed">
                  {displayFact(fact)}
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {sourceTitle(source)}
              {sourceCitationLine(source)
                ? ` · ${sourceCitationLine(source)}`
                : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
