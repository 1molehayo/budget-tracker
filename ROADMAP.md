# Roadmap

Phase 3 is the current product: one authenticated user, monthly budgets, savings, projects, insights, and CSV export. The main V2 goal is multi-household support, so different households can manage budgets independently.

This file sequences that work and the features already specified in [POST_MVP.md](POST_MVP.md). The milestones below are still planned. None of them have started. [STATUS.md](STATUS.md) describes what works today.

## Milestone 1 — Confidence in the current app

Make the single-user app safe to change before introducing households. Automated tests are not in the repository yet.

Acceptance criteria:

- Automated tests cover income totals, budget line items, the usable general savings pool, AJO contribution exclusion, project funding, and project lifecycle status.
- Server actions are tested for future-month rejection, income tag rules, invalid savings combinations, and access to another user's month, tag, or project.
- Edit and delete are re-checked for months, income, budget line items, savings, and projects.
- In-place editing of income, budget line items, and savings is either implemented or explicitly left as add-and-delete, and the README matches that behavior.
- `legacySavedAmount` stays read-only historical carryover. Removing it requires a reviewed migration that does not discard stored values by accident.
- The two existing lint warnings are fixed, or the contributing guide names them as known warnings.
- An optional demo seed, if added, runs only when invoked on purpose, inserts fictional rows, and refuses to write when any budget data already exists. It must not be attached to `prisma migrate dev` or `prisma migrate reset`.

## Milestone 2 — Household model and migration of existing records

Introduce households without dropping current financial rows.

Acceptance criteria:

- The schema has a household and a membership that connects a user to a household with a role.
- Roles include at least an owner and a member.
- Existing `Month`, `Tag`, and `Project` rows are attached to a household owned by the user who already owns them.
- The migration does not delete income, budget line items, savings, or projects.
- Two users cannot read each other's households.
- A database that already has Phase 3 rows can be migrated forward with `prisma migrate deploy`.

## Milestone 3 — Onboarding, membership, and authorization

Let people create a household and control who can use it.

Acceptance criteria:

- A signed-in user can create a household and becomes its owner.
- An owner can add and remove members.
- A member can work with that household's budgets. A user who is not a member cannot.
- Every budget and project server action checks membership and role on the server.
- The interface has one active household at a time.
- Local development without Supabase remains limited to development on this machine.

## Milestone 4 — Household-specific budgeting

Budgets belong to the active household.

Acceptance criteria:

- Months, income, budget line items, savings, projects, dashboard totals, insights, and CSV export are limited to the active household.
- Two households can both have a budget for the same year and month.
- Switching household changes the totals, lists, and exports.
- Project funding and the usable savings pool are calculated only from the active household.
- A migrated Phase 3 user sees their previous records inside one household.

## Milestone 5 — Single image upload and OCR review

Digitize one handwritten monthly page. The detailed workflow is in [POST_MVP.md](POST_MVP.md).

Acceptance criteria:

- A user can upload one image for a household month.
- OCR proposes the month, income, expenses, savings, and tags inside the existing monthly budget form.
- Suggested tags are editable before save. Salary and AJO labels stay suggestions, not automatic records.
- Nothing is written until the user confirms.
- A failed or abandoned extraction does not change stored budgets.

## Milestone 6 — Batch images and CSV import

CSV export already exists. Import does not.

Acceptance criteria:

- Uploading several images produces a CSV file and does not insert budget rows.
- The CSV can be edited outside the app and uploaded again.
- Import checks the file shape, months, tags, and amounts before writing.
- An invalid file imports nothing. There is no partial import.
- The user sees the validation errors before any save.
- Imported rows belong to the active household and use the same month, income, savings, and project rules as the forms.

## Later

These stay out of the milestones above until the household model and the confirmed-import rules are in place:

- Handwriting recognition that learns from corrections
- Recurring transaction detection
- Smart tag suggestions

Any of those features still require a person to confirm a change before it is stored.
