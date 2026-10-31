import { writeFile } from 'node:fs/promises';
import { parseArchive } from './archive-parser.mjs';
import { validDate, todayUtc } from '../core.js';
const starts = { osrs: '2013-02-22', rs3: '2001-01-04' };
const end = process.argv[2] || '2026-10-31';
if (!validDate(end) || end < '2026-10-31' || end > todayUtc()) throw new Error('Use a real cutoff date between the existing review date and today.');
const entries = [], sources = [];
for (const [game, host] of [['osrs','oldschool.runescape.wiki'],['rs3','runescape.wiki']]) {
  const response = await fetch(`https://${host}/api.php?action=parse&page=Game_updates&prop=text&format=json`, { headers: { 'User-Agent': 'RuneReturn/0.2 (manual returning-player update index)' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${game} archive request failed: ${response.status}`);
  const payload = await response.json();
  const html = payload.parse?.text?.['*'];
  if (typeof html !== 'string') throw new Error(`${game} index format changed.`);
  const rows = parseArchive(html, game, starts[game], end);
  const expectedYears = Array.from({ length: Number(end.slice(0,4)) - Number(starts[game].slice(0,4)) + 1 }, (_, index) => String(Number(starts[game].slice(0,4)) + index));
  if (rows.length < (game === 'osrs' ? 600 : 1200) || expectedYears.some(year => !rows.some(row => row.date.startsWith(year)))) throw new Error(`${game} index unexpectedly incomplete; existing archive was not overwritten.`);
  entries.push(...rows);
  sources.push({ game, url: `https://${host}/w/Game_updates`, revision: payload.parse.revid || null, count: rows.length });
}
const metadata = { start: starts.rs3, starts, reviewed: end, sources };
await writeFile('archive-data.js', `// Date/title/link index only. Original article bodies are not retained.\nexport const archiveMeta = ${JSON.stringify(metadata,null,2)};\nexport const archivePosts = ${JSON.stringify(entries,null,2)};\n`);
console.log(JSON.stringify({ reviewed: end, sources }));
