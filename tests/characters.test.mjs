import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeName, identity, normalizeHiscores, cleanCharacters, skillMatch } from '../character-core.js';
import { createCharacterService } from '../supabase/functions/_shared/character-service.js';
const character = { game: 'osrs', mode: 'normal', name: 'Test Player' };
const payload = () => ({ name: 'Test Player', skills: ['Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Sailing'].map((name, id) => ({ name, level: name === 'Overall' ? 500 : name === 'Sailing' ? 60 : 80, xp: 100000, rank: 100 + id })), activities: [{ name: 'Boss', rank: -1, score: -1 }] });
test('character names are bounded, normalized and cannot inject URLs', () => {
  assert.equal(normalizeName(' Test__Player '), 'Test Player');
  for (const name of ['<script>', '../', 'x'.repeat(13), '', null, 'a?url=b']) assert.throws(() => normalizeName(name));
  assert.throws(() => identity('__proto__', 'normal', 'Test'));
  assert.throws(() => identity('osrs', 'toString', 'Test'));
});
test('same name remains distinct across game and mode', () => {
  assert.notEqual(identity('osrs', 'normal', 'Test'), identity('rs3', 'normal', 'Test'));
  assert.notEqual(identity('osrs', 'normal', 'Test'), identity('osrs', 'ironman', 'Test'));
  assert.equal(identity('osrs', 'normal', 'TEST'), identity('osrs', 'normal', 'test'));
});
test('hiscores parse names dynamically, normalize aliases and preserve missing values', () => {
  const data = payload(); data.skills[1] = { name: 'Runecraft', level: -1, xp: -1, rank: -1 };
  const snapshot = normalizeHiscores(data, character);
  assert.equal(snapshot.skills.runecrafting.level, null);
  assert.equal(snapshot.skills.constitution.level, 80);
  assert.equal(snapshot.skills.sailing.level, 60);
  assert.equal(snapshot.activities[0].score, null);
  assert.equal(snapshot.ownership, 'unverified');
  assert.equal(snapshot.questStatus, 'unavailable');
});
test('malformed or partial payload does not become a valid zero-valued profile', () => {
  assert.throws(() => normalizeHiscores({}, character));
  assert.throws(() => normalizeHiscores({ skills: [{ name: 'Overall', level: 0 }], activities: [] }, character));
});
test('stored profiles discard duplicate identities and mismatched snapshots', () => {
  const snapshot = normalizeHiscores(payload(), character);
  const rows = cleanCharacters([{ ...character, id: 'one', snapshot }, { ...character, id: 'two', name: 'TEST PLAYER', snapshot }, { ...character, id: 'three', name: 'Other', snapshot }]);
  assert.equal(rows.length, 2);
  assert.ok(rows[0].snapshot);
  assert.equal(rows[1].snapshot, null);
});
test('skill matching distinguishes missing, stale, met and training without asserting quest eligibility', () => {
  const now = Date.parse('2026-10-31T12:00:00Z');
  const snapshot = normalizeHiscores(payload(), { ...character, fetchedAt: new Date(now).toISOString() });
  assert.equal(skillMatch({ sailing: 62 }, snapshot, now).status, 'training');
  assert.equal(skillMatch({ sailing: 60 }, snapshot, now).status, 'met');
  assert.equal(skillMatch({ crafting: 50 }, snapshot, now).status, 'unknown');
  assert.equal(skillMatch(null, snapshot, now).status, 'unknown');
  assert.equal(skillMatch({ sailing: 60 }, snapshot, now + 86400001).status, 'stale');
});
test('service caches and coalesces exact game/mode/name lookups', async () => {
  let calls = 0, time = Date.now();
  const service = createCharacterService({ now: () => time, fetcher: async url => { calls++; assert.ok(url.href.startsWith('https://secure.runescape.com/')); return Response.json(payload()); } });
  await Promise.all([service(character), service(character)]); assert.equal(calls, 1);
  await service(character); assert.equal(calls, 1);
  await service({ ...character, mode: 'ironman' }); assert.equal(calls, 2);
  time += 300001; await service(character); assert.equal(calls, 3);
});
test('service returns a clear not-ranked error and never invents a snapshot', async () => {
  const service = createCharacterService({ fetcher: async () => new Response('', { status: 404 }) });
  await assert.rejects(service(character), error => error.status === 404 && error.message.includes('not found'));
});
test('service rejects malformed, oversized and failed upstream responses', async () => {
  for (const response of [new Response('invalid'), new Response('x'.repeat(250001)), new Response('', { status: 503 })]) {
    const service = createCharacterService({ fetcher: async () => response });
    await assert.rejects(service(character));
  }
});
