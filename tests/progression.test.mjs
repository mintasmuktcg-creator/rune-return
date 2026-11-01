import test from 'node:test';import assert from 'node:assert/strict';
import { progressionNodes,moneyMethods } from '../progression-data.js';
import { cleanProgression,defaultProgression,knownSkills,evaluateNode,buildProgression,gpEstimate } from '../progression-core.js';
import { normalizeProgressionObservation } from '../progression-adapters.js';
const node=id=>progressionNodes.find(n=>n.id===id);
test('unknown requirements never become confirmed eligibility',()=>{
  const p=defaultProgression('osrs');const status=evaluateNode(node('osrs-gp-flax'),p,{});
  assert.equal(status.status,'unknown');assert.ok(status.reasons.some(r=>r.skill==='crafting'));assert.ok(status.reasons.some(r=>r.text.includes('capital')));
  p.manualSkills={crafting:1};assert.equal(evaluateNode(node('osrs-gp-flax'),p,p.manualSkills).status,'blocked');
});
test('known blocked prerequisites produce the next unfinished ancestor of a chosen route',()=>{
  const p=defaultProgression('rs3');p.target='rs3-rune-mythos';p.path='quests';
  assert.equal(buildProgression(p).next.node.id,'rs3-necromancy');
  p.completed=['rs3-necromancy'];p.manualSkills={necromancy:10};p.membership='members';
  const result=buildProgression(p);assert.equal(result.next.node.id,'rs3-rune-mythos');assert.equal(result.next.status,'blocked');assert.ok(result.next.reasons.some(r=>r.target===24));
});
test('public stats expire; explicit manual levels override only their skill',()=>{
  const p=defaultProgression('osrs');p.manualSkills={mining:25};const now=Date.parse('2026-11-01T12:00:00Z');
  const snapshot={game:'osrs',fetchedAt:'2026-11-01T11:00:00Z',skills:{mining:{level:99},crafting:{level:50}}};
  assert.deepEqual(knownSkills(p,snapshot,now).skills,{mining:25,crafting:50});
  assert.deepEqual(knownSkills(p,{...snapshot,fetchedAt:'2026-10-01T00:00:00Z'},now).skills,{mining:25});
});
test('level bands change the sourced RS3 mining scenario without fabricating higher-level rates',()=>{
  const p=defaultProgression('rs3');const n=node('rs3-gp-iron');
  const low=gpEstimate(n,p,{mining:10}),high=gpEstimate(n,p,{mining:50}),max=gpEstimate(n,p,{mining:120});
  assert.equal(low.scenario[0],294*505);assert.equal(high.scenario[0],1192*505);assert.deepEqual(max.scenario,high.scenario);
  assert.equal(gpEstimate(n,p,{}).scenario,null);
});
test('GP calculation deducts inputs and preserves losses; personal samples are not source benchmarks',()=>{
  const p=defaultProgression('osrs');const n=node('osrs-gp-cannonballs');
  assert.deepEqual(gpEstimate(n,p,{smithing:35}).scenario,[151200,168000]);
  p.priceOverrides['osrs-cannonballs']={netSale:400,inputCost:520};assert.ok(gpEstimate(n,p,{smithing:35}).scenario[1]<0);
  p.samples['osrs-cannonballs']=[{units:100,minutes:10,level:35},{units:120,minutes:10,level:35},{units:110,minutes:10,level:35}];
  const value=gpEstimate(n,p,{smithing:35});assert.equal(value.personal.count,3);assert.equal(value.personal.median,660*-120);assert.equal(value.personal.sameLevel,true);
});
test('Ironman accounts do not get GE-trading eligibility from high levels',()=>{
  const p=defaultProgression('osrs');p.membership='members';p.bankroll=100000;p.facts={'flax-route':true};
  assert.equal(evaluateNode(node('osrs-gp-flax'),p,{crafting:99},'ironman').status,'blocked');
  assert.equal(evaluateNode(node('osrs-gp-flax'),p,{crafting:99},'normal').status,'ready');
});
test('GP paths prefer a nearby unknown setup over a known blocked high-level method, and reject losses',()=>{
  const p=defaultProgression('osrs');p.path='gp';p.membership='f2p';p.bankroll=20000;p.manualSkills={crafting:10};
  assert.equal(buildProgression(p).next.node.id,'osrs-gp-flax');p.facts['flax-route']=true;
  assert.equal(buildProgression(p).next.status,'ready');p.priceOverrides['osrs-flax']={netSale:1,inputCost:10};
  assert.equal(buildProgression(p).all.find(row=>row.node.id==='osrs-gp-flax').status,'blocked');
});
test('skill goals complete from known levels, not from missing data or a default level one',()=>{
  const p=defaultProgression('osrs');p.path='skills';p.skill='mining';p.targetLevel=50;
  assert.equal(buildProgression(p).next.status,'unknown');p.manualSkills.mining=40;assert.equal(buildProgression(p).next.status,'ready');p.manualSkills.mining=50;
  assert.equal(buildProgression(p).selected[0].status,'done');
});
test('profile sanitization keeps both-game scopes and excludes unknown ids/invalid numeric values',()=>{
  const p=cleanProgression({path:'gp',manualSkills:{mining:50,necromancy:120},bankroll:Infinity,completed:['rs3-necromancy','osrs-cooks-assistant'],facts:{'flax-route':true,invalid:true}},'osrs');
  assert.deepEqual(p.manualSkills,{mining:50});assert.equal(p.bankroll,null);assert.deepEqual(p.completed,['osrs-cooks-assistant']);assert.deepEqual(p.facts,{'flax-route':true});
});
test('normalized API observations preserve unavailable data and 64-bit identifiers as strings',()=>{
  const result=normalizeProgressionObservation({schema:'runereturn.rs3.snapshot.v1',game:'rs3',captured_at_utc:'2026-11-01T12:00:00Z',tracking_id:'18446744073709551615',skills:{mining:{level:50,xp:12345},magic:{level:null}},quests:[{config_id:493,state:'complete'},{config_id:999,state:'unknown'}]});
  assert.equal(result.trackingId,'18446744073709551615');assert.equal(result.skills.magic,undefined);assert.equal(result.quests.length,2);assert.equal(result.capabilities.quests,'present');
  assert.throws(()=>normalizeProgressionObservation({schema:'guessed-jagex-api',game:'rs3'}));
});
test('reviewed graph has valid references, no cycles and source URLs for each node',()=>{
  assert.equal(new Set(progressionNodes.map(n=>n.id)).size,progressionNodes.length);
  function visit(n,stack=[]){assert.ok(!stack.includes(n.id),`Cycle: ${n.id}`);for(const id of n.requires){const dep=node(id);assert.ok(dep);assert.equal(dep.game,n.game);visit(dep,[...stack,n.id]);}}
  for(const n of progressionNodes){visit(n);assert.equal(new URL(n.source).protocol,'https:');if(n.gpMethod)assert.ok(moneyMethods[n.gpMethod]);}
});
