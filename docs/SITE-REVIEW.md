# Site review — November 1, 2026

## Scope and conclusion

Reviewed the public site and source at application commit `95b939f`. The recent
Home simplification should stay: it gives returning players a clear starting
point. The next investment should improve recommendation credibility and saved
progress, rather than add more widgets or move to a paid server.

This pass produces documentation and recommendations. It does not implement the
findings below, except correcting outdated project documentation.

## Checks performed

Live browser checks used desktop 1440 × 1000 and mobile 320 × 844 / 390 × 844.
Test journal entries were created only in an isolated review browser profile.
No real player account or external database was changed.

| Check | Result |
| --- | --- |
| Home | Three primary choices; one visible H1; no horizontal overflow |
| Session planner | Returned three OSRS GP suggestions; no automatic completion |
| Catch-up date | January 1, 2023 showed 39 OSRS highlights and 183 archive posts |
| DailyScape pagination | Six cards initially; twelve after showing more |
| RS3 monthly filter | Four monthly D&Ds plus the separately labelled crystal-tree accumulation reminder |
| Completion journal | An Oyster completion produced a dated journal entry |
| Mobile | No horizontal overflow in Home or DailyScape at either tested width |
| Browser JavaScript | No page errors in the tested flows |
| Network assets | One confirmed decorative-image 404; see R13 |
| Hosted account UI | Setup-pending message; no email sign-in form available |
| Automated tests | All 39 tests passed with `npm test` |

One uncached observation reported the main JavaScript asset as **520,286 decoded
bytes / 134,796 transfer bytes**. This is a resource observation, not a Lighthouse
score, Core Web Vitals result or representative speed benchmark.

Not tested here: live Supabase auth/RLS/SMTP, production account imports,
multi-device sync, a real screen reader, every activity's current rewards, or
financial/provider account dashboards. Manual browser checks are not currently
part of committed CI. Screenshots and the raw review observation are local,
ignored artifacts under `artifacts/review-20261101*`.

## Findings and proposed fixes

P1 means address before actively promoting the site or enabling public accounts.
P2 is the next quality pass. These are recommendations, not claims of an outage.

| ID | Priority | Finding and evidence | Improvement and acceptance criterion |
| --- | --- | --- | --- |
| R01 | P1 | Recommendations can select a high-tier diary claim for an unconfigured guest. Live GP planning suggested Zaff, flax exchanges and herb boxes; `session-core.js` ranks numeric estimates, while `allowed()` only checks membership/mode. | Add explicit confirmed unlocks and unknown states. Unknown prerequisites must be labelled on each suggestion; a confirmed locked activity must not enter a plan. |
| R02 | P1 | The active character is easy to miss. `app.js` always hides `#character-bar`; the journal's profile label is inside collapsed DailyScape settings. | Add a compact game/character chip beside the game switch. A user must see whose journal will receive a completion without opening settings. |
| R03 | P1 | Backup coverage is fragmented. DailyScape JSON contains journals/preferences, while adventure export is Markdown. There is no single restore for dates, saved items, characters and journals. | Add a versioned full-device backup with a preview and non-destructive merge. A clean browser must restore a two-game, two-character fixture. Never export auth tokens. |
| R04 | P1 | The journal records expected values, not actual results. `dailyscape.js` copies an estimate into `snapshot` when marking complete. | Add optional actual GP/XP/BXP/time fields inside journal details. Preserve the original estimate and distinguish measured totals from projected totals. |
| R05 | P1 | Source freshness is manual and inconsistent in granularity. Archive metadata is October 31, activity metadata November 1; the refresh command defaults to a hard-coded October cutoff. Individual values lack separate review timestamps. | Add per-source/per-value freshness, an explicit refresh cutoff and a reviewed data-update workflow. Refreshing an index must not silently mark old estimates reviewed. |
| R06 | P1 | Whole-journal localStorage writes can lose concurrent changes. `save()` replaces the entire JSON value; a storage-event reload does not make cross-tab writes atomic. This is a source-reviewed risk, not a reproduced lost-write incident in this pass. | Use transactional IndexedDB journal writes and stable operation IDs. A two-tab simultaneous-completion test must preserve both records. |
| R07 | P2 | Mobile controls are small despite fitting the screen. Measured nav text was 10px; the account button was 8px text and 29px tall; game buttons were 33px tall. | Increase readable type and touch areas, targeting 44px control height as a design goal. Check keyboard focus and contrast separately; this measurement alone is not a WCAG conformance verdict. |
| R08 | P2 | Catch-up and DailyScape have no visible H1. Navigation uses `history.replaceState`; there is no `popstate` handler. | Give each workspace a clear H1/title and meaningful Back/Forward behavior. Changing views and reloading must restore the expected view without removing progress. |
| R09 | P2 | The quiet Home still loads the archive and activity catalog through the entry bundle. The measured main JS was approximately 520 KB decoded. | Lazy-load archive data and detailed workspaces; retain local-first behavior. Compare cold-load bytes before/after, without claiming a speed gain from bundle size alone. |
| R10 | P2 | Browser coverage exists as manual runs rather than committed CI. Current workflow runs Node tests and the build. | Commit a small browser smoke suite for Home, game switch, date refresh, pagination, mark/undo, restore and mobile layout. Use test-owned storage only. |
| R11 | P2 | `cleanJournal()` drops unknown activity IDs, while import rejects backups with unknown IDs. This can obstruct recovery if an activity is retired or identifiers change. | Retain retired activity metadata and unresolved records. A backup from the previous catalog must restore with a clear mapping report rather than lose history. |
| R12 | P2 | CSS contains multiple generations of overrides; several modules build large HTML templates. This makes further simplification harder to maintain. | Consolidate theme/layout rules and extract view helpers incrementally. Avoid a framework rewrite solely for cleanup. Preserve the existing test behavior. |
| R13 | P2 | The Home decorative image resolves to `assets/assets/landscape.svg` in production and returns HTTP 404. `styles.css` uses `./assets/landscape.svg`, while the build relocates the stylesheet into `dist/assets/` without rebasing its URL. The correct `assets/landscape.svg` returns 200. | Correct CSS asset handling for both source preview and the built repository subpath. Add a smoke assertion that expected local assets return 200, rather than watching only JavaScript exceptions. |

The old README's undeployed-site statement and obsolete manual-reminder
description are corrected in this documentation pass. Other findings remain open.

## Product improvements after the trust pass

1. Actual-result averages can make future sessions more personal than catalog examples.
2. A short saved goal can connect a new quest/boss to the next prerequisite step.
3. A spoiler toggle should control quest summaries and reward names together.
4. Optional calendar exports can provide reminders without an email backend.
5. Collection and rare-drop goals belong inside a chosen session/goal view, not on Home.

For both games, distinguish **ready by timer**, **eligible by requirements** and
**recommended for this player**. None of these proves in-game completion.

## Reproduction notes

- Open [Home](https://mintasmuktcg-creator.github.io/rune-return/?view=home) in a clean browser profile.
- Build a 15-minute GP session; inspect each activity's requirement and estimate basis.
- Open Catch up, expand Dates & filters and select January 1, 2023.
- Open DailyScape, show six more, switch to RS3 and select Monthly.
- Mark a test activity, inspect the journal and undo the test entry.
- Repeat Home/DailyScape at 320px and 390px widths and check keyboard navigation.
- Run `npm ci`, `npm test` and `npm run build` from the repository root.

For the next review, record the commit, catalog versions, device/viewports,
browser failures and whether tests used live services or isolated fixtures.
Also capture failed network requests: a clean page-error log did not detect the
decorative-image 404 in this review.
