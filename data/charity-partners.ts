/**
 * Stand-in charity partners, for the donations module's recipient filter.
 *
 * The Admin API lists organizations only one at a time
 * (`GET /verification/organizations/{id}`), and the donations table itself is
 * fed by fixtures — so these names are also what the sample donation rows are
 * addressed to, which is what makes filtering by one of them show anything.
 */
export const CHARITY_PARTNERS: string[] = [
  "Hope Alive Foundation",
  "Green Earth Initiative",
  "Lagos Food Bank",
  "Bright Futures Trust",
  "Shelter for All",
  "Care Circle Africa",
];
