import { writeFile } from 'node:fs/promises';
import { parseArchive } from './archive-parser.mjs';
const start = '2023-01-01';
const end = process.argv[2] || '2026-10-31';
if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) throw new Error('Use an ISO cutoff date.');
const entries = [], sources = [];
for (const [game, host] of [['osrs','oldschool.runescape.wiki'],['rs3','runescape.wiki']]) {
  const response = await fetch(`https://${host}/api.php?action=parse&page=Game_updates&prop=text&format=json`, { headers: { 'User-Agent': 'RuneReturn/0.2 (manual returning-player update index)' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${game} archive request failed: ${response.status}`);
  const payload = await response.json();
  const html = payload.parse?.text?.['*'];
  if (typeof html !== 'string') throw new Error(`${game} index format changed.`);
  const rows = parseArchive(html, game, start, end);
  if (rows.length < 100) throw new Error(`${game} index unexpectedly small; existing archive was not overwritten.`);
  entries.push(...rows);
  sources.push({ game, url: `https://${host}/w/Game_updates`, revision: payload.parse.revid || null, count: rows.length });
}
const metadata = { start, reviewed: end, sources };
await writeFile('archive-data.js', `// Date/title/link index only. Original article bodies are not retained.\nexport const archiveMeta = ${JSON.stringify(metadata,null,2)};\nexport const archivePosts = ${JSON.stringify(entries,null,2)};\n`);
console.log(JSON.stringify({ reviewed: end, sources }));
