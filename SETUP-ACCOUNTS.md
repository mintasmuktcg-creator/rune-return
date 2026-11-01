# Activate RuneReturn accounts

For the broader rollout decision, see the [hosting plan](docs/HOSTING-PLAN.md)
and [data/sync design](docs/DATA-AND-ESTIMATES.md). This guide activates the
prepared character-profile integration; future DailyScape cloud sync remains
a separate, unimplemented project.

The local character importer works now without Supabase. Cloud sign-in is
implemented but intentionally inactive until a **new dedicated RuneReturn**
project is configured. Do not use the card-platform database for this setup.

DailyScape completion journals remain local to each browser and selected
character, even after profile cloud sync is enabled. They are not written into
`rr_characters.progress`. Use the DailyScape JSON backup to preserve or transfer
the complete journal, and CSV for a readable export. No additional database
tables or time-series collection are needed for DailyScape.

## 1. Create the project and private table

Create a Supabase Free project named RuneReturn. In its SQL editor, run the SQL
in `supabase/migrations/202610310001_characters.sql` **once**. This creates one
small table with owner-only row-level policies, a 20-character-per-user cap and
bounded JSON documents. It does not collect a time series or update any existing
card tables. Do not disable row-level security.

The project URL and **public publishable key** are browser configuration. The
service-role key, secret API key and database password must never go in this
repository, GitHub Pages variables or the browser. The frontend and build reject
server keys. No service-role key is required by the application.

## 2. Configure email sign-in

Enable email sign-in. Under Authentication URL configuration, set your Site URL
to the final project URL, for example `https://YOUR-USERNAME.github.io/rune-return/`.
Allow that exact redirect URL and `http://127.0.0.1:5180/` for local development.
If you also test `/index.html`, allow that exact path as well. These paths are
different from the CORS origins in the next step.

The UI sends a passwordless sign-in link, using the SDK's PKCE flow. Open the
link in the same browser that requested it; do not change the default email
template's confirmation URL. The site restores the session and loads only the
signed-in user's rows. It never requests a RuneScape/Jagex password.

Supabase's built-in email sender is restricted to authorized team addresses and
has low limits. It is useful for initial testing, **not general-user email
delivery**. Configure your own SMTP provider before opening email sign-in to
everyone, and review that provider's free limits. No email has been sent as part
of this implementation. See [SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp)
and [redirect URL setup](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. Deploy the read-only character lookup

Run from this project directory with the Supabase CLI. Replace the placeholders:

```sh
npx supabase login
npx supabase secrets set ALLOWED_ORIGINS=https://YOUR-USERNAME.github.io,http://127.0.0.1:5180 --project-ref YOUR_PROJECT_REF
npx supabase functions deploy character-lookup --project-ref YOUR_PROJECT_REF
```

`ALLOWED_ORIGINS` is a comma-separated list of **origins**, with no trailing slash
or repository subpath. Only allow the origins that actually host this site.
The function fails closed if this setting is missing. The CLI bundles the shared
service and `character-core.js` imported from this checkout; deploy from the full
repository, not just a pasted `index.ts`.

The function explicitly verifies the user's JWT with `auth.getUser` against this
project. `verify_jwt = false` in `supabase/config.toml` disables only the gateway's
legacy check, not the function's validation. Requests without a valid signed-in
user are rejected. It only fetches fixed Jagex hiscores endpoints and cannot be
used as an arbitrary URL proxy. No database secret or user token goes to Jagex.

See [Supabase's deployment guide](https://supabase.com/docs/guides/functions/deploy).

## 4. Set public configuration

For the local site, edit `config.js`:

```js
export const config = {
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabasePublishableKey: 'sb_publishable_YOUR_PUBLIC_KEY',
  characterApiUrl: '',
};
```

Leave `characterApiUrl` blank to use `/api/character` on localhost and the project's
`/functions/v1/character-lookup` endpoint when hosted. A custom URL is supported
if needed, but do not point it at an untrusted service: signed-in hosted lookups
send the Supabase access token to that endpoint.

For GitHub Pages, set these **repository Actions variables**:

- `RUNERETURN_SUPABASE_URL`
- `RUNERETURN_SUPABASE_PUBLISHABLE_KEY`
- Optional `RUNERETURN_CHARACTER_API_URL`

The Pages build embeds these public values. It never embeds a server secret.
Run `npm ci`, `npm test` and `npm run build`, then push to deploy.

## 5. Check the real project before launch

- Sign in with a permitted test email and verify the callback session.
- Add one OSRS and one RS3 character; check their fetched times and skills.
- Save an adventure, sign in on a second browser, select that character and check
  that its checklist appears. There is no continuous multi-device live merge;
  the latest successful character save wins. Reload to pull changes from another
  device and avoid editing the same character simultaneously.
- Sign in as another test user and verify the first user's rows cannot be read,
  updated or deleted through the data API. The SQL policies are prepared but have
  **not been applied or integration-tested against a live project yet**.
- Test the Edge Function with a missing/invalid token and an unlisted Origin.
- Sign out and confirm that account characters disappear and the separate device
  profile list returns.

Guest characters are imported into an account only through the explicit import
button. This copies profiles; it does not delete the device originals. Matching
identities are skipped. Remove a character through the UI to remove its cloud row
and device copy from that scope; it does not delete or change the game account.

## Data, limits and freshness

- At most 20 character profiles per account; latest snapshot and checklist only.
- Five-minute bounded memory cache (100 entries), five in-flight upstream lookups
  per server instance; hosted requests limited to 12 per user per minute per
  instance. These are not globally coordinated quotas. Monitor invocation usage
  and use a shared limiter if traffic grows; no uptime or zero-cost guarantee.
- The app refreshes only on add or explicit refresh. No polling or daily jobs.
- Stats older than 24 hours are labelled for refresh before skill comparison.
- The fetched time is not the character's last login or Jagex's observation time.
- Public name association is unverified ownership. It is not Jagex OAuth.
- Hiscores may omit unranked characters or values; missing data is not zero.
- OSRS supports standard, Ironman, Hardcore and Ultimate boards. RS3 currently
  uses the standard public board. Different games and boards have separate IDs.
- Only two source-verified skill requirement maps are included initially;
  unmapped requirements, quests and equipment remain unknown.
- Snapshots and progress can be edited by their owner; do not use them as an
  authoritative proof of achievements or character ownership.
- No RuneMetrics dependency: Jagex announced its old API sunset for November 10,
  2026. Quest sync is not connected. See the [official announcement](https://secure.runescape.com/m=news/the-week-ahead-october-patch-week).

## Verification already completed locally

Automated parser, cache, identity, requirement-matching and prior app tests;
real public OSRS and RS3 imports; mobile layout; per-character browser storage;
and mocked Supabase tests for owner-scoped loads/writes, explicit guest import,
cross-account isolation and sign-out restoration. Mock tests do not establish
live authentication, email delivery, database policy or deployed-function behavior.
