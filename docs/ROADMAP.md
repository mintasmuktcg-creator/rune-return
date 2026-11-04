# Product roadmap

**Priority update:** the [progression launch plan](PROGRESSION-LAUNCH-PLAN.md)
is now the leading product direction. The progression foundation is implemented;
the trust, recovery and API-verification gates below still apply. The original
review findings describe the earlier baseline rather than the current complete feature set.

Status: **proposal**, updated November 3, 2026. Phases are ordered by dependencies and
evidence, not promised launch dates. Keep the current GitHub Pages site while
the product is being validated. Findings refer to [the site review](SITE-REVIEW.md).

## Product direction

Help an OSRS or RS3 player answer: **what can I enjoy and make progress on in
the time I have?** Catch-up history explains what changed; DailyScape and saved
goals turn that context into a manageable next session.

Home keeps three entry points. Additional features live inside an existing
workspace, an activity detail or the journal. Do not add a wall of performance
charts, mandatory sign-up, leaderboards or repeated reset-pressure prompts.

## Phase 0 — Documentation baseline

Delivered in this pass: a current README, evidence-based review, free-site
runbook, staged hosting plan and a data/estimate contract. Application behavior
is unchanged by the documentation work.

## Phase 1 — Trust and recoverability on GitHub Pages

| Work | Why first | Done when |
| --- | --- | --- |
| Compact active-character indicator (R02) | Prevent logging to the wrong journal | Character and game are visible before a completion |
| Account unlock preferences (R01) | Avoid presenting elite rewards as a guest's likely return | Membership, mode, quest/diary states distinguish unknown, locked and confirmed |
| Full backup/restore (R03/R11) | Protect progress before changing storage or domains | Two characters and both games round-trip; retired IDs are retained; tokens excluded |
| Transactional local journal (R06) | Avoid lost concurrent writes and growing JSON rewrites | IndexedDB migration is reversible from backup; two-tab test preserves both entries |
| Source freshness (R05) | Give every estimate a defensible context | Price date, activity review and archive cutoff are tracked independently |
| Automatic content discovery and publication (R14) | Keep game updates and source revisions current without manual crawling | Scheduled ingestion publishes validated, allowlisted changes; publication, source revision, detection, site update and review dates remain distinct; failures retain the last good catalog |
| Browser smoke tests and asset handling (R10/R13) | Make navigation/storage regressions and production-only asset failures reviewable | CI exercises the core flows with fixtures and no real credentials; expected assets return 200 from the compiled subpath |

Ship in small changes. Add storage schema migration only after full backup/restore
exists. Do not enable a backend to compensate for an unresolved local data model.

### Automatic content maintenance (R14)

Add a tool that checks approved OSRS/RS3 news, update indexes and creator sources,
detects new or revised content, and automatically updates eligible site records.
Start with structured archive/metadata changes, then widen automatic publishing
after provider-specific validation. Conflicting methods and quantitative claims
enter review while other validated changes can publish.

Updated content retains its original publication date and source-supplied update
date. Keep first discovery, successful checks, detected revisions, accepted site
changes and actual reviews separately. A scrape or rebuild must not make an old
article look newly updated. Preserve revision history and stable IDs; catch-up
filtering must not mistake guide revisions for newly released game content.

The [content automation plan](CONTENT-AUTOMATION-PLAN.md) defines the pipeline,
date contract, automatic publication scope, failure recovery and acceptance
criteria. This is planned work; the existing research crawler and manual archive
refresh are not an unattended publishing service.

## Phase 2 — Learn from actual sessions

Add actual GP, direct XP, bonus XP, supplies and elapsed active minutes as
optional fields inside completion details. Keep estimated receipts immutable.

Show a compact summary after enough samples: sample count, average and range,
with a clear distinction between actual data and examples. Let users exclude a
rare jackpot or unusual run from their personal planning baseline without
deleting its journal entry. Never silently train estimates on another player.

Done when a user can compare estimate versus actual, select a personal baseline
for a future plan, export all fields and undo a completion without losing them.
Zero and unknown must remain distinct. A single lucky drop must not become an
automatic promise of normal GP/hour.

## Phase 3 — Better goals without a busier Home

| Addition | OSRS emphasis | RS3 emphasis | Scope boundary |
| --- | --- | --- | --- |
| Unlock roadmap | Quest/diary prerequisites, useful equipment and boss access | Story prerequisites, skill/system unlocks and boss access | One chosen goal and its next few steps; user-confirmed quest state |
| Return notes | What quest, gear or training step the player left unfinished | Story/system changes and a saved next action | Optional note on a goal; no new homepage feed |
| Spoiler controls | Quest summaries and uniques | Story branches, rewards and new encounters | Consistent across cards, planner and detail dialogs |
| Rare-drop goals | Unique/pet targets and collection progress | Boss/drop targets and collection progress | Rate-based probability where sourced; no “you are due” claim |
| Calendar export | Personal farm/Tears reminders | Selected daily/weekly/monthly reminders | User-initiated `.ics` export; no promise of closed-browser background work |

Done when users can select one goal, identify the next prerequisite and build a
session around it without opening a second dashboard. Expand verified skill
maps incrementally; the current two mappings do not establish general eligibility.

## Phase 4 — Small account pilot

The [official API plan](OFFICIAL-API-PLAN.md) adds a separate optional research
track: RS3 client skills/quest snapshots and measured XP sessions. Verify a
permitted local transfer path before making a free-site import promise. Treat
the replacement web API as a different adapter with an unverified contract,
and keep full collection-log import conditional on demonstrated coverage.

Only proceed if testers specifically need a second device or hosted imports.
Keep the useful guest path. Follow [account setup](../SETUP-ACCOUNTS.md) and the
[hosting plan](HOSTING-PLAN.md); profile sync already prepared in code does not
include DailyScape journal sync.

Pilot acceptance:

- A fresh dedicated project is used, separate from card-platform data.
- Auth, email delivery, redirect handling and cross-user isolation pass live tests.
- Guests explicitly choose what to import into an account.
- Two devices preserve independent completions and undo operations.
- Export, account deletion, outage behavior and a restore drill are exercised.
- The owner can inspect usage and explain a month's cost before inviting more users.

## Phase 5 — Hosted product and optional monetization

Move the frontend before using it as a commercial SaaS; see the linked provider
policy in [the hosting plan](HOSTING-PLAN.md). Preserve the static build and add
only the required services.

Potential paid value, to validate first: convenient cross-device history,
scheduled digests and deeper personal reports. Keep basic catch-up, transparent
estimates and data export usable. These are experiments, not an adopted price
or a claim that users will pay. Add no billing until restoration, cancellation,
support and service cost are understood.

## Validation gates

These proposed targets guide decisions; they are **not existing analytics**:

1. Ask five returning players, covering both games, to choose a useful activity
   without help. Target at least four successes within two minutes.
2. At least three of those testers should voluntarily return in a later week
   before expanding the feature set.
3. Ask whether the suggested unlocks, timers and values were correct for their
   accounts; fix repeated mismatches before adding more recommendations.
4. Add accounts when testers repeatedly request cross-device continuity, rather
   than buying hosting because a calendar date arrives.
5. Set a written monthly operating budget before enabling paid infrastructure.

Use consented interviews or an explicit feedback issue first. No analytics or
tracking service is installed as part of this roadmap.

## Deferred until justified

Public social feeds, trading, real-time market history, daily snapshots of every
character, a custom identity provider and an AI-generated source-of-truth feed.
They add cost and maintenance without establishing the returning-player use case.
