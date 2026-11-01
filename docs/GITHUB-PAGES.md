# GitHub Pages: basic version and runbook

Reviewed November 1, 2026. This is the recommended current operating mode.

## Existing deployment

- Repository: [mintasmuktcg-creator/rune-return](https://github.com/mintasmuktcg-creator/rune-return).
- Live site: [RuneReturn](https://mintasmuktcg-creator.github.io/rune-return/).
- Deployment: `.github/workflows/pages.yml`, triggered by a push to `main` or manually.
- Build: Node 22, `npm ci`, `npm test`, `npm run build`.
- Published artifact: `dist/`, with versioned JS/CSS and relative asset paths.
- Route style: query parameters, compatible with the repository subpath.

The site is already hosted. Keeping the frontend here does not require a new
server, database, domain or monthly subscription. That statement assumes the
existing public-repository/free-eligible Pages configuration and usage within
provider limits; it does not cover optional external services.

## What belongs in the free version

| Capability | Implementation direction |
| --- | --- |
| Catch-up history | Static date/title/link indexes and separately reviewed highlights |
| Session planning | Browser-side rules using local preferences, readiness and estimates |
| DailyScape journal | Local transactional storage; timestamps and estimate/actual receipts |
| Goal/unlock preferences | Local user-confirmed facts, with unknown states preserved |
| Backups | Downloadable versioned files; explicit merge/restore |
| Reminders | On-page timers and optional user-created calendar export |
| Corrections | GitHub issues/PRs with sources and review |

The transactional journal, actual rewards, full backup, goal preferences and
calendar export are planned extensions, not already delivered capabilities.
Use [the roadmap](ROADMAP.md) for dependencies and acceptance criteria.

GitHub Pages does not execute the local Node proxy, a server email worker or an
application database. A browser timer cannot guarantee a reminder after the
page is closed. Optional external auth/API services can be used without moving
the frontend, but must have their own deployment and costs.

## Daily development

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5180`. Use an isolated browser profile for destructive
restore tests. A different port/origin has separate browser storage.

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

The last command serves the compiled artifact; stop the development server
first if using the same port. No service credentials are needed for basic use.
The local public hiscores proxy works independently of cloud login.

## Content maintenance

The three review concepts are separate:

1. `archiveMeta.reviewed` is the dated update-index cutoff.
2. `catalog.reviewed` is the editorial highlight review date.
3. `dailyCatalog.reviewed` is the activity/estimate review date; per-value dates
   are a planned improvement, not a field currently maintained on every record.

Refresh the index from the repository root with an explicit reviewed date:

```sh
npm run data:refresh-archive -- 2026-11-01
```

That date is an example from this review, not an automatic instruction to update
the current content. The script currently defaults to October 31, 2026 if the
argument is omitted. Its lower guard is also hard-coded. Both should be
improved before unattended scheduling.

The refresh makes two Wiki API requests, checks expected year coverage and
writes `archive-data.js`. Inspect the diff, removals and earliest/latest dates.
It does not update editorial highlights, activity rules or GP assumptions.
Run tests/build after updating metadata together; do not only change a review
date to suppress the site's stale-content notice.

Proposed cadence: weekly source review, plus a targeted review after relevant
game changes. A future scheduled workflow should open a proposed diff for human
review, rather than automatically label announcements as playable releases.
Keep an identifiable request user agent and respect source access/licensing rules.

## Shipping and rollback

1. Keep a small, reviewable change and run the relevant tests/build.
2. Preview both games and a mobile width. For data changes, inspect empty states
   and the first day after a reset as well as the normal case.
3. Push to `main`; inspect the Publish RuneReturn workflow result.
4. Open the actual Pages URL in a fresh browser and verify the changed behavior.
5. If broken, revert the specific change in Git and redeploy. Do not clear
   users' local storage as a release recovery step.

An application rollback cannot reverse an incompatible storage migration. Future
migrations therefore need a backup, old-reader compatibility where practical
and a separate recovery path. Content corrections must not rewrite completion
receipts or erase records for retired activities.

## Feedback and contribution process

An issue should include game, activity/update, expected behavior, actual
behavior, relevant date/time zone and a supporting source. Use synthetic data
when sharing a journal reproduction. Never request authentication tokens or a
Jagex password. A PR should distinguish editorial corrections from storage or
runtime changes, and list the checks actually run.

## Practical boundaries

GitHub documents a 1 GB published-site limit and a soft 100 GB/month bandwidth
limit. The commercial-use restriction matters before launching paid features:
Pages is not an allowed host for a site primarily providing commercial SaaS or
facilitating commercial transactions. It is a migration trigger, not evidence
that the current free fan project must move now. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

A custom domain alone does not require a dynamic application server. A change
of scheme, host or port does change the browser storage origin: provide export
and restore before cutover. A path-only change on the same origin does not by
itself create a new localStorage origin. See [the hosting migration plan](HOSTING-PLAN.md).
