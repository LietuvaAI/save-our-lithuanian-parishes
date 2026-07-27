// First-sentence split for profile deks. The naive `indexOf(". ")` split
// truncated deks at Lithuanian and citation abbreviations ("Šv. Petro",
// "Wolkovich Vol 3 p. 147") — caught live on the Cambridge profile,
// 2026-07-27. A period only ends the dek when it isn't part of a known
// abbreviation.
const ABBR =
  /(Šv|Švč|šv|švč|Sv|Svc|sv|St|Sts|Mr|Mrs|Rev|Fr|Dr|Mons|Vol|No|Nr|p|pp|apyt)$/u;

export function splitStory(text: string): { dek: string; rest: string | null } {
  // A boundary under 40 chars makes a headline too thin ("Founded 1895.") —
  // keep scanning so the dek grows to the first substantial sentence break.
  for (let j = text.indexOf(". "); j !== -1; j = text.indexOf(". ", j + 1)) {
    if (ABBR.test(text.slice(0, j))) continue;
    if (j > 40 && j < text.length - 2)
      return { dek: text.slice(0, j + 1), rest: text.slice(j + 2) };
  }
  return { dek: text, rest: null };
}
