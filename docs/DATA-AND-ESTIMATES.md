# Data, estimates and progress

Reviewed November 1, 2026. Sections explicitly marked **proposed** describe
future work; they are not existing storage tables or API contracts.

## Current source of truth

| Data | Current implementation | Important boundary |
| --- | --- | --- |
| Update-post archive | `archive-data.js`; two Wiki indexes | Dated posts, not a claim of every undocumented change or playable feature |
| Editorial highlights | `data.js` and `history.js` | Selected additions from 2023 onward; not the full release history |
| Repeatable activities | `dailyscape-data.js` | 111 catalog activities and grouped routes; not every possible shop item |
| Skill requirements | `requirements.js` | Two explicit mappings; most eligibility remains unknown |
| Hiscores snapshot | `character-core.js`, lookup service | Public stats; association is not proof of ownership or quest completion |
| Guest catch-up progress | `runereturn.progress.v1` in localStorage | Dates, saved/explored entries and legacy checks |
| Character profiles | `runereturn.characters.v1.<owner or guest>` | Latest snapshot and character-specific catch-up progress |
| DailyScape | `runereturn.dailyscape.v1.<owner>.<character>` | Local journal, estimates, pins and account assumptions; not cloud-synced |

Characterless guest tracking uses `guest.unassigned` as the DailyScape scope.
Both games can be present in the same scope, with separate game/activity IDs.

Current catalog metadata reports October 31, 2026 for highlights/archive and
November 1, 2026 for DailyScape. This review did not independently revalidate
every listed activity or price. A new browser test is not a data review.

## Estimate contract

Show which of the following supports a number:

1. **Sourced rule/formula:** a known reward formula with named input assumptions.
2. **Dated price snapshot:** source, observed date, tier, quantities and purchase costs.
3. **Planning scenario:** an explicit example the user can replace.
4. **User estimate:** values supplied by this profile.
5. **Unknown/utility:** no defensible numeric value; do not silently substitute zero.

The current UI communicates these distinctions through basis text and example
labels. A typed per-value provenance field and per-value review date are proposed.
Editing a note should not erase the historical origin of the underlying numbers.

### GP

Current cards generally quote GP **before selling fees**; shop costs are
subtracted only where the basis states this. They are not live market quotes.

Proposed reward model:

```text
gross proceeds = sum(expected sale quantity × dated unit price)
net proceeds = gross proceeds - purchase/supply costs - applicable selling fees
```

Record which costs are included. Show bankroll requirements separately from
profit. A free claim, a shop purchase, and an untradeable currency are different
cases. Keep OSRS and RS3 price/tax assumptions separate and reverify them when
introducing live pricing. Never value rare loot as a guaranteed outcome.

For alternatives such as XP lamps versus coins, value the selected option. Do
not count both mutually exclusive rewards in the same receipt. Untradeable
utility is not automatically an avoided GP expense.

### XP and time savings

Current comparison:

```text
equivalent minutes = (direct XP + fully used BXP) / alternative XP per hour × 60
net minutes saved = equivalent minutes - activity's active minutes
```

Active minutes should include setup/travel. Growth waiting time is not the same
as active time. Negative savings are allowed; an activity can be worthwhile for
fun, progression or supplies even if it is slower than training.

Bonus XP is deferred and assumes later consumption. The comparison rate must
be defined consistently: an already BXP-boosted alternative can double-count the
benefit. Mixed-skill rewards currently use a single chosen/blended rate; a future
model should sum `XP_i / rate_i` by skill and explain deferred components.

Do not convert XP to GP automatically. Imported levels alone do not establish
quest unlocks, equipped bonuses, session performance or the player's best method.

## Eligibility and readiness

The proposed status model separates:

- `timer_ready`: quota/cooldown allows checking the activity.
- `requirements`: unknown, confirmed locked or user-confirmed unlocked.
- `suitability`: a recommendation based on selected goals and player preferences.
- `completion_source`: manual or an explicitly identified supported import.

These are distinct. A client plugin observation or manual check is not proof of
character ownership. Do not mark a quest complete from the absence of a hiscores
entry. Keep missing levels as unknown rather than zero.

## Source maintenance

Use stable IDs and source URLs. Retire activities without removing the metadata
needed to read past receipts. An index refresh, an activity-rule review and a
price refresh are separate operations with separate timestamps.

Preserve original editorial summaries and avoid mirroring full source articles.
Before expanding ingestion, document each provider's license, attribution,
allowed access pattern and request budget. Prefer documented APIs and bounded,
identified requests. Use a reviewable content diff before publication.

The November 3 [content automation plan](CONTENT-AUTOMATION-PLAN.md) extends this
with scheduled ingestion and automatic publication for validated, allowlisted
fields. Preserve original publication and source modification dates separately
from discovery, checks, detected changes, accepted site updates and actual
review. Unknown source dates stay unknown. A source revision must not change a
game feature's release date or rewrite historical journal receipts. Conflicting
method/rate changes remain pending review while eligible metadata can update.

## Current journal and its limits

Completion records include a UUID, activity ID, UTC completion timestamp,
optional undo timestamp, reset-token flag and estimate snapshot. Resets change
readiness without deleting records. Actual rewards are not currently stored.

JSON backup merges stable record IDs and keeps undo state. CSV contains readable
completion receipts, not all device/profile data. Clearing browser storage,
changing origin or using a second browser can make a journal unavailable until
restored. A character's cloud profile does not include its DailyScape journal.

The whole journal is currently rewritten in localStorage. It has no automatic
retention cap. Failed writes report failure, but capacity and concurrent writes
still need improvement. `cleanJournal()` also currently filters unknown IDs;
preserving unresolved/retired records is an explicit roadmap item.

## Proposed full-device backup

Add a new versioned envelope rather than reinterpret the existing DailyScape v1 file:

```text
backup_schema_version
exported_at_utc
app_and_catalog_versions
guest_catchup_progress
character_profiles_and_owner_scopes
daily_journals_and_estimate_preferences
retired_or_unresolved_activity_metadata
```

Do not include auth sessions, access/refresh tokens or server secrets. Import
should show which profile will receive each dataset, preserve original IDs,
report unknown rows and avoid deleting an existing scope. Existing v1 DailyScape
files must remain importable. A new domain requires an explicit transfer path;
browser storage does not migrate with a DNS record.

Acceptance fixtures: both games, multiple characters, guest data, old/retired
IDs, missing values, zero/negative GP, undone entries, duplicate imports,
conflicting edits and a failed-storage recovery. Exported history must be
readable without the original server or current catalog.

## Proposed local storage migration

Move growing journals to IndexedDB, with transactions and a stable operation ID.
Keep small preferences separate. Before migration, support full backup and
preserve the old representation until the new one has been verified. Do not
silently erase the fallback copy. Index by profile, activity and completion time
so rendering six cards does not repeatedly scan every lifetime record.

## Proposed cloud model

This model is a design for later migrations, not a replacement SQL script to run now:

| Entity | Purpose |
| --- | --- |
| Existing `rr_characters` | Owner-scoped character identity and latest public snapshot |
| Estimate versions | Immutable, deduplicated assumptions/formulas/price references |
| Completion records | Stable completion ID, owner/character/activity, client occurrence time and server receipt time |
| Journal operations | Stable operation ID, target completion, complete/undo/actual-correction payload, server sync sequence |
| Preferences | Current unlock confirmations, pins and comparison baselines |

Each write must be authenticated and restricted to an owner-owned character.
Enforce that relationship with database constraints and RLS, not only a browser
filter. Use unique operation IDs for idempotency. A server sync cursor should
not depend on the client clock being correct.

Keep the original estimate receipt. Actual results and undo actions are separate
changes. Merge distinct completions across devices; present a conflict for
incompatible edits to the same actual-result fields. Never clear the journal at
a daily/weekly/monthly reset, and do not upload an unbounded journal into the
existing bounded `rr_characters.progress` JSON column.

Guest-to-account transfer is explicit and previewed. Keep the local copy until
server acknowledgement and a restore/export check. Define account deletion and
user-requested history deletion before public launch. Anonymous diagnostic logs
have a separate short retention policy; they are not a backup of player data.

## Future integration boundary

Keep manual import available while investigating RuneLite or RS3 plugin exports.
Verify the current interface, permissions and allowed data before promising quest
or collection-log sync. Public hiscores availability does not imply access to
banks, quests or collection logs. Do not build on an undocumented or retiring
API merely because an old guide still references it.
