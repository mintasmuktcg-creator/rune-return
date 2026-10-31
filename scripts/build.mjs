import { mkdir, cp, writeFile, readFile, rm } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
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
const output = resolve('dist');
if (dirname(output) !== resolve('.') || basename(output) !== 'dist') throw new Error('Refusing to clear a build path outside this project’s dist directory.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });
const bundled = await build({
  entryPoints: ['app.js'], outdir: 'dist/assets', bundle: true, splitting: true,
  format: 'esm', platform: 'browser', target: 'es2022', minify: true,
  entryNames: 'app-[hash]', chunkNames: 'chunks/[name]-[hash]', metafile: true,
  legalComments: 'eof',
  plugins: [{ name: 'public-config', setup(builder) {
    builder.onResolve({ filter: /^\.\/config\.js$/ }, () => ({ path: 'public-config', namespace: 'runereturn' }));
    builder.onLoad({ filter: /.*/, namespace: 'runereturn' }, () => ({ contents: `export const config = ${JSON.stringify(publicConfig)};`, loader: 'js' }));
  } }],
});
const entry = Object.entries(bundled.metafile.outputs).find(([, value]) => value.entryPoint === 'app.js')?.[0];
if (!entry) throw new Error('The browser bundle was not generated.');
let html = (await readFile('index.html', 'utf8')).replace('src="./app.js"', `src="./${entry.replaceAll('\\', '/').replace(/^dist\//, '')}"`);
for (const file of ['styles.css', 'characters.css']) {
  const content = await readFile(file, 'utf8');
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const name = `${file.replace('.css', '')}-${hash}.css`;
  await writeFile(`dist/assets/${name}`, content);
  html = html.replace(`href="./${file}"`, `href="./assets/${name}"`);
}
await writeFile('dist/index.html', html);
await writeFile('dist/.nojekyll', '');
console.log(`Built static site with ${updates.length} sourced discoveries and character support. Output: dist/`);
