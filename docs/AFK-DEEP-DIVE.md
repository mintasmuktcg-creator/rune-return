# AFK methods: creator research and implementation review

Reviewed **November 2, 2026**, for the main versions of OSRS and RS3. This review
expands RuneReturn's existing AFK workspace; it does not create another busy
dashboard or add a paid service.

## What was examined

A bounded crawl captured **221 public pages**: 99 Theoatrix articles, 81 PVME
pages, 33 ArtisanRS pages, four Ironman.guide pages, three Jagex updates and one
RSBANDB transcript. Titles, available dates, headings and warning text were
screened to select relevant material. **Capturing a page does not mean its
methods were reviewed.**

The application now lists **53 creator/community publications**: **49 written
section reviews** and **four video description/chapter indexes**. Those include
Theoatrix, Link'sOcarina, Kaoz OSRS, Qp RS, Silenced, PVME, ArtisanRS and
RSBANDBUpdate!. Some are community publications rather than individual creators.
The three official update reviews are additional mechanics checks.

Full videos were not watched or transcribed. No personal gameplay tests or
independent XP/hour measurements were performed. Video titles, search snippets,
subscriber counts and a “2026” title are insufficient to endorse a setup.

Read the [complete source inventory](research/afk-source-inventory.csv), its
[machine-readable version](research/afk-source-inventory.json), and the
[53-skill coverage matrix](research/AFK-SKILL-COVERAGE.md). The inventory separates
written section reviews, chapter metadata, mechanics references and the remaining
capture/discovery queue. It publishes metadata and original notes, not copied
article bodies or transcripts.

## What changed in RuneReturn

The catalog grew from **148 to 205 route entries**, with **86 entries linked to
reviewed written creator/community discussions**. Multiple tiers of one activity
count as separate entries. Every route retains a Wiki mechanics reference.
All 24 OSRS and 29 RS3 skills remain selectable; this is not complete coverage of
every level, quest, account type or method.

- Added OSRS alternatives for Hunter, Agility, Thieving, Fishing, Herblore,
  Construction, Crafting, Fletching and Smithing.
- Added RS3 Iaia stations, low-level birdhouses, urns, corrected bow tiers,
  Invention stages, Arc resources, Deep Sea Fishing, concentrated gold,
  Runecrafting and advanced Slayer setups.
- Extended Archaeology with sampled excavation hotspots through level 120 and
  a separate return-later research route. This is not a complete collection plan.
- Exposed source publication/revision dates, compatibility notes and official
  patch links. Creator lists stay collapsed, with further sources behind another
  disclosure after the first four.
- Preserved preview levels, game/character isolation, existing route IDs and the
  quiet Home page. No new database, paid API, background job or in-game automation.

## Corrections that mattered

| Finding | Decision | Evidence |
| --- | --- | --- |
| RS3 Fletching guides can contain the former tier table | Use shortbow unlocks 1/10/20/40/50/70/80/90/100 for normal/oak/willow/maple/acadia/yew/magic/elder/eternal magic. Preserve membership distinctions. | [Jagex July 20 patch](https://secure.runescape.com/m=news/patch-notes-mid-game-rebalance) |
| Fort guides may mix active and passive Construction XP | Add a patch warning; do not transplant a pre-rebalance or optimal-hotspot XP quote into AFK estimates. | [Jagex rebalance](https://secure.runescape.com/m=news/mid-game-rebalance-is-live), [housing update](https://secure.runescape.com/m=news/player-owned-housing-rework-out-now) |
| A Hunter creator guide lists Pyre fox at 51 | Use the current creature requirement, **57**; show the conflict on the guide. | [Theoatrix](https://www.theoatrix.net/post/ultimate-1-99-hunter-guide-fastest-profitable-methods), [creature mechanics](https://oldschool.runescape.wiki/w/Pyre_fox) |
| A fishing article places the cave-eel example at 37 | Keep **slimy eels 28** and **cave eels 38** separate. | [Creator discussion](https://www.theoatrix.net/post/best-afk-fishing-spots-in-osrs), [cave eel](https://oldschool.runescape.wiki/w/Raw_cave_eel) |
| RS3 golden-bamboo recommendations disagree | Use current tree unlock **96**. | [Tree mechanics](https://runescape.wiki/w/Golden_Bamboo_(tree)) |
| Invention 27 does not unlock the complete item-level-12 siphoning route | Separate tutorial, early disassembly, item-level-10 training, and the level-60 maximum-item-level discovery. | [PVME basics](https://pvme.io/pvme-guides/invention-and-perks/invention-basics/) |
| A generic Butterfly link was the wrong RS3 page | Link the actual Hunter butterflies and retain their additional Agility requirements. | [Hunter butterflies](https://runescape.wiki/w/Butterfly_(Hunter)) |
| Some boss guides explicitly warn about compatibility | Retain warnings rather than endorse every style or preset. | [PVME Corporeal Beast](https://pvme.io/pvme-guides/afk/afk-corporeal-beast/) |

The capture scan found **22 PVME pages containing “may not work” warnings**.
This is a count of publisher warnings, not 22 independently proven broken
methods. Conversely, an unflagged page is not proof its setup is current.

## OSRS conclusions

**Gathering:** Stars and mature trees are strong long-window research candidates.
Inventory capacity, depletion, movement and client timers still matter. Calcified
rocks and Motherlode are shorter interruption patterns. Fishing now offers
fixed spots, eel processing, ordinary inventory loops and dangerous Wilderness
alternatives separately. A long resource timer alone does not establish how long
the player can leave the keyboard.

**Production:** Cooking, glassblowing, bows, bolt tips, dart tips, tar and repair
kits are useful for players who can restart a batch regularly. Calling these
“15-minute AFK” would misrepresent the interaction. Recipe, storage and banking
time belong in any later benchmark. A profitable output price is insufficient
without the cost of materials and sales friction.

**Agility, Thieving and Hunter:** Treat these as interruption-sensitive. Dungeon
trap setups have unusual construction/access/combat assumptions; Blast Furnace
pedals depend on energy; summer-garden timing still requires repeated manual
runs. Pyre fox and maniacal monkey catches require resets. Birdhouse growth is
a return-later timer, not continuous Hunter training. Wyrm routes remain labelled
active where traversal needs input.

**Combat and Slayer:** Aggression, assignment, prayer, supplies and incoming
damage matter more than the skill number displayed on a card. Crab training does
not establish a ready Nightmare Zone, cannon, venator or Kraken setup. The new
chapter indexes are useful discovery links; their combat footage was not
reviewed, so they do not qualify for the reviewed-method filter.

**Runecrafting and Sailing:** Evaluate the complete loop. Dense-essence gathering
is only part of Zeah Runecrafting; preparation, processing, walking and altar
visits remain active. Salvaging convenience depends on ship, hooks, crew,
sorting/storage and hazards. The app does not convert a headline high-level XP
rate into a beginner expectation.

**Farming and Prayer:** Farm growth belongs in passive scheduling. Offering or
processing bones is a supply-limited batch, with access and equipment checks.
Separate time away from active input and do not assume that every published
method suits an Ironman or restricted account.

## RS3 conclusions

**Dream of Iaia is a useful progression destination, not free unlimited XP.**
The six level-75 stations are now represented with Extinction and access checks.
Camp resources can accumulate offline; training XP is earned while playing and
is limited by stored resources. Unlocking the quest chain is a different problem
from meeting the station's skill level. [Written creator guide](https://artisanrs.com/videos/dream-of-iaia-afk-training/).

**Archaeology needs an unlock plan as well as a hotspot.** Qualification counts,
mysteries, travel equipment, restorations, materials and chronotes can all block
an account with the nominal level. Porters do not solve every inventory problem;
the auto-screener adds component/charge costs and unlock requirements. Research
expeditions are a distinct funded passive route. The new sampled hotspots are
examples for low-attention excavation, not a collection optimizer.
[Creator progression account](https://artisanrs.com/videos/afk-money-machine-episode-7/),
[auto-screener trade-offs](https://artisanrs.com/videos/auto-screener-vs-selling-soil/).

**Mining and Thieving need explicit models.** Depleted-stamina mining differs
from active mining. Stone spirits, juju, porters, tax and bank trips change net
results. Thieving's first-failure window differs from ideal hourly throughput:
boost expiry, inventory, prayer and failure downtime can end a session earlier.
These are good models to learn from, not independently validated output rates.
[Mining model](https://artisanrs.com/tools/stone-spirits/),
[Thieving model](https://artisanrs.com/tools/afk-thieving/).

**Combat convenience is a complete preset.** Slayer milestones 95/105/113/115
do not establish sufficient damage, sustain or safe positioning. Shared PVME
assumptions can include expensive gear, curses, perks and unlocks; individual
guides can override them. The “lower” preset of a boss guide may still be an
advanced setup. A partially updated guide does not validate every style.
[PVME AFK assumptions](https://pvme.io/pvme-guides/afk/afk-overview/).

**New regional content deserves attention.** RS3 birdhouses have short,
tier-dependent cycles; do not reuse OSRS's long birdhouse waits. Havenhythe's
gathering and processing requirements are separate. Exalted essence creates a
Runecrafting batch option from 65, with altar restrictions and input costs.
Colossi gathering plus transport is an active loop, so it was not promoted as
continuous AFK. [Regional overview](https://artisanrs.com/videos/havenhythe-part-ii-overview/),
[birdhouse route](https://artisanrs.com/videos/imcando-hatchet-havenhythe-birdhouses/),
[Colossi guide](https://artisanrs.com/videos/colossi-divination-guide/).

**Passive income and rare drops need honest accounting.** Invention machines
can process while logged out, but funding, generator fuel, later crafting and
sales still need attention. Farm, Kingdom and machine case studies depend on an
account's inventory, unlocks and historical prices. Tavia's unknown map odds do
not yield a defensible expected GP/hour or time-to-drop prediction.
[Machine case study](https://artisanrs.com/videos/afk-money-machine-episode-6/),
[Tavia discussion](https://artisanrs.com/videos/tavias-fishing-rod-red-map/).

## What was not promoted

- Archived “only method” claims contradicted by newer releases, including an
  older Construction article predating shipwright production.
- Outdated tiers, unverified mouse-movement timer claims, and precise XP/GP
  figures lacking a current complete setup.
- Solo Dungeoneering floors, active Colossi travel and Fishing Frenzy as AFK.
- Limited-time Leagues relics or seasonal events as permanent main-game methods.
- Announced future skills/features as currently available content.
- Archived Protoxx/NoLeather videos, Meep272 discovery results or unreviewed
  chapter links as current measured benchmarks.
- Community tables based on maximum levels as personalized low-level advice.

## Remaining work, in priority order

1. **Review complete current videos.** The queue contains Meep272, older Protoxx
   and NoLeather material. Qp RS, Silenced, Link'sOcarina and Kaoz chapter indexes
   need method-by-method setup review. Targeted discovery also checked Maikeru
   and TheRSGuy; no new fully reviewed setup from those libraries was selected.
   This does not mean their libraries were exhausted.
2. **Fill the highest-impact gaps.** OSRS early Runecrafting and combat tiers;
   RS3 deeper core-ore/Smithing tiers, tested combat presets, Summoning's charm
   economy, and complete Archaeology collection/mystery dependencies. The skill
   matrix makes zero creator-linked entries visible rather than implying full
   creator coverage.
3. **Measure real attention.** Record manual interactions, longest safe gap,
   bank trips, supply consumption, deaths/failures and sustained XP over a stated
   session. Distinguish published figures from our own samples. Offer a few
   setup presets rather than interpolate unsupported numbers.
4. **Build a dependency graph.** Add quest/access/gear facts and plan the nearest
   useful unlock. Imported skill levels alone must never imply those facts.
5. **Add realistic GP only with live inputs.** Timestamp the quote, identify
   provider and liquidity, deduct materials/upkeep/tax, preserve losses and keep
   unknown rare-drop rates unknown. Ironman recommendations need separate value
   and supply logic.
6. **Maintain patch-aware editorial review.** Diff reviewed source fingerprints
   and relevant official updates; send changed methods back to review. Never
   automatically overwrite a route from a search result, crawler or LLM summary.

The useful product direction is a planner for **what fits the player's attention
and current account**, with prerequisites to reach a better method. A larger
unqualified list of “best AFK” claims would not solve that problem.

## Reproducing and maintaining the research

```sh
node scripts/research-afk.mjs
node scripts/compile-reviewed-creators.mjs
node scripts/report-afk-research.mjs
npm test
npm run build
```

The crawler uses declared sitemap seeds, bounded selections, timeouts, a local
cache and serial requests within each provider. Captures stay under ignored
`artifacts/`; the app, build and CI never run the crawl. A rerun can discover
changed pages, so the original 221-page count is a dated audit, not a permanent
guarantee about future sitemap sizes. Compilation requires local captures plus
the explicit decisions in `research/afk-reviewed-publications.json`. Generated
browser source metadata is committed, so normal builds need no research files
from the network. Source maintenance requires editorial review before promotion.
