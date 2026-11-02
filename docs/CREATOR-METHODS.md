# Creator and community methods

Added November 2, 2026. Creator publications now participate in AFK discovery and
method sourcing. The app retains mechanical references and separates a reviewed
method section from a video discovered through its description/chapters.

## First source set

| Publication | Author | Publication date | What was reviewed |
| --- | --- | --- | --- |
| [Longest AFK Methods in 2026](https://www.theoatrix.net/post/longest-afk-methods-in-2026-osrs) | Theoatrix | March 3, 2026 in structured metadata; visible page shows March 4 | Written method sections |
| [How to AFK Every Skill in OSRS 2026](https://www.youtube.com/watch?v=wYL1FLs4H8E) | Link’sOcarina | January 31, 2026 | Indexed creator description and chapters; gameplay/setup review pending |
| [Best AFK Skilling Methods for ALL Skills in RuneScape 3](https://www.youtube.com/watch?v=MIznKXVpomM) | Qp RS | April 8, 2026 | Indexed creator description and chapters; gameplay/setup review pending |
| [Abyssal Beasts](https://pvme.io/pvme-guides/slayer/abyssal-beasts/) | PvM Encyclopedia community | Not established | Written setup guide |
| [Abyssal Demons](https://pvme.io/pvme-guides/slayer/abyssal-demons/) | PvM Encyclopedia community | Not established | Written setup guide |

These are five publications from four creator/community identities, not a
complete inventory of RuneScape creators. Checking a source on November 2 does
not mean its author updated it that day. PVME is labelled as a community source,
not attributed to an invented individual author.

## What changed in the application

- A collapsed **Creator guides for this skill** section, with direct links and
  published/check dates. The two videos have chapter mappings across their games.
- Distinct **written section reviewed** and **video chapters / setup pending** states.
- A persistent **Creator/community reviewed** method filter. Only reviewed,
  method-specific associations qualify; a generic video chapter does not.
- Creator/community credits beside the method's mechanical source.
- Five new entries: infected-root extended setup, Stranglewood fishing, Blast
  Furnace pump, fixed-spot cave eels, and PVME's advanced Abyssal Beast setup.
- Ten method-specific source associations, including existing Stars, karambwan,
  magic/redwood trees and RS3 abyssal demons. Catalog total: 148 entries.

The new OSRS entries were identified in Theoatrix's written guide, with access
checked against the individual Wiki pages. Stranglewood's listed 63 is the
ordinary unboosted quest-access route, not the fishing spot's intrinsic level.
The RS3 Beast entry requires 105 Slayer and still directs users to the complete
style-specific loadout. Neither Slayer level nor the label AFK proves safety.

## Evidence and rates

The site does not claim these are personally tested setups. Creator-reported
maximum durations are labelled and conditional on gear, inventory, staffing and
idle settings. Rare-drop examples do not become expected GP/hour. PVME's optimal
XP/kills-per-hour figures were not inserted as personal forecasts.

No full YouTube transcript or gameplay review was completed for the two videos.
Indexed descriptions/chapters support navigation only; they do not prove a
specific method or quantitative claim. No videos, transcripts or thumbnails are
rehosted, and the app uses outbound links rather than loading video embeds.

Source disagreements are not resolved merely by choosing the newer title. For
example, the written OSRS guide describes mouse movement resetting combat idle
timers, while the [Wiki timer reference](https://oldschool.runescape.wiki/w/Idle#Combat_timers)
distinguishes mouse movement from inputs that reset that timer. No mouse-only
combat reset instruction was imported into the app. Test the current behavior
before relying on a long unattended setup.

## Continuing the research

Maintain `creator-sources.js` with stable IDs, author, game, original URL,
publication date (or null), review date and evidence state. Never substitute the
review date for an unknown publication date. Chapter mappings must use published
timestamps, not estimated segments.

Prioritize the newer skill chapters and setup-specific videos. Before adding a
method association, review the actual method section and record:

1. Minimum levels, quest access and account-mode restrictions.
2. Exact gear, ability bar, consumables and optional upgrades.
3. Longest idle interval versus total attention across banking and travel.
4. Whether XP excludes bonus XP/events, and whether GP subtracts costs.
5. Patch compatibility, conflicting claims and what remains untested.

Keep budget and maximum-gear variants separate when their requirements differ.
Do not replace every existing method because one all-skills video exists. The
next research priority is full RS3 video/setup review and more independently
authored alternatives for each skill. Automated creator feeds, transcript
ingestion, alerts and API credentials are not configured by this change.

## Validation

Four additional unit tests cover source metadata, chapter routing, reviewed-only
associations/filtering and preference migration. Browser checks verified source
credits, video evidence labels, persistent filtering, the Slayer gate, and
320/390/768/1024px layouts. The full automated suite has 63 tests.
