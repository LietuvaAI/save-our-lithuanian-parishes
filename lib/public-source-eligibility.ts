export type PublicSourceEligibilityInput = {
  title: string;
  publisher?: string;
  url?: string | null;
  reviewedPublicReference?: boolean;
};

const GENERIC_DRAUGAS_ISSUE_TITLE =
  /^Draugas(?: issue)?(?:\s*[·—-]\s*|,\s*)\d{4}-\d{2}-\d{2}(?:\s*[,·—-]\s*p(?:p)?\.\s*\d+(?:\s*[-–]\s*\d+)?)?$/i;

export function isDraugasProfileSource(
  source: PublicSourceEligibilityInput,
) {
  return (
    source.publisher?.trim().toLowerCase() === "draugas" ||
    /(?:www\.)?draugas\.org/i.test(source.url ?? "")
  );
}

/**
 * Date-only registry expansion is research navigation, not reviewed newspaper
 * metadata. It stays in the imported record but cannot render as a finished
 * public source until Brain supplies a reviewed title/page projection.
 */
export function isGenericDraugasIssueTitle(
  source: PublicSourceEligibilityInput,
) {
  return (
    isDraugasProfileSource(source) &&
    GENERIC_DRAUGAS_ISSUE_TITLE.test(source.title.trim())
  );
}

export function isPublicProfileSourceEligible(
  source: PublicSourceEligibilityInput,
) {
  if (source.reviewedPublicReference) return true;
  if (isDraugasProfileSource(source) && !source.url) return false;
  return !isGenericDraugasIssueTitle(source);
}
