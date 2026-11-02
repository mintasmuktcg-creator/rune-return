# AFK progression routes

Reviewed November 2, 2026. Open the **AFK** navigation item, choose a game and
skill, then enter a preview level or use the selected character's known level.
The workspace is also directly addressable with `?view=afk&game=osrs` or `game=rs3`.

## Current coverage

The catalog has 148 entries: 76 OSRS and 72 RS3. All 24 OSRS skills and all 29
RS3 skills are selectable. Different tiers/styles of a single activity count as
separate entries, not distinct minigames. Dungeoneering has a sourced limitation
notice rather than an invented regular solo AFK method.

| Game | Included skills |
| --- | --- |
| OSRS | All 24 skills, including Sailing, all combat styles and production skills |
| RS3 | All 29 skills, including Necromancy, Summoning and Invention; Dungeoneering limitation explained |

This is not every AFK method or a complete level-one-to-max guide for every
skill. Archaeology coverage stops at 23; the linked training guide covers later
hotspots. Early tree cutting and fishing are included as low-attention bridges,
with frequent interruptions clearly described rather than long idle claims.

## Recommendations and attention

- Ranges are editorial stepping stones. Minimum unlock level and suggested end
  level are separate; older methods remain visible and useful after a milestone.
- The current range and next listed skill unlock respond to the selected level.
  The next unlock is not a claim that its quests, membership or equipment are ready.
- Long stretches, variable interruptions, short batches, passive/return-later
  methods and active alternatives are separate filterable patterns. Only a
  verified source earns a numeric attention interval. Farming and birdhouse
  waits are not continuous skilling; an active Agility alternative is not AFK.
- Level-qualified cards still say **check setup**. Unknown quests, location
  access and equipment never become automatically confirmed eligibility.
- Membership and explicitly mapped secondary skills can mark a method locked.
  F2P-only filtering means there is an F2P option, which may still require quests.
- No combat survival, profit or maximum-XP guarantee is implied. In particular,
  active core-ore mining rates in RS3 cannot be reused for depleted-stamina AFK.

Most entries deliberately omit XP/hour because a sustained AFK rate for the
specific setup was not verified. The ivy example states its published level and
hatchet assumptions; it is not interpolated into a personal projection. No new
GP quotes or time-to-level calculator are part of this release.

## Character inputs and storage

Fresh public hiscores (at most 24 hours old) and manual levels already entered
in Your path locate the account on a route. Manual profile levels override that
skill's imported level. A separate AFK preview never overwrites character stats.
Changing skill clears the preview to avoid carrying an unrelated skill level.

AFK skill, preview level, access and attention preferences are local-only, scoped
by owner/character and game at `runereturn.afk.v1.<profile-key>.<game>`. They are
not cloud-synced and are not included in existing DailyScape/progression exports.
Malformed stored preferences are preserved, with session-only changes. The app
does not poll the game, automate clicks or create reminder notifications.

## Sources and maintenance

Every catalog entry has its own Wiki link and review date. Primary method pages
and skill guides were checked through the Wikis' public read API and indexed
pages; original summaries are maintained in `afk-data.js`. Research captures
under ignored `artifacts/afk-research/` are development evidence, not published
source datasets. The expansion checked 86 distinct method-source URLs. Useful starting references:

- [OSRS Shooting Stars](https://oldschool.runescape.wiki/w/Shooting_Stars)
- [OSRS Woodcutting training](https://oldschool.runescape.wiki/w/Pay-to-play_Woodcutting_training)
- [OSRS Fishing training](https://oldschool.runescape.wiki/w/Pay-to-play_Fishing_training)
- [RS3 Seren stones](https://runescape.wiki/w/Seren_stones)
- [RS3 Runespan](https://runescape.wiki/w/Runespan)
- [RS3 Fishing training](https://runescape.wiki/w/Pay-to-play_Fishing_training)
- [RS3 Archaeology training](https://runescape.wiki/w/Archaeology_training)

Creator/community references, evidence states, chapter links and five newer
catalog additions are documented in [Creator methods](CREATOR-METHODS.md).
The creator filter only includes reviewed method-specific associations; video
chapter discovery links alone do not qualify.

Check current unlocks rather than copying old guides: RS3 oaks/willows now unlock
at 10/20, while OSRS uses 15/30. The reviewed RS3 Seren-stone requirement is 89.

Next expansion should prioritize later Archaeology routes, deeper combat tiers
with tested gear/sustain assumptions, and measured level/setup-specific XP
samples. Keep method availability separate
from preference ranking and verified account access.

## Validation

Nine unit tests cover game separation, level ranges, filters, membership,
secondary skills, F2P caps, all-skill coverage, preference validation and catalog integrity. Browser
checks cover saved preferences, game/profile isolation, imported/manual/stale
levels, all 53 skill selections, navigation, and 320/390/768/1024px layouts. Browser checks are currently
manual development checks, not a new CI browser job.
