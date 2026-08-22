import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { Country } from "react-phone-number-input";

/**
 * Normalises a phone number for a controlled `react-phone-number-input`.
 *
 * The library both emits and expects E.164, so anything already in that shape is
 * passed straight through — including the incomplete numbers it emits while
 * someone is still typing. Those must never be validated or "corrected" here: a
 * controlled value that rejects a half-typed number blanks the field on the
 * keystroke that made it incomplete, so deleting one digit wipes the whole
 * input. Validity is the form schema's job, on submit.
 *
 * Only a value from somewhere else is converted — an API record in national
 * format such as "08123456789" — and one that cannot be parsed is handed back
 * untouched rather than swallowed.
 */
export function toPhoneValue(
  raw: string | undefined | null,
  defaultCountry: Country = "NG",
) {
  if (!raw) return undefined;
  if (raw.startsWith("+")) return raw;

  const parsed = parsePhoneNumberFromString(raw, defaultCountry);
  return parsed?.number ?? raw; // parsed.number is E.164
}
