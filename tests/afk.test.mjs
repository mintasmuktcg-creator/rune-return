import test from 'node:test';
import assert from 'node:assert/strict';
import {afkMethods} from '../afk-data.js';
import {afkSkills,cleanAfkPreferences,buildAfkRoute} from '../afk-core.js';
test('AFK ladders separate games, preserve unknown levels and never assert setup eligibility',()=>{
  const route=buildAfkRoute({game:'osrs',skill:'mining'});
  assert.ok(route.rows.length>=4);assert.ok(route.rows.every(r=>r.method.game==='osrs'&&r.status==='unknown'));assert.equal(route.current.length,0);assert.equal(route.next,null);
  const known=buildAfkRoute({game:'osrs',skill:'mining',level:30,membership:'members'});
  assert.ok(known.current.some(r=>r.method.id==='osrs-motherlode'));assert.ok(known.current.every(r=>r.status==='check-setup'));assert.equal(known.next.method.level,41);
});
test('ranges are suggestions; earlier methods remain visible after the next milestone',()=>{
  const route=buildAfkRoute({game:'osrs',skill:'woodcutting',level:90,membership:'members'});
  assert.ok(route.current.some(r=>r.method.id==='osrs-redwood'));
  const oak=route.rows.find(r=>r.method.id==='osrs-oak');assert.equal(oak.status,'check-setup');assert.equal(oak.inRange,false);
});
test('membership, F2P skill caps and secondary skills prevent misleading current options',()=>{
  assert.ok(buildAfkRoute({game:'rs3',skill:'runecrafting',level:70,membership:'f2p'}).rows.find(r=>r.method.level===66).status==='locked');
  const harps=buildAfkRoute({game:'rs3',skill:'crafting',level:80,skills:{construction:60},membership:'members'});assert.equal(harps.current.length,0);assert.equal(harps.rows[0].status,'locked');
  const missing=buildAfkRoute({game:'rs3',skill:'crafting',level:80,membership:'members'});assert.ok(missing.rows[0].reasons.some(r=>r.includes('unknown')));assert.equal(missing.rows[0].status,'check-setup');
  const archaeology=buildAfkRoute({game:'rs3',skill:'archaeology',level:21,access:'f2p'});assert.equal(archaeology.current.length,0);assert.ok(archaeology.rows.at(-1).reasons.some(r=>r.includes('capped')));
});
test('attention and access filters compose without claiming the remaining options are optimal',()=>{
  const stars=buildAfkRoute({game:'osrs',skill:'mining',level:60,access:'f2p',attention:'long'});assert.deepEqual(stars.rows.map(r=>r.method.id),['osrs-stars']);
  assert.equal(buildAfkRoute({game:'rs3',skill:'mining',level:90,attention:'batch'}).rows.length,0);
});
test('AFK preferences bound levels and reject skills from the wrong game',()=>{
  assert.equal(cleanAfkPreferences({skill:'archaeology',level:120},'osrs').skill,'mining');assert.equal(cleanAfkPreferences({level:120},'osrs').level,null);
  assert.equal(cleanAfkPreferences({skill:'archaeology',level:120},'rs3').level,120);assert.ok(!afkSkills('osrs').includes('archaeology'));
});
test('AFK catalog has unique stable ids, valid ranges and dated sources',()=>{
  assert.equal(new Set(afkMethods.map(m=>m.id)).size,afkMethods.length);
  for(const m of afkMethods){assert.ok(m.level>=1&&m.until>=m.level&&m.until<=120,m.id);assert.ok(['long','variable','batch'].includes(m.attention));assert.ok(m.window&&m.requirements&&m.notes);assert.match(m.reviewed,/^\d{4}-\d{2}-\d{2}$/);const url=new URL(m.source);assert.equal(url.protocol,'https:');assert.equal(url.hostname,m.game==='osrs'?'oldschool.runescape.wiki':'runescape.wiki');}
});
