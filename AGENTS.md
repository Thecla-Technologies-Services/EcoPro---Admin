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
