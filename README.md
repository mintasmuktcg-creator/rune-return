# RuneReturn

A free, static returning-player companion for Old School RuneScape and RuneScape 3.
Choose when you last played, explore additions since then, and keep a small list
of adventures to try. The starting date is **July 1, 2026** for both games.

## Run locally

Node.js 22 or newer. Install the dependencies once. Browsing and local character
imports need no API keys or database. Optional cloud accounts need a separate
Supabase project; see [account setup](SETUP-ACCOUNTS.md).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5180. Use `PORT` to choose another port.

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

## Free hosting on GitHub Pages

1. Create a **public** GitHub repository, for example `rune-return`.
2. Push this project to its `main` branch, including `.github/workflows/pages.yml`.
3. In the repository, open **Settings → Pages → Build and deployment → Source**
   and select **GitHub Actions**.
4. Run the **Publish RuneReturn to GitHub Pages** workflow (or push to `main`).
5. Open the URL reported by the deploy job: typically
   `https://YOUR-USERNAME.github.io/rune-return/`.

The build bundles the public application into versioned JavaScript/CSS assets in
`dist/` so browser caches pick up deployments. Tests, tooling and repository
metadata are not published. Relative asset paths support project
subdirectories without a custom domain or routing configuration. GitHub Pages
supports public repositories on GitHub Free. See the
[official Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
No deployment has been made by creating this project locally.

## What works

- Separate OSRS/RS3 last-played dates with browser-local persistence.
- Category, text, completion and release-date filters, plus chronological sorting.
- Sourced adventure details: first step, prerequisites, reward goals and guide.
- Save adventures, mark explored, export a Markdown checklist across both games.
- D&D/evergreen reminders in a separate view. RS3 weekly reminders roll over on
  Wednesday 00:00 UTC and monthly reminders on the first. OSRS reminders are
  manual because eligibility can depend on the individual account's last visit.
- Ended events hidden from discovery by default, retained and labelled in saved
  lists and optional historical views.
- Public OSRS/RS3 character imports, skills/XP/reported hiscores activities and
  separate adventure lists per character. A public name lookup is not proof of
  ownership; no game passwords are requested.
- Optional Supabase email sign-in and owner-scoped cloud character storage,
  awaiting configuration of a new project. Guest profile import is explicit.
- Source-mapped skill comparisons; missing prerequisites and quest completion
  remain unknown. Local imports use a read-only proxy; hosted imports need the
  authenticated Edge Function.
- Responsive layout, keyboard-operable modals, reduced-motion support, no external
  fonts or trackers. The Supabase browser SDK is bundled locally during build.

## Data and limitations

This catalog includes **89 curated discoveries and 414 dated update posts from
January 2023–October 2026**, reviewed October 31, 2026. Earlier dates show a
coverage notice. Later visits show that newer content may not yet be indexed.
Highlights and update-post counts are separate: posts include patches, beta
notices and expired events, not just newly playable additions. The archive follows
the game, date and text search, with 25 posts displayed at a time. Refresh its
static index with `npm run data:refresh-archive -- YYYY-MM-DD` after reviewing the
cutoff; the script makes two Wiki API requests. Editorial highlights remain
manually maintained in `history.js` and `data.js`. No database or runtime feed is required.
Upcoming announcements are not mixed into released content. A release date must
be confirmed; where only an announcement is available, `dateNote` explains that
the date is an availability reference. Event `endDate` is conservative/exclusive:
the event is hidden starting on that UTC date rather than promising playtime
after an unspecified shutdown time.

An entry may be a feature, quest, boss or activity within one release, so counts
refer to discoveries rather than unique patch days. Tags overlap. Suggested
starting points use editorial priority. Selected character stats can be compared
with the small set of mapped skill requirements; quest sync is not connected.
These comparisons do not establish complete eligibility. Rare drops are
goals, never guaranteed outcomes or quoted odds. Reward names are spoilers.

Each `data.js` record has its own source and guide links. Summaries and art are
original; no full news articles or wiki text are copied. A few evergreen routines
are included separately and are not counted as new content. This app never
collects a RuneScape password, makes game actions or reads account activity.
Browser data is specific to the current origin/device and can disappear when
browser storage is cleared. Export your plan if you want a portable copy.

## Adding content

Edit `data.js` to add a record with a unique stable ID, game, confirmed ISO release
date, tags, original short summary, first step, prerequisite guidance, reward
names and source/guide URLs. Reuse the category IDs already listed. Confirm the
release itself, not just a roadmap or poll. Add `endDate` to temporary events.
Update `catalog.reviewed` only after checking the catalog. Run the tests/build,
review the result and push. GitHub Actions publishes the new static version.

The next sensible data pipeline is a scheduled news-link inbox (official RSS or
approved wiki access) with human review before adding released entries. Automatic
classification is intentionally absent here: announcements, beta tests, polls
and seasonal repeats otherwise become misleading “new content”.

## Next useful extensions

- Expand the reviewed release catalog and add explicit prerequisite chains.
- Expand the skill-requirement maps and evaluate the replacement RS3 web API
  for quest data, rather than depending on the retiring RuneMetrics API.
- Spoiler controls and a data contribution form backed by GitHub issues.

Independent fan project. RuneScape and Old School RuneScape belong to Jagex.
