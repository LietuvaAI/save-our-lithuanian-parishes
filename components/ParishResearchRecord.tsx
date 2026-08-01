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

function publicConflictSource(source: string) {
  return /^frozen C83 source row \d+$/i.test(source)
    ? "earlier registry record"
    : source;
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
                      `${variant.value} (${publicConflictSource(variant.source)}${
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
  if (
    !fact ||
    /^(none|unknown|unspecified|not stated|n\/a)$/i.test(fact) ||
    /documented by|documented in (?:the )?(?:draugas )?registry|outside Catholic-parish registry scope|attested in the research record|present status still being researched|source record|single source|needs (?:clarification|verification)|human source review/i.test(
      fact,
    )
  ) {
    return null;
  }
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

function sentence(text: string) {
  const value = text.trim().replace(/\s+/g, " ");
  const capitalized = `${value.charAt(0).toUpperCase()}${value.slice(1)}`
    .replace(/\blithuanian\b/gi, "Lithuanian")
    .replace(/\bpolish\b/gi, "Polish")
    .replace(/\broman catholic\b/gi, "Roman Catholic")
    .replace(/\bnational catholic\b/gi, "National Catholic")
    .replace(/~late (\d{4}s)\b/gi, "the late $1")
    .replace(/~(\d{4})\b/g, "around $1")
    .replace(/\bc[.]\s*((?:18|19|20)\d{2})\b/gi, "around $1");
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function lowerFirst(text: string) {
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function withYearPreposition(text: string) {
  return text.replace(/\b(?:18|19|20)\d{2}\b/, (year, offset, full) => {
    const before = full.slice(0, offset);
    return /(?:\b(?:in|from|until|by|since)\s|,\s*)$/i.test(before)
      ? year
      : `in ${year}`;
  });
}

function withDatePreposition(text: string) {
  const value = text.trim();
  if (/^(?:on|in|from|until|by|since)\b/i.test(value)) return value;
  if (
    /^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/i.test(
      value,
    )
  ) {
    return `on ${value}`;
  }
  return withYearPreposition(value);
}

function schoolNarrative(detail: string) {
  const value = detail
    .replace(/^yes(?:[,;]\s*|\s*$)/i, "")
    .replaceAll("|", "; ")
    .trim();
  if (!value || /^none mentioned$/i.test(value)) {
    return value ? "" : "The parish maintained a school.";
  }
  const convertedChurchSchool = value.match(
    /^opened fall (\d{4}) in converted old church, (\d+) students;\s*convent (\d{4})$/i,
  );
  if (convertedChurchSchool) {
    return [
      sentence(
        `The parish school opened in fall ${convertedChurchSchool[1]} in a converted older church, with ${convertedChurchSchool[2]} students`,
      ),
      sentence(`A convent followed in ${convertedChurchSchool[3]}`),
    ].join(" ");
  }
  const datedMilestones = value.match(
    /^(\d{4}) \(built\);\s*(\d{4}) \(restaffed with (.+)\)$/i,
  );
  if (datedMilestones) {
    return sentence(
      `The parish school was built in ${datedMilestones[1]} and restaffed with ${datedMilestones[3]} in ${datedMilestones[2]}`,
    );
  }
  const openedInParentheses = value.match(/^yes \((opened .+)\)$/i);
  if (openedInParentheses) {
    return sentence(`The parish school ${lowerFirst(openedInParentheses[1])}`);
  }
  const [enrollmentFact, ...schoolChanges] = value.split(/;\s*/);
  const enrollment = enrollmentFact.match(/^(\d+)\s+students\b(.*)$/i);
  if (enrollment) {
    const later = schoolChanges.map((change) => {
      const consolidated = change.match(
        /^consolidated into (.+?) (\d{4})$/i,
      );
      if (consolidated) {
        const destination = /^(?:a|an|the)\b/i.test(consolidated[1])
          ? consolidated[1]
          : `${/^[aeiou]/i.test(consolidated[1]) ? "an" : "a"} ${consolidated[1]}`;
        return sentence(
          `It was consolidated into ${destination} in ${consolidated[2]}`,
        );
      }
      if (/^sold to .+ after closure$/i.test(change)) {
        return sentence(
          change.replace(
            /^sold to (.+) after closure$/i,
            "After the school closed, its building was sold to $1",
          ).replace(
            /\bsold to Chicago Board of Education\b/i,
            "sold to the Chicago Board of Education",
          ),
        );
      }
      return sentence(change);
    });
    return [
      sentence(
        `The parish school enrolled ${enrollment[1]} students${enrollment[2]}`,
      ),
      ...later,
    ].join(" ");
  }
  if (/^ill-fated schoolhouse begun by Valaitis,/i.test(value)) {
    return sentence(
      value.replace(
        /^ill-fated schoolhouse begun by Valaitis,\s*converted to parish hall when children shifted to consolidated Catholic school in (\d{4})$/i,
        "Valaitis began a parish schoolhouse, but it was converted into a parish hall when the children moved to a consolidated Catholic school in $1",
      ),
    );
  }
  if (/^convent\+school opened\b/i.test(value)) {
    return sentence(
      value.replace(
        /^convent\+school opened\b/i,
        "The parish school and convent opened",
      ),
    );
  }
  if (
    /^(?:opened|reopened|closed|burned|served|enrolled|began|started)\b/i.test(
      value,
    )
  ) {
    const action = lowerFirst(value)
      .replace(
        /^(opened|reopened|closed|began|started)\s+(fall|spring|summer|winter)\b/i,
        "$1 in $2",
      )
      .replace(
        /^(opened|reopened|closed|began|started)\s+((?:18|19|20)\d{2})\b/i,
        "$1 in $2",
      )
      .replace(
        /^(opened|reopened|closed)\s+((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b/i,
        "$1 on $2",
      )
      .replace(
        /^(opened|reopened|closed)\s+((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\b/i,
        "$1 in $2",
      );
    return sentence(`The parish school ${action}`);
  }
  if (/^(?:peak enrollment|enrollment peaked)\b/i.test(value)) {
    const riseAndFall = value.match(
      /^peak enrollment (\d+), dropped to (\d+) by (\d{4})$/i,
    );
    if (riseAndFall) {
      return sentence(
        `The parish school reached a peak enrollment of ${riseAndFall[1]} before falling to ${riseAndFall[2]} by ${riseAndFall[3]}`,
      );
    }
    return sentence(`The parish school reached ${lowerFirst(value)}`);
  }
  if (/^(?:kindergarten|catechetical center)\b/i.test(value)) {
    return sentence(`Parish education included ${lowerFirst(value)}`);
  }
  if (/^parochial school\b/i.test(value)) return sentence(value);
  const article = /^[aeiou]/i.test(value) ? "an" : "a";
  return sentence(
    `The parish maintained ${article} ${withYearPreposition(lowerFirst(value))}`,
  );
}

function conventNarrative(detail: string) {
  const value = detail.trim();
  if (/^yes$/i.test(value)) return "The parish maintained a convent.";
  if (/^yes\s*\((.+)\)$/i.test(value)) {
    return sentence(`The parish maintained a convent, ${value.match(/^yes\s*\((.+)\)$/i)?.[1]}`);
  }
  if (/^purchased\b/i.test(value)) {
    const [purchase, ...later] = value
      .replace(/^purchased\s*/i, "")
      .split(/;\s*/);
    const first = sentence(
      `The parish purchased a convent ${withDatePreposition(purchase)}`,
    );
    const developments = later.map((clause) => {
      const newConvent = clause.match(/^new convent\s+(\d{4})$/i);
      return newConvent
        ? sentence(`A new convent followed in ${newConvent[1]}`)
        : sentence(clause);
    });
    return [first, ...developments].join(" ");
  }
  if (/^(?:blessed|renovated|completed)\b/i.test(value)) {
    const [verb, ...rest] = value.split(/\s+/);
    return sentence(
      `The parish convent was ${verb.toLowerCase()} ${withYearPreposition(
        rest.join(" "),
      )}`,
    );
  }
  if (/^opened\b/i.test(value)) {
    return sentence(`The parish convent ${withYearPreposition(lowerFirst(value))}`);
  }
  if (/^\d{4}(?:-\d{4})?$/.test(value)) {
    const [from, to] = value.split("-");
    return to
      ? sentence(`The parish maintained a convent from ${from} to ${to}`)
      : sentence(`The parish convent dates to ${from}`);
  }
  if (/^housing\b/i.test(value)) {
    return sentence(`The parish sought ${lowerFirst(value)}`);
  }
  return sentence(`The parish convent ${lowerFirst(value)}`);
}

function cemeteryNarrative(detail: string) {
  const value = detail.trim();
  if (/^yes$/i.test(value)) return "The parish maintained a cemetery.";
  if (/^land purchased\b/i.test(value)) {
    return sentence(
      `The parish purchased cemetery land ${withYearPreposition(
        value.replace(/^land purchased\s*/i, ""),
      )}`,
    );
  }
  if (/^\d+\s+acres purchased\b/i.test(value)) {
    return sentence(
      `The parish purchased ${value.replace(
        /^(\d+\s+acres) purchased\s*/i,
        "$1 for its cemetery ",
      ).replace(
        /^(.*?\bcemetery)\s+(.+)$/,
        (_match, subject, date) =>
          `${subject} ${withDatePreposition(date)}`,
      )}`,
    );
  }
  if (/^st[.]\s/i.test(value)) {
    return sentence(`Its cemetery was ${value}`);
  }
  if (/^non-churchgoers' own Liberty Cemetery/i.test(value)) {
    return sentence(
      value.replace(
        /^non-churchgoers' own Liberty Cemetery,\s*abandoned\/overgrown by (\d{4})$/i,
        "The community also had Liberty Cemetery, which was abandoned and overgrown by $1",
      ),
    );
  }
  if (/^congregation bought a cemetery\b/i.test(value)) {
    return sentence(
      value
        .replace(/^congregation bought/i, "The congregation purchased")
        .replace(/\bc[.](\d{4})\b/i, "around $1"),
    );
  }
  return sentence(value);
}

function formatHistoricDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!month || !day) return String(year);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

function narrativeFact(fact: string) {
  const value = fact.trim().replace(/[.\s]+$/, "");
  const approximateMilestone = value.match(
    /^~(\d{4})\s*\(([^)]+)\)$/,
  );
  if (approximateMilestone) {
    const [, year, label] = approximateMilestone;
    if (/split from\b/i.test(label)) {
      return sentence(
        `The independent parish split from ${label
          .replace(/^split from\s*/i, "")
          .replace(/^sv[.]\s*/i, "St. ")} around ${year}`,
      );
    }
    return sentence(`This phase began around ${year}`);
  }
  if (/^not precisely dated\b/i.test(value)) {
    return sentence(
      value.replace(
        /^not precisely dated \(after (.+)\)$/i,
        "The parish formed after $1, but the exact year is not given",
      ),
    );
  }
  if (/^lithuanian \(opposed by Irish Catholics as ['"]foreigners['"]\)$/i.test(value)) {
    return "The parish formed despite opposition from Irish Catholics, who treated the Lithuanian community as foreign.";
  }
  if (/^mixed, later split - Poles fully separated$/i.test(value)) {
    return "The parish began as a mixed Lithuanian-Polish community; its Polish members later separated.";
  }
  if (
    /^Lithuanian settler colony\/land-company promotion; small chapel built for exclusively Lithuanian congregation$/i.test(
      value,
    )
  ) {
    return "Lithuanian settlers gathered around a land-company colony and built a small chapel for their community.";
  }
  if (
    /^(?:independent\/schismatic Lithuanian national parish|Lithuanian separatist Catholic congregation|Lithuanian National Catholic|Lithuanian national parish|Roman Catholic)$/i.test(
      value,
    )
  ) {
    return "";
  }
  if (/^Lithuanian National Catholic \(attempted, failed\)$/i.test(value)) {
    return "A Lithuanian National Catholic parish was attempted here but did not endure.";
  }
  if (
    /^Lithuanian National Catholic, later reverted to Roman Catholic$/i.test(
      value,
    )
  ) {
    return "The community began outside Roman Catholic diocesan authority and later returned to it.";
  }
  const soleLithuanianOrigin = value.match(
    /^Lithuanian national parish \(sole Lithuanian-origin parish left in (.+) after (\d{4})\)$/i,
  );
  if (soleLithuanianOrigin) {
    return sentence(
      `After ${soleLithuanianOrigin[2]}, it was the only parish of Lithuanian origin left in ${soleLithuanianOrigin[1]}`,
    );
  }
  if (/^explicitly Lithuanian\b/i.test(value)) {
    const descriptions = value.match(
      /^explicitly Lithuanian\s*[—-]\s*described as ['"](.+?)['"] (\(p[.]?\s*\d+\)); still one of ['"](.+?)['"] (\(p[.]?\s*\d+\))$/i,
    );
    if (descriptions) {
      return [
        sentence(`The parish was called "${descriptions[1]}" ${descriptions[2]}`),
        sentence(
          `By the mid-1990s, it remained one of "${descriptions[3]}" ${descriptions[4]}`,
        ),
      ].join(" ");
    }
    return sentence(
      value
        .replace(/^explicitly Lithuanian\s*[:—-]\s*/i, "The parish was ")
        .replace(/^explicitly Lithuanian\s*/i, "The parish was Lithuanian "),
    );
  }
  const milestone = value.match(
    /^(\d{4}(?:-\d{2}-\d{2})?)\s*\(([^)]+)\)$/,
  );
  if (milestone) {
    const date = formatHistoricDate(milestone[1]);
    const label = milestone[2];
    if (/society/i.test(label)) {
      return sentence(`A parish society was established in ${date}`);
    }
    if (/official decree of founding/i.test(label)) {
      return sentence(`The official decree founding the parish followed on ${date}`);
    }
    if (/^committee$/i.test(label)) {
      return sentence(`A parish organizing committee formed in ${date}`);
    }
    if (/excavation began/i.test(label)) {
      return sentence(`Excavation for the church began in ${date}`);
    }
    if (/cornerstone/i.test(label)) {
      return sentence(`The church's cornerstone was laid in ${date}`);
    }
    if (/^opened$/i.test(label)) {
      return sentence(`The parish opened in ${date}`);
    }
    if (/^built$/i.test(label)) {
      return sentence(`The parish building was completed in ${date}`);
    }
    if (/first pastor appointed/i.test(label)) {
      return sentence(
        `The parish received its first appointed pastor ${date.includes(",") ? "on" : "in"} ${date}`,
      );
    }
    if (/first pastor assigned/i.test(label)) {
      return sentence(`The parish received its first assigned pastor in ${date}`);
    }
    if (/first minister/i.test(label)) {
      return sentence(`The parish received its first minister in ${date}`);
    }
    if (/congregation organized/i.test(label)) {
      return sentence(
        `The congregation was formally organized ${date.includes(",") ? "on" : "in"} ${date}`,
      );
    }
    if (/bishop consented to parish/i.test(label)) {
      return sentence(`The bishop authorized the parish on ${date}`);
    }
    if (/attempted, never completed/i.test(label)) {
      return sentence(
        `An attempt to establish the parish in ${date} was never completed`,
      );
    }
    if (/committee\/first assignment of Fr[.]/i.test(label)) {
      return sentence(
        `An organizing committee formed and ${label.replace(
          /^committee\/first assignment of /i,
          "",
        )} received the first priestly assignment in ${date}`,
      );
    }
    if (/incorporated/i.test(label)) {
      if (/^incorporated$/i.test(label)) {
        return sentence(`The congregation was incorporated in ${date}`);
      }
      return sentence(
        label
          .replace(
            /^(.+?) incorporated\b/i,
            "$1 was incorporated",
          )
          .replace(/\bApr[.]\s*/i, "April ")
          .replace(/\bMay\s*/i, "May "),
      );
    }
    if (/^organized by\b/i.test(label)) {
      return sentence(
        `The parish was ${lowerFirst(label).replace(
          /\bkun[.]\s*/i,
          "Fr. ",
        )} in ${date}`,
      );
    }
    if (/separate parish/i.test(label)) {
      return sentence(`The community became a separate parish in ${date}`);
    }
    if (/parish took shape/i.test(label)) {
      return sentence(`The parish took shape in ${date}`);
    }
    if (/^per\b/i.test(label)) {
      return sentence(`One published account dates the parish to ${date}`);
    }
    if (/main narrative/i.test(label)) {
      return sentence(`One published history dates this effort to ${date}`);
    }
    if (/Lithuanians began settling/i.test(label)) {
      return sentence(`In ${date}, ${lowerFirst(label)}`);
    }
    return sentence(`In ${date}, ${lowerFirst(label)}`);
  }
  const labeled = value.match(
    /^(School|Convent|Cemetery|Architect|Historic address):\s*(.+)$/i,
  );
  if (labeled) {
    switch (labeled[1].toLowerCase()) {
      case "school":
        return schoolNarrative(labeled[2]);
      case "convent":
        return conventNarrative(labeled[2]);
      case "cemetery":
        return cemeteryNarrative(labeled[2]);
      case "architect":
        return sentence(`The church was designed by ${labeled[2]}`);
      default:
        return sentence(`The church stood at ${labeled[2]}`);
    }
  }
  if (/^founded\b/i.test(value)) {
    return sentence(
      `The parish was ${lowerFirst(value).replace(
        /^founded as lithuanian\b/i,
        "founded as a Lithuanian",
      )}`,
    );
  }
  if (/^organized by\b/i.test(value)) {
    const undatedSpan = value.match(
      /^organized by (.+?) after fleeing Shamokin \(undated, within his ['"]8 year['"] span of founding 3 mixed parishes\)$/i,
    );
    if (undatedSpan) {
      return [
        sentence(
          `The parish was organized by ${undatedSpan[1].replace(
            /\bkun[.]\s*/i,
            "Fr. ",
          )} after he left Shamokin`,
        ),
        "The published account places this work within an eight-year period during which he founded three mixed parishes.",
      ].join(" ");
    }
    return sentence(
      `The parish was ${lowerFirst(value).replace(/\bkun[.]\s*/i, "Fr. ")}`,
    );
  }
  if (
    /^(?:lithuanian|mixed|polish|roman catholic|independent|territorial|national catholic)\b/i.test(
      value,
    )
  ) {
    const [identity, ...details] = value.split(/;\s*/);
    if (
      /^(?:lithuanian(?: parish)?|roman catholic|lithuanian roman catholic parish(?: \(mission\))?|lithuanian national catholic(?: church)?(?: congregation)?|lithuanian national parish|national catholic|mixed(?: lithuanian[-/]polish(?:[-/]slovak[-/]rusyn)?)?)$/i.test(
        identity.trim(),
      )
    ) {
      if (details.length === 0) return "";
      return details.map(narrativeClause).join(" ");
    }
    if (/^lithuanian,\s*but conflicted:/i.test(value)) {
      return sentence(
        value.replace(
          /^lithuanian,\s*but conflicted:/i,
          "Its early ethnic classification was contested:",
        ),
      );
    }
    if (/^lithuanian mother parish,\s*though/i.test(value)) {
      const details = value
        .replace(/^lithuanian mother parish,\s*though/i, "")
        .split(/;\s*/)
        .map((detail) => detail.trim());
      const earlyPastor = details[0]
        ? sentence(
            `In its early years, ${details[0].replace(
              /^early pastor/i,
              "its pastor",
            )}`,
          )
        : "";
      const dedication = details[1]
        ? sentence(
            details[1].replace(
              /^dedication sermons given in both Lithuanian and Polish \((\d{4})\) reflecting close ties$/i,
              "At the $1 dedication, sermons were delivered in both Lithuanian and Polish, reflecting those close ties",
            ),
          )
        : "";
      const foundingRole = details[2]
        ? sentence(
            details[2].replace(
              /^nonetheless explicitly the founding Lithuanian \(['"]mother['"]\) church of Chicago$/i,
              "Even so, it was explicitly understood as Chicago's founding Lithuanian mother church",
            ),
          )
        : "";
      return [
        "The parish became the mother parish of Lithuanian Catholic Chicago.",
        earlyPastor,
        dedication,
        foundingRole,
      ]
        .filter(Boolean)
        .join(" ");
    }
    return sentence(value);
  }
  return sentence(value);
}

function narrativeClause(clause: string) {
  const value = clause.trim();
  const foundingPair = value.match(
    /^founded for ['"](.+?)['"] congregation (\(p[.]?\s*\d+[^)]*\)),\s*(Fr[.] .+?) ['"]credited with founding this parish['"] (\(p[.]?\s*\d+[^)]*\))$/i,
  );
  if (foundingPair) {
    return [
      sentence(
        `The parish was founded to serve the ${foundingPair[1].replace(
          /\s+parish$/i,
          "",
        )} congregation ${foundingPair[2]}`,
      ),
      sentence(
        `${foundingPair[3]} is credited with founding the parish ${foundingPair[4]}`,
      ),
    ].join(" ");
  }
  const foundingCongregation = value.match(
    /^founded for ['"](.+?)['"] congregation (\(p[.]?\s*\d+[^)]*\))$/i,
  );
  if (foundingCongregation) {
    return sentence(
      `The parish was founded to serve the ${foundingCongregation[1].replace(
        /\s+parish$/i,
        "",
      )} congregation ${foundingCongregation[2]}`,
    );
  }
  if (
    /^Fr[.] .+ ['"]credited with founding this parish['"] \(\s*p[.]?\s*\d+\s*\)$/i.test(
      value,
    )
  ) {
    return sentence(
      value.replace(
        /\s*['"]credited with founding this parish['"]\s*/i,
        " is credited with founding the parish ",
      ),
    );
  }
  const restoredIdentity = value.match(
    /^pastor (.+?) in (\d{4}s) ['"]restor\[ed\] the ["']primacy of Lithuanian["']["']? after a period of (.+) (\(p[.]?\s*\d+\))$/i,
  );
  if (restoredIdentity) {
    return sentence(
      `In the ${restoredIdentity[2]}, Pastor ${restoredIdentity[1]} restored the primacy of Lithuanian after a period of ${restoredIdentity[3]} ${restoredIdentity[4]}`,
    );
  }
  const populationShare = value.match(
    /^["']?([\d,]+) lived here, representing (\d+)% of the inhabitants["']?\s*(\(p[.]?\s*\d+\))$/i,
  );
  if (populationShare) {
    return sentence(
      `At the time, Lithuanian residents numbered about ${populationShare[1]} and made up ${populationShare[2]} percent of the town's population ${populationShare[3]}`,
    );
  }
  const laterLithuanianLife = value.match(
    /^parish ['"]retains (.+)['"]\s*(\(p[.]?\s*\d+\))$/i,
  );
  if (laterLithuanianLife) {
    return sentence(
      `A later parish history noted that the parish retained ${laterLithuanianLife[1]
        .replace(/\bare sung\b/i, "were sung")
        .replace(/\bwith a monthly Mass\b/i, "and celebrated a monthly Mass")} ${laterLithuanianLife[2]}`,
    );
  }
  const foundingVisits = value.match(
    /^founded via (.+?) visits and split from (.+)$/i,
  );
  if (foundingVisits) {
    return sentence(
      `The community formed through visits by ${foundingVisits[1]} and separated from ${foundingVisits[2]}`,
    );
  }
  if (/^founded under\b/i.test(value)) {
    return sentence(`The parish was ${lowerFirst(value)}`);
  }
  if (/^founded for\b/i.test(value)) {
    return sentence(`The parish was ${lowerFirst(value)}`);
  }
  if (/^split from\b/i.test(value)) {
    return sentence(`The parish ${lowerFirst(value).replace(/^split/, "separated")}`);
  }
  if (/^conflicting diocesan reports:/i.test(value)) {
    return sentence(
      value.replace(
        /^conflicting diocesan reports:/i,
        "Diocesan reports differed over the community's ethnic character:",
      ),
    );
  }
  if (/^described as\b/i.test(value)) {
    return sentence(`It was ${lowerFirst(value)}`);
  }
  if (/^congregation\b/i.test(value)) {
    return sentence(`The ${lowerFirst(value)}`);
  }
  if (/^parish\b/i.test(value)) {
    return sentence(`The ${lowerFirst(value)}`);
  }
  return sentence(value);
}

export function parishHistoryLeadNarrative(
  profile: CanonicalParishProfile,
) {
  const lead = parishHistoryLead(profile);
  return lead ? narrativeFact(lead) : "";
}

function significantWords(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9ąčęėįšųūž]+/gi, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 3 &&
          ![
            "parish",
            "church",
            "lithuanian",
            "published",
            "history",
            "record",
          ].includes(word),
      ),
  );
}

function coveredByOverview(fact: string, overviewText: string) {
  const factWords = significantWords(fact);
  if (factWords.size === 0) return false;
  const overviewWords = significantWords(overviewText);
  let shared = 0;
  for (const word of factWords) {
    if (overviewWords.has(word)) shared += 1;
  }
  return shared / factWords.size >= (factWords.size < 3 ? 0.5 : 0.7);
}

function narrativeGroup(fact: string) {
  if (/^(?:School|Convent|Cemetery|Architect|Historic address):/i.test(fact)) {
    return "parish-life";
  }
  if (
    /\b(?:closed|closure|merged|demolished|sold|ended|absorbed|transferred|repurposed|current|today)\b/i.test(
      fact,
    )
  ) {
    return "what-changed";
  }
  return "origins";
}

export function ParishPublishedRecord({
  profile,
  overviewText,
  supplementalNarrative,
  fallbackNarrative,
  closingNote,
}: {
  profile: CanonicalParishProfile;
  overviewText?: string;
  supplementalNarrative?: string[];
  fallbackNarrative?: string[];
  closingNote?: string;
}) {
  const seen = new Set<string>();
  const facts = sortedHistorySources(profile)
    .flatMap((entry) => entry.facts)
    .filter((fact) => {
      const key = fact.trim().toLowerCase();
      if (
        seen.has(key) ||
        (overviewText && coveredByOverview(fact, overviewText))
      ) {
        return false;
      }
      seen.add(key);
      return true;
    });
  const groups = ["origins", "parish-life", "what-changed"]
    .map((group) =>
      facts
        .filter((fact) => {
          const generic = fact.match(/^(School|Convent|Cemetery):\s*yes[.]?$/i);
          if (!generic) return true;
          return !facts.some(
            (candidate) =>
              candidate !== fact &&
              new RegExp(`^${generic[1]}:`, "i").test(candidate),
          );
        })
        .filter((fact) => {
          const conventYear = fact.match(/^Convent:\s*(\d{4})[.]?$/i);
          if (!conventYear) return true;
          return !facts.some(
            (candidate) =>
              /^School:/i.test(candidate) &&
              new RegExp(`\\bconvent\\b[^.]*\\b${conventYear[1]}\\b`, "i").test(
                candidate,
              ),
          );
        })
        .filter((fact) => narrativeGroup(fact) === group)
        .map(narrativeFact)
        .filter(Boolean),
    )
    .filter((group) => group.length > 0);
  const supplemental = (supplementalNarrative ?? []).filter(Boolean);
  const narrative =
    supplemental.length > 0 || groups.length > 0
      ? supplemental
      : (fallbackNarrative ?? []).filter(Boolean);

  return (
    <section
      id="profile-history"
      className="mt-10 scroll-mt-8"
      aria-labelledby="parish-history-heading"
    >
      <h2 id="parish-history-heading" className="font-serif text-2xl font-semibold">
        History
      </h2>
      <div className="mt-4 max-w-2xl space-y-4">
        {narrative.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
        {groups.map((group, index) => (
          <p key={index} className="leading-relaxed text-muted">
            {group.join(" ")}
          </p>
        ))}
        {closingNote && (
          <p className="leading-relaxed text-foreground">{closingNote}</p>
        )}
      </div>
    </section>
  );
}
