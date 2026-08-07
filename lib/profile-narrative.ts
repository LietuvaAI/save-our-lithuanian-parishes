import { splitStory } from "@/lib/dek";
import { isLoss, type EndState } from "@/lib/end-state";

/**
 * Narrative helpers moved verbatim out of app/parishes/[slug]/page.tsx so the
 * page file is composition only. Behaviour is unchanged.
 */

export function profileStory({
  situationText,
  endState,
  founded,
  closed,
  community,
  name,
  city,
  state,
  institution,
  currentUse,
  sourceLead,
}: {
  situationText: string | null;
  endState: EndState;
  founded: number | null;
  closed: number | null;
  community: boolean;
  name: string;
  city: string;
  state: string | null;
  institution: string;
  currentUse: string | null;
  sourceLead: string | null;
}) {
  function narrativeSituation(text: string) {
    if (
      /^No Lithuanian Šv[.] Kazimiero parish ever stood inside Chicago itself/i.test(
        text,
      )
    ) {
      return "Šv. Kazimiero belonged to Chicago Heights, a separate city south of Chicago, rather than Chicago itself. The parish was founded in 1911, celebrated its first Mass at Easter 1912, and closed in the late 1980s. Sources give 1987 and 1989; the exact year remains unresolved. Earlier references to Marquette Park and Brighton Park appear to have confused the parish with the Sisters of St. Casimir motherhouse there. Ten stained-glass windows, each donated by a Lithuanian family, reached the Vilnius Archdiocese restoration trust around 2008. Their maker remains uncertain; a proposed attribution to Adolfas Valeška is disputed in Draugas reporting from 2013.";
    }
    if (/^Argentina location\b/i.test(text)) {
      return `${name} belonged to Lithuanian Catholic life in Argentina. It appears here as a diaspora comparator and is not included in United States parish counts.`;
    }
    if (
      /^Diocese closed the parish ~2009 in the Allentown wave; building sold to a private individual/i.test(
        text,
      )
    ) {
      return "The Diocese of Allentown closed the parish around 2009. The church was sold to R. Demyanovich for about $24,000 to prevent its conversion to warehouse use. This was a private sale, not a community buyout. The parish belongs to the Pennsylvania coal-region story.";
    }
    if (/^LNCC, community-governed, never diocesan\./i.test(text)) {
      return "This community-governed Lithuanian National Catholic parish broke from Roman Catholic authority during the 1916 schism. When it closed in 1972, about 30 to 40 parishioners remained; the community sold the building, which was later demolished. The parish cemetery in Bensalem, Pennsylvania, survives.";
    }
    return text
      .replace(
        /^Survived an earlier ~(\d{4}) closure danger; ~\$(\d+)K community savings deemed insufficient\. Diocese closed\/merged the parish in (\d{4}) into ([^;]+); building sold to Spanish-speakers\.$/i,
        "The parish survived a closure threat around $1, although diocesan officials considered its roughly $$$2,000 in community savings insufficient. In $3, the diocese closed the parish and merged it into $4. The church was sold to a Spanish-speaking congregation.",
      )
      .replace(
        /^Diocese closed the parish (June \d{1,2} \d{4}) under Together in Faith, merged into ([^.]+)\. Survived a (\d{4}) closure scare but resistance only delayed the outcome\. Only (\d+) registered parishioners at closure\.$/i,
        "The diocese closed the parish on $1 under Together in Faith and merged it into $2. The community had survived a closure threat in $3, but its resistance only delayed the outcome. At closure, just $4 parishioners were registered.",
      )
      .replace(
        /^Founded ~(\d{4}); by (\d{4}) described as the ([^.]+)\./i,
        `${name} was founded around $1. In $2, the surrounding neighborhood was described as the $3.`,
      )
      .replace(
        /^Founded (\d{4}), rebuilt (\d{4});\s*/i,
        `${name} was founded in $1 and rebuilt in $2. `,
      )
      .replace(/^Founded (\d{4});\s*/i, `${name} was founded in $1. `)
      .replace(/^Founded (\d{4})\.\s*/i, `${name} was founded in $1. `)
      .replace(/^Closed (\d{4});\s*/i, `The parish closed in $1. `)
      .replace(/^Survived\b/i, "The parish survived")
      .replace(
        /^Bridgeport\.\s*/i,
        "This was the Lithuanian parish in Chicago's Bridgeport neighborhood. ",
      )
      .replace(
        /\bLetter campaign to the cardinal and Pope failed\./i,
        "Parishioners appealed to the cardinal and the Pope, but the campaign failed.",
      )
      .replace(
        /;\s*rescue committee concluded saving it was impossible\./i,
        ". A rescue committee concluded that the church could not be saved.",
      )
      .replace(
        /^Marquette Park\.\s*/i,
        "This parish serves Chicago's Marquette Park neighborhood. ",
      )
      .replace(
        /^Pilsen\/Brighton Park area\.\s*/i,
        "The parish served Chicago's Pilsen and Brighton Park area. ",
      )
      .replace(
        /^18th Street\/Pilsen\.\s*/i,
        "The parish served Chicago's 18th Street and Pilsen neighborhood. ",
      )
      .replace(
        /^Back of the Yards\.\s*/i,
        "The parish served Chicago's Back of the Yards neighborhood. ",
      )
      .replace(
        /^East Side\.\s*/i,
        "The parish served Chicago's East Side. ",
      )
      .replace(
        /^Pittsburgh area\.\s*/i,
        "The parish served the Pittsburgh area. ",
      )
      .replace(/^Queens\.\s*/i, "The parish served Queens. ")
      .replace(
        /^Last Lithuanian priest died; diocese sold the building to a Mexican Catholic congregation around (\d{4})\./i,
        "After the parish's last Lithuanian priest died, the diocese sold the church to a Mexican Catholic congregation around $1.",
      )
      .replace(
        /\bLithuanian identity erased\./i,
        "Its life as a Lithuanian parish ended, while the church continued in another Catholic community.",
      )
      .replace(
        /\bBuilding fate (?:is )?(?:unrecorded|not recorded)\./gi,
        "What became of the church building has not yet been established.",
      )
      .replace(
        /^Historical reference only; closed (\d{4})\. Building may remain but identity uncertain\.$/i,
        "The parish closed in $1. The surviving sources do not yet establish whether its church building remains or what became of it.",
      )
      .replace(
        /\bSurvived inside the diocese; by (\d{4}) the sole surviving Lithuanian (?:Roman Catholic|RC) parish in Chicago\./i,
        "It survived successive diocesan changes. By $1, it was Chicago's sole surviving Lithuanian Roman Catholic parish.",
      )
      .replace(
        /\bChronic deficit covered by the archdiocese as a high-interest loan; building valued ~\$(\d+)M and not parish-owned\./i,
        "The archdiocese has covered a chronic operating deficit through a high-interest loan. The church building, valued at roughly $$$1 million, remains archdiocesan property.",
      )
      .replace(/^Closed (\d{4}) when\b/i, "The parish closed in $1 when")
      .replace(/(^|[.!?]\s+)Diocese\b/g, "$1The diocese")
      .replace(/\bclosed\/merged\b/gi, "closed and merged")
      .replace(/\bSpanish-speakers\b/gi, "a Spanish-speaking congregation")
      .replace(/\bRC\b/g, "Roman Catholic")
      .replace(/\s*\(adjudicated \d{4}-\d{2}-\d{2}[^)]*\)/gi, "")
      .replace(/\s*Registry Revision \d+[^.]*\./gi, "")
      .replace(/a ~(\d+)-year\b/gi, "a nearly $1-year")
      .replace(/~end of (\d{4})/gi, "near the end of $1")
      .replace(/\s~(\d{4})\b/g, " around $1")
      .replace(
        /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?) (\d{1,2}) (\d{4})\b/g,
        "$1 $2, $3",
      )
      .replace(/\s+/g, " ")
      .trim();
  }

  const internalStatusCopy =
    /documented in (?:the )?(?:draugas )?registry|documented in draugas|minimal (?:research details|documentation)|needs (?:clarification|verification)|status not yet (?:researched|verified)|present status not yet researched|single source only|unnamed\/duplicate parish entry/i;
  const location = [city, state].filter(Boolean).join(", ");
  const historical =
    closed !== null ||
    isLoss(endState) ||
    endState === "transferred" ||
    endState === "repurposed" ||
    endState === "demolished" ||
    endState === "closed";
  const institutionCopy =
    institution === "Parish record" ? "parish record" : institution;
  const intro = `${name} ${historical ? "was" : "is"} ${community ? "a Lithuanian worshipping community" : `a ${institutionCopy}`} in ${location}${founded ? `, founded in ${founded}` : ""}.`;
  const researched =
    situationText &&
    !internalStatusCopy.test(situationText)
      ? situationText
      : null;
  if (researched) {
    return splitStory(`${intro} ${narrativeSituation(researched)}`);
  }

  const opening = [intro, sourceLead].filter(Boolean).join(" ");
  const knownCurrentUse =
    currentUse && !/^(unknown|not established)$/i.test(currentUse)
      ? currentUse.replace(/\.$/, "")
      : null;

  if (community) {
    return splitStory(
      `${opening} The surviving evidence does not establish a distinct Lithuanian national parish.`,
    );
  }
  if (closed && isLoss(endState)) {
    const outcome =
      endState === "demolished"
        ? " The church building was later demolished."
        : endState === "repurposed"
          ? ` The church building survives in a new use.${knownCurrentUse ? ` Today, ${knownCurrentUse}.` : ""}`
          : knownCurrentUse
            ? ` Today, ${knownCurrentUse}.`
            : "";
    return splitStory(
      `${opening} The parish closed in ${closed}.${outcome}`,
    );
  }
  if (endState === "demolished") {
    return splitStory(
      `${opening} The parish closed and the church building was demolished.`,
    );
  }
  if (endState === "repurposed") {
    return splitStory(
      `${opening} The parish closed, but the church building survives in a new use.${knownCurrentUse ? ` Today, ${knownCurrentUse}.` : ""}`,
    );
  }
  if (endState === "closed") {
    return splitStory(`${opening} The parish is now closed.`);
  }
  if (endState === "transferred") {
    return splitStory(
      `${opening} Its life as a Lithuanian parish has ended, while the church continues in another community.${knownCurrentUse ? ` Today, ${knownCurrentUse}.` : ""}`,
    );
  }
  if (endState === "active_parish") {
    return splitStory(`${opening} It remains an active Lithuanian parish.`);
  }
  if (endState === "mass_continues") {
    return splitStory(
      `${opening} It is no longer Lithuanian-led, but Lithuanian Mass continues.`,
    );
  }
  if (endState === "unresolved") {
    return splitStory(
      `${opening} The parish's final institutional outcome remains unresolved.`,
    );
  }
  return splitStory(
    `${opening} The surviving sources do not yet establish the community's later history.`,
  );
}

export function researchRecordStory(recordType: string) {
  if (recordType === "phase") {
    return {
      dek: "A short-lived independent or national Catholic movement took shape here, but the surviving evidence does not establish a durable parish.",
      rest: null,
    };
  }
  if (recordType === "lead") {
    return {
      dek: "The surviving evidence points to a possible Lithuanian religious community here, but its name and institutional status remain uncertain.",
      rest: null,
    };
  }
  return {
    dek: "This place or episode belongs to the history of Lithuanian religious life, but it does not represent a separate parish or congregation.",
    rest: null,
  };
}

export function researchStatusCopy(recordType: string) {
  if (recordType === "phase") {
    return "This was a historical attempt or phase, not a separate present-day parish.";
  }
  if (recordType === "lead") {
    return "The community's identity and institutional status remain unresolved, so it is not included in parish counts.";
  }
  return "This is historical context rather than a separate parish, and it is not included in parish counts.";
}
