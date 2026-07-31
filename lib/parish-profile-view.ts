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

export interface ParishProfileChronologyItem {
  date: string;
  title: string;
  detail: string;
  sources: string[];
  sortYear: number;
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
  country: "US" | "CA";
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
}

function location(input: ParishProfileViewInput) {
  return [
    input.city,
    input.state,
    input.country === "CA" ? "Canada" : null,
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

function chronology(input: ParishProfileViewInput) {
  const items: ParishProfileChronologyItem[] = [];

  if (input.timelineEvents.length > 0) {
    for (const event of input.timelineEvents) {
      items.push({
        date: event.date,
        title: event.title,
        detail: event.detail,
        sources: [],
        sortYear: event.sortYear,
      });
    }
  } else if (input.founded) {
    items.push({
      date: String(input.founded),
      title: "Parish established",
      detail: `${input.name} was established in ${location(input)}.`,
      sources: [],
      sortYear: input.founded,
    });
  }

  for (const development of input.developments) {
    const year = Number.parseInt(development.date.slice(0, 4), 10);
    items.push({
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
    items.push({
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
        a.sortYear - b.sortYear ||
        a.date.localeCompare(b.date) ||
        a.title.localeCompare(b.title),
    );
}

export function buildParishProfileView(
  input: ParishProfileViewInput,
): ParishProfileViewModel {
  return {
    historyFallback: historyFallback(input),
    facts: [
      {
        label: "Founded",
        value: input.founded ? String(input.founded) : "Not established",
      },
      { label: "Present status", value: input.status },
      { label: "Type", value: input.institution },
      { label: "Ownership", value: input.ownership },
      {
        label: "Diocese or jurisdiction",
        value: input.diocese ?? "Not established",
      },
      {
        label: "Church building",
        value: input.building ?? "Not established",
      },
    ],
    chronology: chronology(input),
    currentSummary: currentSummary(input),
    currentAsOf: input.caseAsOf,
  };
}
