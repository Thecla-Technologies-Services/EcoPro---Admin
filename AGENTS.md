<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
| `useListPanel({ paging: "client" })` | one that accepts neither, so both happen in memory — `GET /api/user/get-all` |
| `useFixturePanel` | rows already in hand, for a module whose endpoints are not wired yet |

Reach for `useFixturePanel` rather than passing a constant array to a table.
A constant has no loading, error or empty state, so a table fed one directly
has to be rewritten when the endpoint arrives instead of having its adapter
swapped. Keep the rows in `data/`, never in a `types/` module.

A page choosing a fixture must not change what a mutation does. Fixtures decide
which rows are shown; buttons still call the API, so an action that cannot
succeed says so rather than reporting a success that never happened.

## Modules still fed by fixtures

Wallet (overview, escrow), donations, marketing, analytics, swap-orders and the
verification queue read from `data/` and `constants/`, as do the stat cards on
disputes, swap-orders, donations, analytics and marketing — those figures are
placeholders, not live metrics. Withdrawal requests and disputes have been moved
behind `useFixturePanel`; the rest have not.
