# Automatic content discovery and updates

Added November 3, 2026. **Planned; unattended scraping and publishing are not
enabled.** Extend the existing manual archive refresh and bounded AFK research
scripts to discover content, detect revisions, automatically update eligible
site records and preserve accurate dates and provenance.

## Roadmap and architecture

Build alongside Phase 1 source freshness. Keep the GitHub Pages frontend and
generated static catalogs. A scheduled repository workflow performs ingestion
and publishes through the existing build/deployment pipeline; the first version
needs no application database.

Start with the OSRS/RS3 update indexes and official news, then expand to reviewed
creator/community sources. Prefer feeds, sitemaps and documented read APIs;
extract pages where no appropriate structured interface exists. Each enabled
provider needs an access/attribution policy, parser, request budget and date rules.

## Pipeline

1. **Discover:** proposed daily incremental checks, weekly reconciliation and a
   manual run option. Cache responses, stagger requests and obey provider limits.
   Fetch in the workflow, rather than each time a player opens the site.
2. **Detect:** compare normalized fingerprints and source revision IDs. Ignore
   navigation, ads and formatting changes. Use conditional requests where
   supported; a modification header changing alone is not a content revision.
3. **Normalize:** use stable IDs, explicit game/category, source URLs, date
   evidence and concise original descriptions. Keep discoveries separate from
   accepted catalog entries. Extracted text is data, never workflow instructions.
4. **Validate:** check schemas, duplicate identities, date evidence, game
   isolation, announcement/release status and unusually large changes.
5. **Publish eligible changes automatically:** initially allow approved structured
   archive title/date/link records and verified metadata revisions. Expand field
   coverage only after provider fixtures and a monitored trial pass. Each accepted
   change produces a traceable content commit, tests/build and deployment.
   Unchanged checks produce no content commit or deployment.
6. **Queue uncertain changes:** conflicting unlocks, XP/GP claims, combat
   presets, unclear dates, new providers and generated recommendations need
   review. Other eligible changes can still publish. Show a changed guide's new
   source date and pending-review status while retaining its last reviewed
   recommendation and original review date.
7. **Recover:** retain the last good catalog on provider failure, record run
   outcomes, support content-version rollback, prevent overlapping runs and
   avoid recursive workflow triggers.

Define automatic publishing per provider and field. An announcement must not
become a playable release automatically, nor a video description a reviewed setup.

## Date contract

These are proposed shared fields; current catalogs do not all implement them.

| Field | Meaning and retention rule |
| --- | --- |
| `sourcePublishedAt` | Original publication date; preserve across revisions. Corrections require evidence and a revision record. |
| `sourceUpdatedAt` | Publisher's modification date or source revision timestamp. Keep null if unavailable; never substitute scrape time. |
| `firstSeenAt` | First discovery by RuneReturn; set once for a stable source identity. |
| `lastCheckedAt` | Last successful fetch/validation; an outage does not advance it. |
| `changeDetectedAt` | When RuneReturn detected a meaningful revision, including sources with no modification date. |
| `contentUpdatedAt` | Last meaningful accepted change to the site record; unchanged checks and rebuilds do not advance it. |
| `reviewedAt` | Actual review to the stated evidence standard; crawler runs do not advance it. |
| `releasedOn` | Established game-content release date, independent of guide publication or revision. |
| `dateEvidence` | Field-level origin, raw date, precision and timezone evidence: structured metadata, API revision, visible date or manual correction. |

Store actual timestamps in UTC while retaining raw values/offsets. Keep date-only
values date-only; do not invent a timezone or time of day. Track conflicts between
visible and structured dates rather than silently choosing one. Unknown dates
remain unknown.

For revisions, retain the stable ID, original publication date and previous
accepted version. Record changed fields, old/new fingerprints, source revision,
detection time, acceptance basis and publication outcome. Bound revision/log
retention rather than keeping a full daily copy of every article. Retired IDs
and referenced metadata must remain readable by saved plans and journals.

## Player-facing behavior

Use the existing source/details area for **Published**, **Source updated** and
**Reviewed** dates. Show **Change detected; review pending** for an unreviewed
revision. When the source supplies no update date, state that and show our
detection date separately. A routine check must not make an old guide look revised.

Catch-up eligibility continues to use the appropriate game release/post date.
An old quest guide receiving an edit does not make that quest newly released
after the player's return date. An optional recently-updated sort/filter belongs
inside the relevant workspace; keep Home compact.

## Delivery and acceptance

| Stage | Deliverable | Done when |
| --- | --- | --- |
| A | Shared provenance schema and provider registry | Existing dates migrate intact; unknowns stay unknown; stable IDs survive redirects and revisions. |
| B | Scheduled/manual incremental discovery | Runs are idempotent; budgets, timeouts and partial failures preserve the last good catalog. |
| C | Automatic archive/metadata publication pilot | Validated allowlisted changes deploy; future dates, removals, duplicates and parser drift are handled; rollback works. |
| D | Creator revisions and pending-review UI | Original publication/review history survives; conflicts enter review; revisions do not change release eligibility. |
| E | Operational maintenance | Maintainers can explain any update, pause one provider, inspect bounded logs and restore a prior catalog. |

Required fixtures: new article, genuine revision to an old article, metadata-only
timestamp bump, unknown modification date, corrected publication date, failed
fetch, timezone/day boundaries and a guide about content released years earlier.
Prove unchanged checks never reset publication, content-update or review dates.

## Existing foundations

- `scripts/refresh-archive.mjs`: manual archive refresh; remove fixed cutoff
  assumptions before scheduling.
- `scripts/research-afk.mjs`: bounded captures and fingerprints; capture alone
  does not qualify content as reviewed.
- `scripts/compile-reviewed-creators.mjs`: explicit review decisions and dates.
- `scripts/report-afk-research.mjs`: source inventory and evidence states.
- `.github/workflows/pages.yml`: existing build/deployment path.

See [the roadmap](ROADMAP.md), [source maintenance](DATA-AND-ESTIMATES.md) and
[the Pages runbook](GITHUB-PAGES.md). Automated checks and method review remain
separate evidence states.
