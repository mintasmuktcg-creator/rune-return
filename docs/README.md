# RuneReturn documentation

Initial review **November 1, 2026**, against application commit `95b939f` and the live
[GitHub Pages site](https://mintasmuktcg-creator.github.io/rune-return/).

The recommendation is to improve trust and usefulness on the existing free
site before paying for a backend. GitHub Pages already hosts the site; the later
decision is whether to add backend services, change the frontend host, or both.

## Reading order

| Document | Use it for |
| --- | --- |
| [Site review](SITE-REVIEW.md) | Findings, evidence, priorities and verification limits |
| [Product roadmap](ROADMAP.md) | What to build next, in order, with completion criteria |
| [Automatic content updates](CONTENT-AUTOMATION-PLAN.md) | Planned scraping, scheduled publication, retained source dates and revision history |
| [DailyScape countdowns](DAILYSCAPE-TIMERS.md) | Live reset clocks, personal cooldowns, availability timers and rollover behavior |
| [Progression and API launch priority](PROGRESSION-LAUNCH-PLAN.md) | The new number-one objective, current foundation and release-day gates |
| [AFK progression routes](AFK-ROUTES.md) | Current level ladders, attention patterns, source coverage and storage boundaries |
| [Creator/community methods](CREATOR-METHODS.md) | Creator credits, dated guides, video chapters and evidence limits |
| [AFK deep dive](AFK-DEEP-DIVE.md) | Research findings, source conflicts, exclusions, all-skill matrix and review queue |
| [GitHub Pages plan and runbook](GITHUB-PAGES.md) | Keep the basic version useful, free and maintainable |
| [Later hosting plan](HOSTING-PLAN.md) | Migration triggers, architecture, costs and rollout |
| [Data and estimates](DATA-AND-ESTIMATES.md) | Sources, reward credibility, local storage and future sync |
| [Official API integration plan](OFFICIAL-API-PLAN.md) | Verified RS3 client capabilities, replacement web-API unknowns and staged integration |
| [Account setup](../SETUP-ACCOUNTS.md) | Existing optional Supabase implementation instructions |

## Current versus planned

**Available:** a starter progression workspace with seven lanes, prerequisite
routes and six setup-aware GP scenarios; simple Home, catch-up/archive browsing, session suggestions,
205 route entries with all 53 game/skill selections, creator guide links and explicit AFK limitations,
DailyScape checklists, dated local journals, editable estimates and DailyScape
CSV/JSON exports. OSRS and RS3 remain separate game contexts.

**Prepared, inactive:** dedicated Supabase character accounts and an
authenticated hosted hiscores lookup. The checked-in public configuration is
blank; a real production account service has not been verified in this review.

**Planned:** actual reward recording, API-backed unlocks, a comprehensive progression catalog, complete profile
backups, reliable cross-device journal sync, notifications and optional paid
features. A document describing a feature does not mean it has been built.

## Keep the product simple

- Home retains three entry points. Add depth inside them rather than new top-level dashboards.
- Show the active game and character without reopening a sidebar of statistics.
- Keep assumptions, advanced filters and settings expandable.
- Support useful play without an account and preserve data portability.
- Record user actions and changed data, rather than polling every character daily.

The roadmap's gates and budget targets are proposals, not measured usage or
approved spending. Provider pricing and policies were checked November 1, 2026;
recheck before activation. This documentation does not provision services,
purchase a domain, enable billing or send email.
