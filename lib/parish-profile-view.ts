import type { EndState } from "@/lib/end-state";
import type { InstitutionTransition } from "@/lib/parish-record-graph";

export interface ProfileDevelopment {
  date: string;
  headline: string;
  detail: string;
  sources: { publisher: string; title: string; url: string }[];
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
  detail?: string | null;
  href?: string | null;
  secondary?: {
    label: string;
    value: string;
    detail?: string | null;
    href?: string | null;
  } | null;
}

export type ChronologyEventKind = "institution" | "building";

export interface ParishProfileChronologyItem {
  date: string;
  title: string;
  detail: string;
  sources: { label: string; url: string }[];
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
  institutionalSummary: string;
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
  endState: EndState;
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
  /** The institution's principal church site, whether standing or demolished. */
  currentChurch: string | null;
  buildingOutcome: string | null;
  currentChurchDetail: string | null;
  currentChurchHref: string | null;
  formerChurch: {
    label: string;
    value: string;
    detail?: string | null;
    href?: string | null;
  } | null;
  lithuanianMass: string | null;
  lithuanianMassDetail: string | null;
  lithuanianMassHref: string | null;
  worshipLabel: "Lithuanian Mass" | "Lithuanian worship";
  recordType: string;
  institutionTransition: InstitutionTransition;
  institutionalLifeOverride: string | null;
  institutionalSummaryOverride: string | null;
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

const SHORT_MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function readableLifecycleRange(value: string) {
  return value.replace(
    /\b(\d{4})-(\d{2})-(\d{2})\b/g,
    (_match, year: string, month: string, day: string) =>
      `${Number(day)} ${SHORT_MONTH[Number(month) - 1]} ${year}`,
  );
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
  const institutionNoun = input.recordType === "misija" ? "Mission" : "Parish";

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
      title: `${institutionNoun} established`,
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
        ...new Map(
          development.sources.map((source) => [
            source.url,
            {
              label: source.title || source.publisher || "Read source",
              url: source.url,
            },
          ]),
        ).values(),
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
    const worshipContinues = input.endState === "mass_continues";
    push({
      date: String(input.closed),
      title: worshipContinues
        ? `Distinct ${institutionNoun.toLowerCase()} merged into its successor`
        : `${institutionNoun} life ended`,
      detail: worshipContinues
        ? `The former ${institutionNoun.toLowerCase()} institution ended in ${input.closed}; Lithuanian worship continues under its successor.`
        : `The ${institutionNoun.toLowerCase()} institution ended in ${input.closed}.`,
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
  if (input.recordType === "misija") {
    return [
      { label: "Institution", value: input.institution },
      { label: "Active", value: input.status },
      {
        label: "Worships in",
        value: input.currentChurch ?? input.building ?? "Not established",
        detail: input.currentChurchDetail,
      },
      {
        label: input.worshipLabel,
        value: input.lithuanianMass ?? "Not established",
        detail: input.lithuanianMassDetail,
        href: input.lithuanianMassHref,
      },
    ];
  }

  const existed =
    input.founded === null && input.closed
      ? `Founding year unresolved \u00b7 ended ${input.closed}`
      : readableLifecycleRange(
          input.existed ??
            (input.founded
              ? input.closed
                ? `${input.founded}\u2013${input.closed}`
                : `${input.founded}\u2013present`
              : "Founding year unresolved"),
        );
  const institutionalLife =
    input.institutionalLifeOverride ??
    (input.endState === "active_parish"
      ? `${existed} \u00b7 active`
      : input.institutionTransition === "merged"
        ? `${existed} \u00b7 merged`
        : input.institutionTransition === "succeeded"
          ? `${existed} \u00b7 succeeded by another parish`
          : input.institutionTransition === "continued"
            ? `${existed} \u00b7 continues in another institution`
            : input.endState === "mass_continues"
              ? existed
          : input.endState === "transferred"
          ? `${existed} \u00b7 Lithuanian parish ended`
          : ["closed", "demolished", "repurposed"].includes(input.endState)
            ? /\bended\b/i.test(existed)
              ? existed
              : `${existed} \u00b7 closed`
            : existed);

  return [
    { label: "Institution", value: input.institution },
    {
      label: "Institutional life",
      value: institutionalLife,
    },
    {
      label: "Church building",
      value: input.currentChurch ?? input.building ?? "Not established",
      detail: [
        input.buildingOutcome
          ? `Building status \u00b7 ${input.buildingOutcome}`
          : null,
        input.currentChurchDetail &&
        input.currentChurchDetail !== input.buildingOutcome
          ? input.currentChurchDetail
          : null,
      ]
        .filter(Boolean)
        .join(" \u00b7 ") || null,
      href: input.currentChurchHref,
      secondary: input.formerChurch,
    },
    {
      label: input.worshipLabel,
      value:
        input.lithuanianMass ??
        (input.endState === "mass_continues"
          ? "Continues; frequency not established"
          : "Not established"),
      detail: input.lithuanianMassDetail,
      href: input.lithuanianMassHref,
    },
  ];
}

function institutionalSummary(input: ParishProfileViewInput) {
  if (input.institutionalSummaryOverride) {
    return input.institutionalSummaryOverride;
  }
  if (input.recordType === "misija") {
    return "This is an active Lithuanian mission rather than a territorial or ethnic parish.";
  }
  if (input.endState === "active_parish") {
    return "The Lithuanian parish institution remains active.";
  }
  if (input.endState === "mass_continues") {
    if (input.institutionTransition === "merged") {
      return "The distinct Lithuanian parish merged into a successor institution; Lithuanian Mass continues at its worship site.";
    }
    if (input.institutionTransition === "succeeded") {
      return "The distinct Lithuanian parish was succeeded by another institution; Lithuanian Mass continues at its worship site.";
    }
    if (input.institutionTransition === "continued") {
      return "The parish's canonical or congregational life continues in another institution, where Lithuanian Mass is still celebrated.";
    }
    return "Lithuanian Mass continues, but the record does not yet establish the parish institution's final transition.";
  }
  if (input.endState === "transferred") {
    return "The Lithuanian parish institution ended; another community uses the church today.";
  }
  if (input.endState === "unresolved") {
    return "The record does not yet establish a final institutional outcome.";
  }
  if (["closed", "demolished", "repurposed"].includes(input.endState)) {
    const ended = input.closed
      ? `The parish institution ended in ${input.closed}.`
      : "The parish institution ended.";
    if (/^demolished\b/i.test(input.buildingOutcome ?? "")) {
      const year = input.buildingOutcome?.match(/\b(\d{4})\b/)?.[1];
      return `${ended} Its church building was demolished${year ? ` in ${year}` : ""}.`;
    }
    if (/^repurposed\b/i.test(input.buildingOutcome ?? "")) {
      return /standing/i.test(input.buildingOutcome ?? "")
        ? `${ended} Its former church was repurposed and remains standing.`
        : `${ended} Its former church was repurposed.`;
    }
    if (/^standing\b/i.test(input.buildingOutcome ?? "")) {
      return `${ended} Its former church remains standing.`;
    }
    return `${ended} The building's present condition is not yet established.`;
  }
  return "The institution is documented, but its present status is still being verified.";
}

export function buildParishProfileView(
  input: ParishProfileViewInput,
): ParishProfileViewModel {
  return {
    historyFallback: historyFallback(input),
    facts: facts(input),
    institutionalSummary: institutionalSummary(input),
    chronology: chronology(input),
    currentSummary: currentSummary(input),
    currentAsOf: input.caseAsOf,
  };
}
