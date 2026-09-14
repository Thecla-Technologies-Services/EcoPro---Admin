/**
 * The moves every adapter makes on the way from a DTO to a row.
 *
 * Each adapter still owns its own field mapping — which DTO field becomes which
 * row field, and what the API leaves out. What lives here is the handful of
 * transformations that were being written out again in each one, so a fix to
 * how a date reads or how a status token is matched lands in every module
 * rather than in whichever adapter was open at the time.
 */

/** Shown wherever a value is absent. */
export const PLACEHOLDER = "—";

/**
 * A date as the tables render it: `04 Aug 2026`.
 *
 * Tolerates both an absent value and an unparseable one — the API types most of
 * these as nullable strings, and a row with a bad timestamp should still draw.
 */
export function formatDate(
  iso: string | null | undefined,
  placeholder: string = PLACEHOLDER
): string {
  if (!iso) return placeholder;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return placeholder;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * A timestamp as the rows that carry a time render it: `04 Aug 2026, 16:12`.
 *
 * `formatDate`'s companion, for a log where two entries on the same day have to
 * be told apart. Same tolerance: an absent or unparseable value draws the
 * placeholder rather than "Invalid Date".
 */
export function formatDateTime(
  iso: string | null | undefined,
  placeholder: string = PLACEHOLDER
): string {
  if (!iso) return placeholder;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return placeholder;

  return `${formatDate(iso)}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** Splits a PascalCase API token ("DriversLicense") into words for display. */
export function humanise(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

/**
 * Looks a label up by an API token, ignoring the spacing and casing the token
 * happens to arrive in — `Pending_Review`, `pending review` and `PendingReview`
 * all find the same entry.
 *
 * An unrecognised token is passed through rather than forced into a bucket:
 * none of these vocabularies are documented as closed enums, so mislabelling an
 * unknown status is worse than showing it verbatim.
 */
export function toLabel<T extends string>(
  labels: Record<string, T>,
  value: string | null | undefined,
  fallback: T
): T | string {
  if (!value) return fallback;
  return labels[value.replace(/[\s_-]/g, "").toLowerCase()] ?? value;
}

/**
 * A person's initials, for an avatar with no photo behind it.
 *
 * One letter per word rather than the first two characters of the string:
 * "Priya IndependentRider" is PI, not PR. Capped at two so a three-part name
 * still fits the circle, and empty for a name that is blank or punctuation —
 * a caller can then show an icon rather than an empty disc.
 */
export function toInitials(name: string | null | undefined): string {
  return (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .filter((letter) => /\p{L}|\p{N}/u.test(letter))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
