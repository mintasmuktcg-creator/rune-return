# Official RuneScape API integration plan

Researched **November 1, 2026**. Status: **planning only**. No plugin, importer,
new web-API endpoint, account link or upload service is implemented by this document.
API references were inspected; no code was executed inside the game client.

## Two separate API projects

| Interface | What was verified | Implication for RuneReturn |
| --- | --- | --- |
| Replacement web API | Jagex announced the replacement of RuneMetrics/Adventurer's Log; its October 26 post schedules RuneMetrics retirement for November 10. | Design a replaceable web adapter. A documented endpoint, authentication model, CORS policy, rate limit and response schema were not verified in the sources checked here. |
| RS3 Client API | Published Lua plugin documentation exposes the logged-in character's state and client events. | An optional in-game companion could gather data for explicit transfer to RuneReturn. These functions do not run in the GitHub Pages browser. |

The web API announcement explicitly distinguishes these projects. Its promised
follow-up is not a published endpoint contract. Do not guess routes, send game
credentials to RuneReturn or begin a dependency on the retiring service.
[Official web-API announcement](https://secure.runescape.com/m=news/the-week-ahead-october-patch-week),
[Client API getting started](https://developer.runescape.com/rs/getting-started.html).

This research concerns **RS3**. Do not assume the same client API or identifiers
apply to OSRS. Retain the current OSRS hiscores/manual path and investigate a
separate supported exporter if needed later.

## Verified capabilities and possible features

The API building blocks below are documented. The proposed RuneReturn features
are engineering conclusions, not guarantees that a complete integration has
already been tested or approved.

| Building block | Concrete documented access | Proposed use | Limit |
| --- | --- | --- | --- |
| Player stats | `Player.IsAvailable()`, `GetLevelUncapped`, `GetXPUncapped`, `GetCombatLevel` | Current skill snapshot; improved skill checks | Logged-in character only; use XP-derived/base levels rather than temporary gameplay boosts for durable unlocks |
| Quest state | `QuestType.hasStartedQuest`, `hasFinishedQuest`, `canStartQuest`, prerequisite lists/checks | Hide completed quests; identify missing steps and currently startable stories | Client observation needs transfer and a stable mapping to RuneReturn's editorial entries |
| Achievements | `AchievementType.progress`, `tallyProgress`, `prereqsComplete`, requirement-group APIs | Verified subsets of unlock/achievement progress | Respect documented enum/group semantics; an achievement API is not a universal collection-log export |
| XP events | `Event.SkillTransmit`, with old/new XP | Measured session XP and personal comparison rates | Baseline login/reconnect events; XP gain alone does not identify which D&D caused it |
| Other events | `VarTransmit`, inventory changes and `GameStateChanged` | Small, validated activity detectors and session boundaries | Variable transmission can repeat the same value; unavailable data is not zero |
| Own GE offers | `GrandExchange.GetOffer`, `MaxOffers`, `GrandExchangeOfferUpdated` | Review observed purchases/sales in a chosen session | Not an all-item market-price endpoint, price history or trading automation |
| Inventory | `Inventory.Find`, inventory slot reads and validity checks | Optional reward/input observations | Containers can be removed or unavailable; a net inventory change is not automatically profit |
| HTTP | `HTTPRequest` GET/POST, headers, declared destinations and permission checks | Later opt-in upload to a pairing/ingestion service | GitHub Pages cannot accept/store these writes itself |
| Plugin storage | Persistent DB facilities | Local plugin settings and a bounded pending-transfer queue | Not the website's storage; proxy objects must be normalized into plain values |

Primary references:
[Player](https://developer.runescape.com/rs/game/player.html),
[Quests](https://developer.runescape.com/rs/game/config/questtype.html),
[Achievements](https://developer.runescape.com/rs/game/config/achievementtype.html),
[Events](https://developer.runescape.com/rs/core/events.html),
[Variables](https://developer.runescape.com/rs/game/config/vartype.html),
[GE offers](https://developer.runescape.com/rs/game/grandexchange.html),
[Inventory](https://developer.runescape.com/rs/game/inventory.html),
[HTTP](https://developer.runescape.com/rs/core/http.html),
[Persistent DB](https://developer.runescape.com/rs/core/persistentdb.html).

## First milestone: RS3 profile snapshot

An optional, user-triggered companion snapshot would include skills, quest
states and a deliberately selected set of achievement/unlock facts. Reuse the
existing character dialog for import and show the captured time beside the
active character. No new Home panel is needed.

Use quest prerequisites to explain a blocked recommendation and imported quest
completion to suppress a completed storyline step. A fresh client `canStartQuest`
observation is stronger than the current two manual skill maps, but it does not
establish equipment quality, combat ability or future availability. Preserve
manual confirmations separately from imported observations.

Acceptance criteria:

- Confirm the SDK's enumeration/mapping approach with real quests in the client.
- Check one unstarted, one started, one completed and one blocked quest.
- Normalize stable IDs/config names; do not infer identity from display-name matching alone.
- Correctly import a lower-level character and unavailable skill/quest values.
- Import is previewed and explicitly assigned to the intended RuneReturn character.
- Re-importing the same capture is idempotent; another character's data stays separate.
- The UI labels the result as an observed snapshot with a capture time, not live data or proof of ownership.

## Free GitHub Pages path

Define and fixture-test a portable snapshot format before paying for an upload
service. A client prototype must first prove an allowed user-mediated transfer
mechanism, such as a supported copy/save/export interaction. **Clipboard or file
export was not verified in this research**; the format alone does not prove the
client can produce a downloadable file.

Once transfer is proven, a browser-only importer can validate and merge a
user-selected payload locally. Keep the manual/hiscores workflows working if
no plugin is installed. Do not use an embedded GitHub token, public repository
commit, localhost listener or Jagex password as a shortcut for private data transfer.

Proposed format — RuneReturn's own contract, not a Jagex API response schema:

```text
schema: runereturn.rs3.snapshot.v1
capture_id: stable ID for deduplicating a particular capture
captured_at_utc
source: client plugin name/version and RuneReturn adapter version
game: rs3
character_reference: user-assigned scope; optional permitted tracking identifier
capabilities: present/unavailable/unsupported by data section
skills: base levels and XP, with canonical skill mappings
quests: stable source identifiers and observed states/prerequisite checks
achievements: only the explicitly supported IDs and states
sessions: optional user-started session receipts
```

Use explicit unavailable reasons and retain unknown identifiers for later
mapping. No authentication tokens, full chat transcripts, other-player data,
entire-bank dump or location history belong in the minimum format. Display names
and tracking references are not a game-account authentication mechanism.

The existing `cleanCharacters()`/hiscores snapshot format does not import this
data today. Introduce a separate versioned observation structure and migration
tests instead of claiming the current character importer already supports it.

## Second milestone: measured sessions

Let the user explicitly start, pause and finish a named session. Establish skill
baselines, aggregate positive XP deltas and save one summary at the end.
Restart baselines across logout, reconnect and character switches; do not count
initial skill transmissions as newly earned lifetime XP.

Use observed XP to improve personal session estimates. Do not claim to know
stored bonus XP or split consumed BXP from ordinary XP without a documented,
tested signal. Duration should distinguish active user-tracked time from elapsed
wall time. XP measurements do not by themselves prove eligibility or completion.

Optional inventory/own-offer observations can support a user-reviewed reward
receipt later. Banking, trades, purchases, supplies and fees complicate net GP;
neither coin balance changes nor offer list prices are sufficient evidence of
profit. Keep actuals separate from the original estimate.

Done when a known XP-gain fixture, a login/reconnect and a character switch each
produce the expected totals without duplicate receipts. Include inactivity and
interrupted-session recovery before using the result as a personal baseline.

## Third milestone: selected automatic activity signals

Choose one D&D whose documented/exposed state can be validated against actual
gameplay. Maintain a small, versioned mapping of the exact activity, state
variable and meaningful completion transition. The API does not expose every
server variable; a variable event is not necessarily a value change.

Observe a real completion, repeated transmission, reset, token reset and login
with an already-completed state. Only a validated fresh completion transition
can create a new dated observed record. An initial completed state can tell us
it was done earlier, but cannot supply the original completion timestamp.

Keep manual correction and unknown states. Do not roll this out as “all dailies
automatically tracked.” Suppress duplicate imports/observations by stable record
IDs and maintain the original manual/import source on each receipt.

## Collection logs and other open research

- A complete item-by-item historical collection-log interface was **not verified**
  in the pages reviewed. Achievement tallies and transmitted variables may
  support selected progress, but require their own mappings and coverage tests.
- Recording a new observed drop after installing a plugin is different from
  importing every historical unlock. Missing history must remain unknown.
- A generic inventory/ground-item event does not prove ownership of a drop.
- Do not treat own GE offers as a market-wide stream or a verified GP valuation service.
- Do not promise actual last-login history from a locally observed session start.

Leave a capability matrix in the adapter and add integrations only after a
source-specific test. The baseline website remains useful without any of them.

## Hosted path and permissions

If users need automatic transfer, add a small authenticated ingestion service
using [the hosting plan](HOSTING-PLAN.md). Proposed pairing: a signed-in website
creates a short-lived code; the companion redeems it for a narrowly scoped,
revocable upload credential. These are proposed RuneReturn endpoints, not a
Jagex authentication or pairing service.

Request external HTTP access only when used, declare destination base URLs and
check permission before sending. The SDK documents an optional `trackingAccess`
permission for `Player.GetTrackingID()`. Handle denied permission and delayed/nil
values. Preserve any 64-bit identifier as a decimal string when crossing into
JavaScript/JSON to avoid precision loss. Omit it when unnecessary.
[Plugin permissions](https://developer.runescape.com/rs/core/plugin.html).

Public plugin distribution requires Jagex moderation through its submission
process. Planning/logging are described in the guidelines, but permission-using
and interpreted guidance features can require closer review. Collect only the
current player's supported data; no other-player export or gameplay automation.
Before submission, document transferred fields/destinations, retention, deletion,
contact details and the applicable data-protection case. Choosing a cloud
provider does not settle the region/transfer requirements automatically.
[Guidelines](https://developer.runescape.com/rs/submission/guidelines.html),
[Submission process](https://developer.runescape.com/rs/submission/process.html).

Send only explicit captures, meaningful changes or session summaries. Keep the
latest profile snapshot and necessary journal operations; never upload frame,
logic-tick or inventory-poll streams. Use idempotency, bounded retries and the
local copy during outages. Keep manual features on mobile; Jagex's October FAQ
describes mobile plugins as planned without a confirmed date.
[Official plugin FAQ](https://secure.runescape.com/m=news/runescape-plugins---faq).

## Replacement web API: adapter readiness checklist

Before writing production calls, verify and record all of the following from
official documentation or an authorized developer contract:

1. Exact base URL/version and supported resources.
2. Public versus authenticated visibility and consent/ownership expectations.
3. Browser CORS behavior; whether a backend is actually necessary.
4. Rate limits, caching rules and allowed retention/redistribution.
5. Stable character IDs, field types, timestamps and rename behavior.
6. Missing/private/unranked values and pagination/error semantics.
7. Actual quest, achievement and collection coverage, not assumed RuneMetrics parity.
8. A read-only fixture from a consenting test character and deprecation behavior.

Keep an interface that normalizes confirmed resources into the same observation
model, separate from `rs3-client` and the current `hiscores` adapter. Add only
available fields; the website must tolerate unsupported resources. Do not
silently disable the working hiscores path because a different legacy service
has an announced shutdown.

## Recommended order

1. Keep the simple Home and finish full backup/character-context work.
2. Build the snapshot contract, fixtures and local import preview.
3. Prove skills/quest capture and a permitted transfer mechanism in the real client.
4. Add explicit XP-session receipts, then one validated D&D signal.
5. Add hosted pairing only if users need automatic transfer.
6. Revisit the web adapter when its actual contract is verified; investigate
   collection coverage independently rather than blocking the basic snapshot.
