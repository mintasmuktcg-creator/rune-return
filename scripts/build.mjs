import { mkdir, cp, writeFile } from 'node:fs/promises';
import { updates, catalog } from '../data.js';
import { validDate } from '../core.js';
import './prepare.mjs';
import { config } from '../config.js';
if (!validDate(catalog.reviewed) || !validDate(catalog.coverageStart)) throw new Error('Invalid catalog metadata');
const seen = new Set();
for (const item of updates) {
  if (seen.has(item.id) || !validDate(item.date) || item.date > catalog.reviewed || !['osrs', 'rs3'].includes(item.game)) throw new Error(`Invalid release: ${item.id}`);
  seen.add(item.id);
  for (const field of ['source', 'guide']) {
    const url = new URL(item[field]);
    if (url.protocol !== 'https:' || !['www.jagex.com', 'secure.runescape.com', 'oldschool.runescape.wiki', 'runescape.wiki'].includes(url.hostname)) throw new Error(`Invalid ${field}: ${item.id}`);
  }
}
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'characters.css', 'app.js', 'core.js', 'data.js', 'characters.js', 'character-core.js', 'auth.js', 'requirements.js', 'assets', 'vendor']) await cp(file, `dist/${file}`, { recursive: true });
const publicConfig = {
  supabaseUrl: process.env.RUNERETURN_SUPABASE_URL || config.supabaseUrl,
  supabasePublishableKey: process.env.RUNERETURN_SUPABASE_PUBLISHABLE_KEY || config.supabasePublishableKey,
  characterApiUrl: process.env.RUNERETURN_CHARACTER_API_URL || config.characterApiUrl,
};
if (publicConfig.supabasePublishableKey) {
  const key = publicConfig.supabasePublishableKey;
  let safe = key.startsWith('sb_publishable_');
  if (key.includes('.')) { try { safe = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon'; } catch { safe = false; } }
  if (!safe) throw new Error('Build refused: only public publishable/anon keys may be included in the site.');
}
await writeFile('dist/config.js', `export const config = ${JSON.stringify(publicConfig, null, 2)};\n`);
await writeFile('dist/.nojekyll', '');
console.log(`Built static site with ${updates.length} sourced discoveries and character support. Output: dist/`);
