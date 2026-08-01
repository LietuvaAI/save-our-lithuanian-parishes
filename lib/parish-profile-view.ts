export interface ProfileDevelopment {
  date: string;
  headline: string;
  detail: string;
  sources: { publisher: string; title: string }[];
}

export interface ProfileTimelineEvent {
  date: string;
  sortYear: number;
  title: string;
  detail: string;
}

export interface ParishProfileFact {
  label: string;
  value: string;
}

export type ChronologyEventKind = "institution" | "building";

export interface ParishProfileChronologyItem {
  date: string;
  title: string;
  detail: string;
  sources: string[];
  sortYear: number;
  /**
   * Building events carry a visible tag so no reader mistakes a dedication or
   * demolition for a parish founding or ending.
   */
  kind: ChronologyEventKind;
  /** Red date: a loss, or a documented threat of one. */
  loss: boolean;
}

export interface ParishProfileViewModel {
  historyFallback: string[];
  facts: ParishProfileFact[];
  chronology: ParishProfileChronologyItem[];
  currentSummary: string;
  currentAsOf: string | null;
}

interface ParishProfileViewInput {
  name: string;
  city: string;
  state: string | null;
  country: "US" | "CA" | "AR";
  institution: string;
  founded: number | null;
  closed: number | null;
  status: string;
  ownership: string;
  diocese: string | null;
  building: string | null;
  overview: string;
  researchOnly: boolean;
  researchStatus: string;
  currentUse: string | null;
  caseSummary: string | null;
  caseAsOf: string | null;
  developments: ProfileDevelopment[];
  timelineEvents: ProfileTimelineEvent[];
  /** Institution lifecycle as the canonical projection states it. */
  existed: string | null;
  /** The standing church and its own dedication year — a building fact, labelled as one. */
  currentChurch: string | null;
  lithuanianMass: string | null;
}

const BUILDING_EVENT =
  /\b(dedicat|demolish|razed|rebuilt|rebuild|construct|cornerstone|church building|building sold|sold the (?:church|building)|repurpos|torn down|fire|burned|site)\b/i;

const LOSS_EVENT =
  /\b(clos|closure|suppress|demolish|razed|merged|merger|transferred|sold|ended|end of|lost|lose|losing|at risk|threat|slated|dissolv|torn down)\b/i;

function location(input: ParishProfileViewInput) {
  const country =
    input.country === "CA"
      ? "Canada"
      : input.country === "AR"
        ? "Argentina"
        : null;
  return [
    input.city,
    input.state,
    country,
  ]
    .filter(Boolean)
    .join(", ");
}

function terminalPunctuation(value: string) {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function withIndefiniteArticle(value: string) {
  return `${/^[aeiou]/i.test(value) ? "an" : "a"} ${value}`;
}

function historyFallback(input: ParishProfileViewInput) {
  const place = location(input);
  const institution = withIndefiniteArticle(input.institution.toLowerCase());
  if (input.founded && input.closed) {
    return [
      `${input.name} was established in ${input.founded} as ${institution} in ${place}. Its institutional life continued until ${input.closed}.`,
    ];
  }
  if (input.founded) {
    return [
      `${input.name} was established in ${input.founded} as ${institution} in ${place}.`,
    ];
  }
  return [
    `${input.name} is documented as ${institution} in ${place}. A secure founding date has not been established.`,
  ];
}

function currentSummary(input: ParishProfileViewInput) {
  if (input.caseSummary) return input.caseSummary;
  if (input.currentUse && !/^(unknown|not established)$/i.test(input.currentUse)) {
    return terminalPunctuation(input.currentUse);
  }
  if (input.researchOnly) return input.researchStatus;
  return terminalPunctuation(input.overview);
}

function classify(title: string, detail: string) {
  const text = `${title} ${detail}`;
  return {
    kind: (BUILDING_EVENT.test(text) ? "building" : "institution") as ChronologyEventKind,
    loss: LOSS_EVENT.test(text),
  };
}

function chronology(input: ParishProfileViewInput) {
  const items: ParishProfileChronologyItem[] = [];

  function push(
    item: Omit<ParishProfileChronologyItem, "kind" | "loss">,
  ) {
    items.push({ ...item, ...classify(item.title, item.detail) });
  }

  if (input.timelineEvents.length > 0) {
    for (const event of input.timelineEvents) {
      push({
        date: event.date,
        title: event.title,
        detail: event.detail,
        sources: [],
        sortYear: event.sortYear,
      });
    }
  } else if (input.founded) {
    push({
      date: String(input.founded),
      title: "Parish established",
      detail: `${input.name} was established in ${location(input)}.`,
      sources: [],
      sortYear: input.founded,
    });
  }

  for (const development of input.developments) {
    const year = Number.parseInt(development.date.slice(0, 4), 10);
    push({
      date: development.date,
      title: development.headline,
      detail: development.detail,
      sources: [
        ...new Set(
          development.sources.map(
            (source) => source.publisher || source.title,
          ),
        ),
      ],
      sortYear: Number.isFinite(year) ? year : 9999,
    });
  }

  if (
    input.closed &&
    !items.some(
      (item) =>
        item.sortYear === input.closed &&
        /\b(close|closed|closure|suppress|merged|ended)\b/i.test(item.title),
    )
  ) {
    push({
      date: String(input.closed),
      title: "Parish life ended",
      detail: `The parish closed in ${input.closed}.`,
      sources: [],
      sortYear: input.closed,
    });
  }

  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = `${item.date}|${item.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        b.sortYear - a.sortYear ||
        b.date.localeCompare(a.date) ||
        a.title.localeCompare(b.title),
    );
}

/**
 * Four facts, true for every institution, each labelled with its own unit.
 * Ownership and per-site outcomes belong to the worship-sites section — a bare
 * "Church building" row silently blends a building fact into an institution row.
 * docs/design-system-profile.md §6.
 */
function facts(input: ParishProfileViewInput): ParishProfileFact[] {
  return [
    { label: "Institution", value: input.institution },
    {
      label: "Existed",
      value:
        input.existed ??
        (input.founded
          ? input.closed
            ? `${input.founded}\u2013${input.closed}`
            : `${input.founded}\u2013present`
          : "Founding year unresolved"),
    },
    {
      label: "Current church",
      value: input.currentChurch ?? input.building ?? "Not established",
    },
    {
      label: "Lithuanian Mass",
      value: input.lithuanianMass ?? "Not established",
    },
  ];
}

export function buildParishProfileView(
  input: ParishProfileViewInput,
): ParishProfileViewModel {
  return {
    historyFallback: historyFallback(input),
    facts: facts(input),
    chronology: chronology(input),
    currentSummary: currentSummary(input),
    currentAsOf: input.caseAsOf,
  };
}
