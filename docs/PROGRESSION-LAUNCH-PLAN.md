# Priority one: a progression companion ready for the official API

Direction set November 1, 2026. This supersedes treating RuneReturn primarily as
an update archive. The archive and DailyScape now support the central question:
**given my account, preferences and goal, what is my best useful next step?**

The ambition is a broad companion for new, returning and active players, ready
to integrate the official RS3 web API rapidly. First-to-market is a target, not
something we can guarantee from an unannounced contract or GitHub scheduling.

## Foundation now implemented

- A `Your path` workspace reached from the existing three-choice Home.
- Seven lanes: balanced, skills, quests, collections, GP, bossing and exploration.
- New/returning/active preferences, a specific destination or automatic selection.
- A small prerequisite graph with **22 reviewed starter nodes** across both games.
- Per-character/per-game local preferences, manual skill inputs and fresh hiscores integration.
- Unknown/blocked/ready/done states; no inference of level one or completed quests from absent data.
- Confirmed setup/unlock inputs, membership, risk preference and working capital.
- Skill targets, prerequisite routes and a way to turn a missing skill into a training target.
- Six GP method scenarios with source dates, explicit unit margins and setup assumptions.
- User-measured throughput samples, with implied GP at the selected prices and sample counts.
- A normalized RS3 observation boundary and an unavailable-provider status for the new web API.
- A scheduled, read-only official documentation/news watch and a manual workflow entry point.

These are starter coverage and infrastructure, **not the completed massive
catalog**, full collection-log import, a live API connection or a guarantee of
optimality across all game activities. The new profile export covers progression
preferences only, not a complete device restore. Full recovery remains a launch gate.

## Product contract

The player chooses a path and the app returns:

1. One recommended next action.
2. Why it matches this account and chosen objective.
3. What is known, blocked or still unconfirmed.
4. The prerequisite steps leading to the destination.
5. What that action unlocks and a source/guide.
6. Alternatives behind an expandable control, not another wall of cards.

“Optimal” is relative to the selected objective and verified inputs. A fast quest
point route, an Ironman supply route, a pet hunt and relaxed GP grinding can have
different best answers. The interface must state the coverage and assumptions.

## Recommendation model to expand

Keep a versioned graph with stable IDs for quests, skill milestones, regions,
equipment/unlock goals, encounters, collection targets and money methods.

Each node needs source/review dates, hard versus recommended requirements,
prerequisite edges, rewards/unlocks, membership/mode restrictions, risk,
effort/intensity, method/setup variants and observation coverage. Preserve
retired IDs and record evidence provenance. Recipe/setup details should be
reused rather than copied independently into every recommendation.

Ranking order should remain explainable:

1. Exclude confirmed incompatible modes, locked prerequisites and unacceptable risk.
2. Distinguish unknown data from ready activities.
3. Respect the explicit destination before suggesting unrelated activities.
4. Match the chosen path and available session effort.
5. Use personal measurements where relevant; do not disguise guide examples as measured returns.
6. Expose the reason and meaningful tradeoffs instead of an unexplained score.

The current engine is deterministic starter logic. Future rankings require
calibration and content coverage before being called globally optimal.

## Path-specific expansion

| Path | Required depth before a broad launch |
| --- | --- |
| Skills | Verified methods by level, unlock/gear constraints, per-skill XP tables including Invention, cost/effort options and milestone unlocks |
| Quests/story | Wider prerequisite coverage, started/completed observations, spoiler controls and useful reward routing |
| Collections | Item-level targets and manual progress first; verified imported coverage later; sourced drop probability without “due for a drop” claims |
| GP | More methods at low/mid/high levels, capital and equipment requirements, dated prices/fees, variable costs, realistic throughput and measured confidence |
| Bossing | Learning progression, equipment/unlock checklists and user-supplied kill times; no automated combat instructions |
| Exploration | Area access, transport and useful unlocks linked into quest/skill prerequisites |
| Balanced | Account milestones and chosen preferences, with an explanation of why the next unlock has value |

Possible later lanes are Ironman self-sufficiency, achievement/completionist
goals and routine efficiency. They should reuse the graph rather than create
separate disconnected dashboards.

## GP expectations: realistic means conditional

Skill levels filter methods and select **documented** setup/rate bands. Do not
invent a linear skill-to-income multiplier. The initial RS3 mining scenario
uses published level/pickaxe bands; higher levels beyond the reviewed bands are
not extrapolated. RuneScape and OSRS have different requirements and economics.

Current comparison:

```text
unit margin = proceeds per unit AFTER selling fees - all listed input costs
scenario GP/hour = source throughput for the selected setup × unit margin
measured-pace GP/hour = reported units / active minutes × 60 × unit margin
```

The latter is a price-based projection at a measured pace, not proof of realized
coins earned. Show input cost, working capital, price date, excluded side loot,
sample size and level differences. Preserve negative margins. Do not extrapolate
a daily claim or grow timer into unlimited GP/hour. Add actual realized GP,
costs, death losses and optional rare-loot exclusions before making stronger
personal earnings claims.

Reference sources used for the starter methods:
[OSRS flax](https://oldschool.runescape.wiki/w/Money_making_guide/Spinning_flax_to_bow_strings),
[OSRS iron](https://oldschool.runescape.wiki/w/Money_making_guide/Mining_iron_ore),
[OSRS cannonballs](https://oldschool.runescape.wiki/w/Money_making_guide/Smithing_steel_cannonballs),
[RS3 flax](https://runescape.wiki/w/Money_making_guide/Spinning_flax),
[RS3 iron](https://runescape.wiki/w/Money_making_guide/Mining_iron_ore).
The GP sources were checked November 1, 2026; quotes and setup assumptions can change.

## API launch workstream

Use [the researched API plan](OFFICIAL-API-PLAN.md). The client-plugin API and
replacement web API are separate. The latter adapter remains unavailable until
the endpoint, authentication, CORS, limits, timestamps and resources are verified.

Prepare now:

- Stable provider interfaces and plain normalized observations, independent of UI.
- Fixtures for missing, partial, renamed, unranked, stale and permission-denied data.
- Per-capability state for skills, quests, achievements and collections.
- Explicit observation provenance and snapshot time.
- A feature flag and rollback to manual/hiscores behavior.
- Cross-character isolation and full backup/restore before promoting new imports.
- A production smoke suite and staged release path.

### Official-source watch

`.github/workflows/api-readiness.yml` checks official developer/news pages at
minute 17 each hour and supports manual dispatch. `scripts/check-api-readiness.mjs`
performs two public read requests, compares fingerprints against a checked-in
baseline and lists matching announcement links in the Actions summary. Reports
are retained as artifacts for seven days. It writes no player data, opens no
issues and sends no custom email notifications.

This is a research signal, not a release detector or guaranteed real-time alert.
GitHub schedules can be delayed or disabled by platform rules. Unavailable
sources are reported as unknown, not released. A changed news page can be
unrelated to the web API. The owner must review the report and official contract.
To inspect locally:

```sh
node scripts/check-api-readiness.mjs
```

Use `--set-baseline` only after reviewing a change; it deliberately updates
`docs/api-watch-baseline.json`. Do not automatically advance the baseline and
hide unreviewed changes. Review the Actions page regularly; no automatic
human-facing notification delivery has been configured by this work.

### Release-day target sequence

1. Verify the official release and the exact documented contract. Record links/version.
2. Obtain an authorized consenting test fixture. Confirm missing/private semantics and limits.
3. Implement only supported resources behind the adapter; do not infer collection/quest parity.
4. Run unit/contract tests, a staging import and two-profile isolation/restore checks.
5. Verify setup-aware recommendations on low-, mid- and high-level test accounts.
6. Deploy a clearly scoped beta, with capability coverage and snapshot times visible.
7. Keep manual access and a rollback switch; broaden coverage after real account checks.

Aim for a useful integration on release day if those gates pass. Do not promise
an arbitrary hour count before seeing the contract, expose an unverified API
publicly or enable paid services automatically to chase timing.

## Build order from this foundation

1. Finish reliable full-profile backup/restore and transactional progress storage.
2. Expand and verify graph coverage, beginning with coherent beginner, returning
   and established-player destinations rather than disconnected random entries.
3. Add personal collection targets/counts and actual-result receipts.
4. Add richer, verified skill training and GP methods across level/setup tiers.
5. Build normalized snapshot import preview and test the real client capture path.
6. Integrate the official web adapter when verified, then pilot accounts/sync if needed.

## Launch acceptance

- A new player can find one feasible next action without a wall of settings.
- A returning player can skip confirmed completed content and find new unlocks.
- An active player can choose a particular goal and see the shortest supported prerequisite route.
- Unknown prerequisites never become confirmed access or zero-valued stats.
- GP recommendations explain level, gear, capital, price and throughput assumptions.
- Ironman restrictions, both games and account/profile switches are tested.
- Imported data and self-reported completion remain distinguishable.
- Browser-local data is recoverable and survives a host/domain migration.
- The site remains useful when an API is unavailable or a capability is missing.
- No claim of comprehensive collection-log import or global optimization without demonstrated coverage.
