import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArchive } from '../scripts/archive-parser.mjs';
import { updates, archivePosts } from '../data.js';
import { filterUpdates } from '../core.js';

test('January 2023 returns older content for both games, rather than the starter nine', () => {
  for (const [game, title] of [['osrs', 'Desert Treasure II'], ['rs3', 'Necromancy']]) {
    const older = filterUpdates(updates, { game, since: '2023-01-01', today: '2026-10-31' });
    const recent = filterUpdates(updates, { game, since: '2026-07-01', today: '2026-10-31' });
    assert.ok(older.length > recent.length + 20);
    assert.ok(older.some(item => item.title === title));
    assert.ok(archivePosts.filter(post => post.game === game && post.date > '2023-01-01').length > 150);
  }
});

test('OSRS archive parser follows heading years, bounds, deduplication and update links', () => {
  const html = `<div class="mw-parser-output"><div><h3>2024</h3></div><ul>
    <li><a>29 February</a><a href="/w/Update:Leap">Leap</a></li>
    <li><a>29 February</a><a href="/w/Update:Leap">Duplicate</a></li>
    <li><a>30 February</a><a href="/w/Update:Invalid">Invalid</a></li>
    <li><a>1 March</a><a href="//evil.example/w/Update:Bad">External</a></li>
    </ul><h3>2022</h3><ul><li><a>1 January</a><a href="/w/Update:Old">Old</a></li></ul></div>`;
  const result = parseArchive(html, 'osrs', '2023-01-01', '2024-02-29');
  assert.equal(result.length, 1);
  assert.equal(result[0].date, '2024-02-29');
  assert.equal(result[0].url, 'https://oldschool.runescape.wiki/w/Update:Leap');
  assert.equal(result[0].id, parseArchive(html, 'osrs', '2023-01-01', '2024-02-29')[0].id);
});

test('RS3 archive parser reads full dates from table rows and excludes future posts', () => {
  const html = `<div class="mw-parser-output"><h3>2026</h3><table>
    <tr><td>20 July 2026</td><td><a href="/w/Update:Balance">Update:Balance</a></td></tr>
    <tr><td>1 November 2026</td><td><a href="/w/Update:Future">Update:Future</a></td></tr>
    </table></div>`;
  const result = parseArchive(html, 'rs3', '2023-01-01', '2026-10-31');
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Balance');
  assert.equal(result[0].date, '2026-07-20');
});
