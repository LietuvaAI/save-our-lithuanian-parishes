import type {
  CanonicalParishProfile,
  RegistrySource,
  YearReading,
} from "@/lib/parish-profile";
import { OWNERSHIP_LABEL, type Ownership } from "@/lib/parishes";

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

const SURVEY_STATUS_LABEL: Record<string, string> = {
  closed: "Closed",
  demolished: "Church demolished",
  merged: "Merged",
  open: "Open",
  open_renamed: "Open under a new name",
  open_transferred: "Open for another community",
  repurposed: "Repurposed",
  standing: "Building standing",
};

function surveyOwnershipLabel(value: string) {
  return OWNERSHIP_LABEL[value as Ownership] ?? value.replaceAll("_", " ");
}

function surveyStatusLabel(value: string) {
  return SURVEY_STATUS_LABEL[value] ?? value.replaceAll("_", " ");
}

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

function SourceDetails({
  source,
  profile,
}: {
  source: RegistrySource;
  profile: CanonicalParishProfile;
}) {
  const foundingNotes = (profile.registry.years?.founded ?? []).filter(
    (reading) =>
      reading.source === source.axis && !isYearValue(reading.value),
  );

  return (
    <div className="mt-1 space-y-1 text-muted leading-relaxed">
      {source.axis === "draugas-registry-1909-2007" && (
        <>
          {source.note && <p>{source.note}</p>}
          {(source.first_mention ||
            source.last_mention ||
            source.total_mentions) && (
            <>
              <p>
                First recorded mention:{" "}
                {source.first_mention?.slice(0, 10) ?? "not recorded"}
                {source.last_mention &&
                  source.last_mention !== source.first_mention && (
                    <>
                      {" "}
                      · Last recorded mention:{" "}
                      {source.last_mention.slice(0, 10)}
                    </>
                  )}
                {source.total_mentions
                  ? ` · ${source.total_mentions} issues`
                  : ""}
              </p>
              <p className="text-xs italic">
                Last mention is an archive observation, not a closure date.
              </p>
            </>
          )}
        </>
      )}

      {source.axis === "draugas-2008-2026" && (
        <p>
          {source.note ||
            source.cites ||
            source.work ||
            "Modern case-file evidence."}
        </p>
      )}

      {source.axis === "draugas-jubilee-implied" && (
        <>
          <p>{source.cites || source.work || "Date inferred from a reported jubilee."}</p>
          <p className="text-xs italic">
            Jubilee arithmetic is retained as a secondary reading until a
            direct founding record confirms it.
          </p>
        </>
      )}

      {(source.axis === "wolkovich" ||
        source.axis === "michelsonas-1961") && (
        <>
          {source.ethnic_status &&
            !/^(none|unknown|unspecified)$/i.test(source.ethnic_status) && (
              <p className="italic">&ldquo;{source.ethnic_status}&rdquo;</p>
            )}
          {foundingNotes.map((reading, index) => (
            <p key={`${reading.value}-${index}`}>{reading.value}</p>
          ))}
          {source.diocese &&
            !/^(none|unknown|unspecified)$/i.test(source.diocese) && (
              <p className="text-xs">Diocese: {source.diocese}.</p>
            )}
          {source.school && <p className="text-xs">School: {source.school}.</p>}
          {source.convent && (
            <p className="text-xs">Convent: {source.convent}.</p>
          )}
          {source.cemetery && (
            <p className="text-xs">Cemetery: {source.cemetery}.</p>
          )}
          {source.lens && (
            <p className="text-xs italic">Source note: {source.lens}</p>
          )}
          <p className="text-xs">
            {source.pages ? `Pages: ${source.pages}.` : "Pages not recorded."}
          </p>
        </>
      )}

      {source.axis === "lukas-2009" && (
        <>
          {source.description && <p>{source.description}</p>}
          {source.architect && (
            <p className="text-xs">Architect: {source.architect}.</p>
          )}
          {source.address && (
            <p className="text-xs">Address: {source.address}.</p>
          )}
          <p className="text-xs">
            {source.pages ? `Pages: ${source.pages}.` : "Pages not recorded."}
          </p>
        </>
      )}

      {source.axis === "web-historical" && (
        <>
          <p>
            {source.currentStatus &&
              !/^(none|unknown|unspecified)$/i.test(source.currentStatus) && (
                <>Status as surveyed: {surveyStatusLabel(source.currentStatus)}. </>
              )}
            {source.ownership &&
              !/^(none|unknown|unspecified)$/i.test(source.ownership) && (
                <>
                  Ownership as surveyed:{" "}
                  {surveyOwnershipLabel(source.ownership)}.
                </>
              )}
          </p>
          <p className="text-xs italic">
            Contemporary web check. Confidence:{" "}
            {source.confidence ?? "unspecified"}. Current claims require
            confirmation against the linked parish, diocesan, or public record.
          </p>
        </>
      )}

      {source.axis === "truelithuania" && (
        <>
          {source.yearsMentioned?.length ? (
            <p>Survey-corpus years: {source.yearsMentioned.join(", ")}.</p>
          ) : null}
          <p className="text-xs italic">
            Field-survey years are observations in that corpus, not founding
            or closure dates.
          </p>
        </>
      )}

      {!AXIS_LABEL[source.axis] && (
        <>
          {(source.description || source.note) && (
            <p>{source.description ?? source.note}</p>
          )}
          {source.pages && <p className="text-xs">Pages: {source.pages}.</p>}
        </>
      )}
    </div>
  );
}

export function ParishPublishedRecord({
  profile,
}: {
  profile: CanonicalParishProfile;
}) {
  const sources = [...(profile.registry.sources ?? [])].sort(
    (left, right) =>
      (SOURCE_ORDER[left.axis] ?? 99) - (SOURCE_ORDER[right.axis] ?? 99),
  );
  if (sources.length === 0) return null;
  const axes = new Set(sources.map((source) => source.axis)).size;

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold">
        What the published record adds
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {axes}{" "}
        {axes === 1 ? "source tradition is" : "source traditions are"} present
        in this record. Their complete public links and citations are gathered
        in the source ledger below.
      </p>
      <div className="mt-4 divide-y divide-rule border-y border-rule">
        {sources.map((source, index) => (
          <article key={`${source.axis}-${index}`} className="py-4 text-sm">
            <h3 className="font-medium">
              {source.work ?? AXIS_LABEL[source.axis] ?? source.axis}
            </h3>
            <SourceDetails source={source} profile={profile} />
          </article>
        ))}
      </div>
    </section>
  );
}
