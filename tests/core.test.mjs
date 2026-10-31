import test from 'node:test';
import assert from 'node:assert/strict';
import { updates, routines, catalog } from '../data.js';
import { filterUpdates, routinePeriod, validDate, cleanState, isEnded, escapeHtml } from '../core.js';
const base = { game: 'osrs', since: '2026-07-01', today: '2026-10-30' };
test('last-played boundary excludes that day, and future releases stay hidden', () => {
  const items = [updates[0], { ...updates[0], id: 'same', date: base.since }, { ...updates[0], id: 'future', date: '2027-01-01' }];
  assert.deepEqual(filterUpdates(items, base).map(i => i.id), [updates[0].id]);
});
test('games do not bleed across results', () => {
  for (const game of ['osrs', 'rs3']) assert.ok(filterUpdates(updates, { ...base, game }).every(i => i.game === game));
});
test('ended events are hidden by default and explicitly available in history', () => {
  const opts = { ...base, game: 'rs3' };
  assert.ok(!filterUpdates(updates, opts).some(i => i.id === 'rs3-equilibrium'));
  assert.ok(filterUpdates(updates, { ...opts, includeEnded: true }).some(i => i.id === 'rs3-equilibrium'));
  assert.equal(isEnded({ endDate: base.today }, base.today), true);
});
test('saved list survives date changes and keeps ended events labelled', () => {
  const result = filterUpdates(updates, { ...base, game: 'rs3', since: '2026-10-29', view: 'plan', saved: ['rs3-equilibrium'] });
  assert.deepEqual(result.map(i => i.id), ['rs3-equilibrium']);
});
test('category, reward search and completion filters compose', () => {
  const opts = { ...base, category: 'drops', query: 'hallowfell' };
  assert.deepEqual(filterUpdates(updates, opts).map(i => i.id), ['osrs-mad-angel']);
  assert.equal(filterUpdates(updates, { ...opts, hideDone: true, completed: ['osrs-mad-angel'] }).length, 0);
});
test('date sorting uses real ISO release order', () => {
  const items = filterUpdates(updates, { ...base, sort: 'oldest' });
  assert.deepEqual(items.map(i => i.date), items.map(i => i.date).sort());
});
test('dates reject impossible days and malformed input', () => {
  for (const value of ['2026-02-30', '2026-13-01', '', undefined, '2026-1-01']) assert.equal(validDate(value), false);
  assert.equal(validDate('2024-02-29'), true);
});
test('saved state discards unknown IDs, duplicates and invalid game dates', () => {
  const state = cleanState({ game: 'other', saved: ['bad', updates[0].id, updates[0].id], dates: { rs3: '2099-01-01', osrs: 'invalid' }, routineChecks: { injected: 'manual' } }, updates, routines, catalog.defaultDate, base.today);
  assert.equal(state.game, 'osrs');
  assert.deepEqual(state.saved, [updates[0].id]);
  assert.deepEqual(state.dates, { osrs: '2026-07-01', rs3: '2026-07-01' });
  assert.deepEqual(state.routineChecks, {});
});
test('RS3 weekly period changes precisely Wednesday at 00:00 UTC', () => {
  assert.equal(routinePeriod('weekly', new Date('2026-10-27T23:59:59Z')), '2026-10-21');
  assert.equal(routinePeriod('weekly', new Date('2026-10-28T00:00:00Z')), '2026-10-28');
  assert.equal(routinePeriod('weekly', new Date('2026-11-01T15:00:00Z')), '2026-10-28');
});
test('monthly reminders roll over and manual reminders do not', () => {
  assert.equal(routinePeriod('monthly', new Date('2026-11-01T00:00:00Z')), '2026-11');
  assert.equal(routinePeriod('manual', new Date('2026-11-01T00:00:00Z')), 'manual');
});
test('catalog records have unique IDs, sources, real dates and bounded original copy', () => {
  assert.equal(new Set(updates.map(i => i.id)).size, updates.length);
  for (const item of updates) {
    assert.ok(validDate(item.date)); assert.ok(item.date <= catalog.reviewed);
    assert.ok(item.source.startsWith('https://')); assert.ok(item.guide.startsWith('https://'));
    assert.ok(item.summary.length < 400); assert.ok(item.tags.length && item.rewards.length);
  }
});
test('HTML escaping prevents text from becoming markup', () => {
  assert.equal(escapeHtml('<img src="x">&'), '&lt;img src=&quot;x&quot;&gt;&amp;');
});
