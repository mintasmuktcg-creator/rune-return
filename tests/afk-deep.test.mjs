import test from 'node:test';
import assert from 'node:assert/strict';
import {afkMethods} from '../afk-data.js';
import {creatorSources,creatorSource,methodCreatorRefs} from '../creator-sources.js';
import {buildAfkRoute} from '../afk-core.js';
import {readFileSync} from 'node:fs';
const method=id=>afkMethods.find(m=>m.id===id);

test('published inventory keeps evidence distinctions without fetched article bodies',()=>{
  const report=JSON.parse(readFileSync(new URL('../docs/research/afk-source-inventory.json',import.meta.url)));
  assert.equal(report.methods,afkMethods.length);assert.equal(report.creatorSources,creatorSources.length);
  assert.ok(report.sources.some(s=>s.evidence==='captured-not-reviewed'));
  for(const m of afkMethods)for(const id of m.creatorRefs){const source=creatorSource(id);assert.equal(report.sources.find(s=>s.url===source.url)?.evidence,'written-sections-reviewed');}
  for(const s of report.sources){assert.equal(new URL(s.url).protocol,'https:');assert.ok(!Object.hasOwn(s,'text')&&!Object.hasOwn(s,'html')&&!Object.hasOwn(s,'transcript'));}
});

test('RS3 uses the 2026 shortbow tiers and membership without changing OSRS',()=>{
  const bows=afkMethods.filter(m=>m.game==='rs3'&&m.skill==='fletching'&&/shortbow/i.test(m.title));
  for(const [name,level,members] of [['Normal',1,false],['Oak',10,false],['Willow',20,false],['Maple',40,false],['Acadia',50,false],['Yew',70,true],['Magic',80,true],['Elder',90,true]]){
    const row=bows.find(m=>m.title.startsWith(name));assert.equal(row.level,level,name);assert.equal(row.members,members,name);assert.match(row.patchUrl,/secure.runescape.com/);
  }
  assert.equal(method('osrs-bows-20').level,20);
  assert.ok(!buildAfkRoute({game:'rs3',skill:'fletching',access:'f2p'}).rows.some(r=>r.method.title.startsWith('Yew')));
});
test('Invention distinguishes tutorial, destructive training and full siphoning',()=>{
  assert.equal(method('rs3-invention-disassemble').attention,'active');assert.equal(method('rs3-invention-disassemble').until,3);
  assert.equal(method('rs3-invention-early').level,4);assert.match(method('rs3-invention-early').notes,/destroys/);
  assert.equal(method('rs3-invention-siphon').until,59);assert.equal(method('rs3-invention-60').level,60);
  const r=buildAfkRoute({game:'rs3',skill:'invention',level:50,skills:{crafting:80,smithing:80,divination:80}});
  assert.equal(r.rows.find(r=>r.method.id==='rs3-invention-60').status,'locked');
});
test('conflicting creator unlocks are corrected against mechanics and secondary requirements survive',()=>{
  assert.equal(method('osrs-pyre-fox').level,57);assert.match(creatorSource('theo-hunter').compatibilityNote,/57/);
  assert.equal(method('rs3-golden-bamboo').level,96);
  assert.equal(method('osrs-slimy-eels').level,28);assert.equal(method('osrs-cave-eels').level,38);
  assert.equal(method('rs3-butterfly-95').otherSkills.agility,90);
  assert.equal(method('rs3-exalted-essence').level,65);
});
test('finite Iaia training and sampled Archaeology do not claim offline or complete progression',()=>{
  const iaia=afkMethods.filter(m=>m.id.startsWith('rs3-iaia-'));assert.equal(iaia.length,6);
  for(const m of iaia){assert.equal(m.level,75);assert.match(m.requirements,/Extinction/);assert.match(m.notes,/earning station XP requires training/);}
  const arch=buildAfkRoute({game:'rs3',skill:'archaeology',level:115});assert.ok(arch.current.length);assert.ok(arch.current.every(r=>r.status==='check-setup'));assert.match(method('rs3-arch-112').notes,/sampled/);
});
test('source discoveries and publisher warnings cannot silently become reviewed method endorsements',()=>{
  for(const[id,refs]of Object.entries(methodCreatorRefs)){assert.ok(method(id),id);for(const ref of refs){const s=creatorSource(ref);assert.equal(s.review,'written');assert.notEqual(s.compatibility,'needs-recheck');}}
  assert.equal(creatorSource('rsbandb-fort').published,null);assert.equal(creatorSource('rsbandb-fort').recorded,'2026-07-15');
  assert.equal(creatorSource('pvme-corp-warning').compatibility,'needs-recheck');
  assert.equal(creatorSource('kaoz-afk-2026').review,'chapters');
  for(const s of creatorSources)if(s.modified)assert.ok(s.modified<=s.checked,s.id);
});
