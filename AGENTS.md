<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Where a file goes

`ls` shows the folders. What it cannot show is which one a new file belongs in,
and three of them sort by what a file *is* rather than what it describes — so
all three end up holding something named after the same entity:

| Folder | Holds |
| --- | --- |
| `types/` | declarations only. One file per domain entity, named after it in the singular: `listing.ts` declares `Listing` |
| `constants/` | closed option lists, their label maps, and the `to*Param` converters that drop a sentinel |
| `data/` | fixture rows standing in for an endpoint that is not wired yet. Named for the rows in the plural, and the export is that name in caps: `applicants.ts` exports `APPLICANTS` |

`components/` sorts by who calls a file:

| Folder | Called by |
| --- | --- |
| `ui/` | anything. Vendored shadcn — change a primitive by re-adding it through `components.json`, since editing in place is lost on the next regeneration |
| `layout/` | `app/(dashboard)/layout.tsx` alone: the chrome wrapping every page |
| `shared/` | a module page, composing the compounds below |
| `shared/form/` `shared/date/` | a form, or a date filter. Grouped because each set is only ever reached as a set |
| `dashboard/<module>/` | one module. The folder carries its route segment's name, so `/swap-orders` is served out of `dashboard/swap-orders/` |

A file two modules both need moves up to `shared/`. A file one module needs
stays in that module's folder, however likely a second module looks to want it.

In `lib/`, two functions format a date and the input tells them apart:
`formatDayLabel` (`lib/date.ts`) takes a `Date`, for the picker; `formatDate`
(`lib/adapters/shared.ts`) takes the API's timestamp string, for a table row.

# Shared composition components

Module pages under `app/(dashboard)/` are all the same shape, so the repeated
scaffolding lives in `components/shared/` as compound components. Compose these
before writing new markup — and when one of them nearly fits, add a slot rather
than a boolean prop.

| Component | Parts | Replaces |
| --- | --- | --- |
| `PageHeader` | `.Heading` `.Title` `.Description` `.Actions` | the title / subtitle / button band |
| `StatGrid` | — (children are the cards) | the metrics grid plus its hand-written `FadeIn` delays |
| `DataState` | `.Error` `.Loading` `.Empty` `.Content` | the error → loading → empty → data ternary ladder |
| `Toolbar` | `.Start` `.End` | the filters-left / search-right band |
| `FilterTabs` | `.Tab` | rows of `TabButton` with their own active-state plumbing |
| `TableSearchInput` | — | the icon-prefixed search field in a table header |
| `RowActions` | `.Item` | the kebab `DropdownMenu` in a table's last column |
| `DetailDialog` | `.Section` `.Footer` | the scrolling, hairline-divided record dialog |
| `EntityHeader` | `.Identity` `.Meta` `.MetaItem` | avatar + name + badges + contact facts |
| `DetailList` | `.Row` `.Rows` | label/value facts (`between` \| `stacked` \| `inline`) |
| `ActionDialog` | `.Media` `.Title` `.Description` `.Error` `.Actions` `.Cancel` `.Confirm` `.Destructive` `.Done` | confirm / success dialogs |
| `ChoiceList` | `.Option` `.Options` | single-select reason pickers |

`ConfirmActionDialog` stays the shorthand for a plain confirm-and-succeed dialog;
drop to `ActionDialog` when a flow needs extra steps or an inline error.

Pair `ActionDialog` with `useAsyncAction` (`hooks/use-async-action.ts`) instead of
hand-rolling `confirm | loading | success` state — it keeps a failed mutation on
its own step rather than reporting success for something that never happened.

# The list panel

Every list in the dashboard is the same three pieces of state — a tab, a
debounced search term, and a page position — and the same rule: any change to
what the list is showing returns it to page 1. That lives in
`useListPanel` (`hooks/shared/use-list-panel.ts`), not in the page.

A page supplies its endpoint as a hook and a row mapper, and gets
`ListPanelState<Row>` back. Filters are an opaque record: the panel never
interprets a key, so an endpoint's own parameter names stay in its own
`use*` hook. Spread `panel.table` into a table rather than threading the
props one at a time.

Two adapters sit at this seam, which is what makes it a seam rather than
indirection:

| Adapter | For |
| --- | --- |
| `useListPanel({ paging: "server" })` | an endpoint that pages and searches — `GET /api/admin/listings` |
| `useListPanel({ paging: "client" })` | one that accepts neither, so both happen in memory — `GET /api/admin/payout-settings/withdrawals/pending` |
| `useFixturePanel` | rows already in hand, for a module whose endpoints are not wired yet |

Reach for `useFixturePanel` rather than passing a constant array to a table.
A constant has no loading, error or empty state, so a table fed one directly
has to be rewritten when the endpoint arrives instead of having its adapter
swapped. The rows belong in `data/`.

A page choosing a fixture must not change what a mutation does. Fixtures decide
which rows are shown; buttons still call the API, so an action that cannot
succeed says so rather than reporting a success that never happened.

## Modules still fed by fixtures

Wallet (overview, escrow), donations, marketing, analytics and swap-orders read
from `data/`, as do the stat cards on disputes, swap-orders, donations,
analytics and marketing — those figures are placeholders, not live metrics.

Marketing goes further than unwired: campaigns reach no endpoint at all — no
DTO, no query key, no hook — so its Pause and Delete confirm, then fail with a
message saying why. Proving that absence takes a repo-wide search, so take it
from here rather than re-running one.

Disputes is behind a seam already, through `useFixturePanel`, and going live is
a one-word edit. The rest have not been moved.

Withdrawal requests and the verification queue used to sit behind the same seam
and are now live. The queue kept its option —
`useVerificationQueue({ source: "fixture" })`
(`hooks/admin/use-verification-queue.ts`) — because it is not a list panel: it
is a selection and two decisions over `GET /verification/queue`, whose rows
carry no documents, so the selected one is filled in from its own record.

## What the Admin API will not tell you

Endpoints are wired for every operation the Admin swagger documents. Four gaps
are the API's, not this app's, and each is worth knowing before redesigning
around it:

| Gap | Consequence |
| --- | --- |
| FAQ articles are written but never read — no list or detail endpoint | the FAQ tab is a form addressed by id, not a table |
| `withdrawals/pending` serves only undecided requests, and nothing reads a decided one back | the wallet table's tabs come from the statuses present, so no tab sits permanently empty |
| Withdrawals name the payout account but not the account holder | the table lost its User and User ID columns rather than showing dashes |
| Feature suggestions are listed but no endpoint changes one | that table has no kebab column |

NB: Two request bodies are multipart and declared inline in the swagger, so the
generated DTOs do not cover them: both organization writes, whose input types
live beside their hooks in `hooks/admin/use-organizations.ts`. `buildFormData`
(`lib/api/params.ts`) is what drops an empty field, because a multipart PUT
treats a field it received as one the admin meant to clear.
