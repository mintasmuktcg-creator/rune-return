# RuneReturn

A free returning-player companion for **Old School RuneScape and RuneScape 3**.
Find what changed, plan a short session and track the routines you choose.

**Primary direction:** an account-aware progression companion ready to integrate
the new official API when its contract is verified. The first `Your path`
workspace now offers seven goal lanes, prerequisite routes, explicit blockers
and setup-aware GP scenarios. See the [progression launch plan](docs/PROGRESSION-LAUNCH-PLAN.md).
Current progression coverage is a small starter graph (22 nodes, six GP methods),
not a complete game-wide optimizer or collection-log importer.

**[Open the live site](https://mintasmuktcg-creator.github.io/rune-return/?view=home)** ·
**[Documentation](docs/README.md)** ·
**[Roadmap](docs/ROADMAP.md)** ·
**[Site review](docs/SITE-REVIEW.md)**

This README describes the application reviewed on **November 1, 2026**.
Future work is labelled in the linked plans; documentation is not a claim that
accounts, actual-reward tracking or journal cloud sync are already live.

## What is available

- A quiet Home with three choices: catch up, choose a progression path, or DailyScape.
- Seven progression lanes, prerequisite routes, manual unlock checks and setup-aware GP scenarios.
- Separate OSRS/RS3 last-played dates, searchable highlights and a dated update archive.
- Session suggestions for 15, 30 or 60 minutes, with at most three activities.
- DailyScape frequency/type/status filters, pins and six cards shown at a time.
- Completion timestamps, undo history and estimates captured when marked complete.
- Editable GP/XP/BXP/time assumptions, plus CSV export and JSON journal backup/merge.
- Saved adventures, explored markers and a Markdown adventure-list export.
- Local public hiscores imports and character-specific progress. A public name is not proof of ownership.

The game-inspired stone/parchment/gold theme uses local assets, no external
fonts and no installed tracking service. Detailed settings and assumptions are
expandable so the opening screen stays small.

## Current limitations

- Progress is browser-local by default. DailyScape journals are **not cloud-synced**.
- The JSON journal backup does not yet restore all device/character/catch-up data.
- GP values are dated snapshots; variable XP rewards include labelled planning examples.
- Journal values are estimates, not actual earnings. Quest/diary eligibility generally remains unknown.
- DailyScape has only two explicit skill-requirement mappings. The separate progression graph checks its listed requirements; neither is a full game-wide unlock check.
- Cloud sign-in/profile storage and hosted lookup code are prepared, but configuration is blank and live production behavior remains unverified.
- The full archive covers available indexed update posts, not every undocumented game change.

See [the review](docs/SITE-REVIEW.md) for the next improvement priorities and
[the data contract](docs/DATA-AND-ESTIMATES.md) for precise storage/estimate boundaries.

## Run locally

Use **Node.js 22 or newer**. Basic browsing and local public hiscores lookup need
no database or API keys.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5180`. The server binds to loopback; `PORT` selects another port.

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

Stop the development server first when previewing `dist/` on the same port.
The current suite has **50 automated tests**. The November 1 review also checked
live desktop/mobile flows; those manual browser checks are not yet CI tests.

## Hosting and accounts

The site is deployed through [GitHub Actions](.github/workflows/pages.yml) to
[GitHub Pages](https://mintasmuktcg-creator.github.io/rune-return/). Pushes to
`main` run tests/build and publish `dist/`. JS/CSS assets are versioned and
relative paths support the repository subdirectory. Tooling, tests and Markdown
source documentation are not copied into the public app artifact.

- [Free-site runbook](docs/GITHUB-PAGES.md): development, content updates, deployment and rollback.
- [Later hosting plan](docs/HOSTING-PLAN.md): when to add a backend or change hosts, with costs and migration steps.
- [Official API plan](docs/OFFICIAL-API-PLAN.md): verified RS3 client/plugin capabilities and a separate replacement web-API research track.
- [Optional account setup](SETUP-ACCOUNTS.md): activate only a new dedicated RuneReturn Supabase project.

The free version needs no Supabase project. Do not reuse card-platform credentials
or database tables. `config.js` is public browser configuration; server secrets
and passwords never belong in it. Enabling character cloud sync would still not
enable DailyScape journal sync.

## Catalog coverage

| Dataset | Size at this review | Metadata cutoff |
| --- | --- | --- |
| Curated highlights | 89, selected additions from 2023 onward | October 31, 2026 |
| OSRS update posts | 700, from its February 2013 launch | October 31, 2026 |
| RuneScape update posts | 1,536, including Classic/RS2 back to January 2001 | October 31, 2026 |
| DailyScape | 111 activities: 84 RS3 and 27 OSRS | November 1, 2026 |

Highlight counts and post counts are separate. Archive posts can include beta
notices, patches and expired events. DailyScape includes grouped shop routes and
utility allowances; it does not enumerate every tradeable item or training loop.
The default last-played date is July 1, 2026 for both games.

The homepage defaults to Home. Query views are `home`, `catchup`, `dailyscape`
and `saved`; use `game=osrs` or `game=rs3`. Older links with a `since=YYYY-MM-DD`
parameter still open catch-up when no explicit view is supplied.

## Project map

| Files | Responsibility |
| --- | --- |
| `index.html`, `app.js`, stylesheets | Navigation, catch-up views and application shell |
| `home.js`, `session-core.js` | Home and session suggestions |
| `progression*.js` | Goal graph, player facts, setup-aware GP scenarios and provider boundary |
| `data.js`, `history.js`, `archive-data.js` | Highlights and update-post index |
| `dailyscape-data.js`, `dailyscape-core.js`, `dailyscape.js` | Activity catalog, reset/estimate logic and local journal |
| `characters.js`, `character-core.js`, `auth.js` | Public character imports, profiles and optional auth |
| `requirements.js` | Explicit skill mappings; unmapped requirements remain unknown |
| `scripts/` | Build, local server and reviewed archive-refresh tooling |
| `supabase/` | Prepared migration and authenticated lookup function |
| `tests/` | Node tests for state, data, parsing, lookup and planning |
| `docs/` | Review, future plans, maintenance and migration guidance |

## Contributing data

Provide a stable ID, correct game, dated source, original summary and clear
requirements/reward assumptions. Distinguish releases from announcements, index
refreshes from editorial review, and price observations from personalized results.
Retain IDs needed to read existing journals. See [source maintenance](docs/DATA-AND-ESTIMATES.md)
and [the content runbook](docs/GITHUB-PAGES.md) before refreshing catalogs.

Independent fan project. RuneScape and Old School RuneScape belong to Jagex.
No game passwords are collected and the app does not perform in-game actions.
