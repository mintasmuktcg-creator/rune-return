import test from 'node:test';
import assert from 'node:assert/strict';
import { routines } from '../dailyscape-data.js';
import { periodStart, nextReset, activityStatus, estimateReward, cleanJournal, csvLog } from '../dailyscape-core.js';
const activity = id => routines.find(a=>a.id===id);
const log = (activityId,at,extra=false) => ({id:crypto.randomUUID(),activityId,at,extra,undoneAt:null,snapshot:{}});

test('daily, Wednesday weekly and monthly boundaries use UTC across daylight-saving transitions',()=>{
  assert.equal(nextReset('daily',new Date('2026-11-01T23:59:59Z')),'2026-11-02T00:00:00.000Z');
  assert.equal(periodStart('weekly',new Date('2026-11-04T00:00:00Z')),'2026-11-04T00:00:00.000Z');
  assert.equal(nextReset('monthly',new Date('2026-12-31T23:59:59Z')),'2027-01-01T00:00:00.000Z');
});
test('new periods become ready without deleting old completion history',()=>{
  const logs=[log('rs3-herby','2026-10-27T23:59:59.000Z')];
  assert.equal(activityStatus(activity('rs3-herby'),logs,new Date('2026-10-27T23:59:59Z')).done,true);
  assert.equal(activityStatus(activity('rs3-herby'),logs,new Date('2026-10-28T00:00:00Z')).ready,true);
  const monthly=[log('rs3-oyster','2026-10-31T23:59:59.000Z')];
  assert.equal(activityStatus(activity('rs3-oyster'),monthly,new Date('2026-11-01T00:00:00Z')).ready,true);
  assert.equal(logs.length,1);assert.equal(monthly.length,1);
});
test('multiple attempts, membership quotas and reset-token runs stay distinct',()=>{
  const logs=[log('rs3-chinchompa','2026-10-31T10:00:00.000Z')];
  const now=new Date('2026-10-31T15:00:00Z');
  assert.equal(activityStatus(activity('rs3-chinchompa'),logs,now).ready,true);
  logs.push(log('rs3-chinchompa','2026-10-31T11:00:00.000Z'));
  logs.push(log('rs3-chinchompa','2026-10-31T12:00:00.000Z',true));
  assert.equal(activityStatus(activity('rs3-chinchompa'),logs,now).count,2);
  const agoroth=[log('rs3-agoroth','2026-10-31T10:00:00.000Z')];
  assert.equal(activityStatus(activity('rs3-agoroth'),agoroth,now,false).done,true);
  assert.equal(activityStatus(activity('rs3-agoroth'),agoroth,now,true).ready,true);
});
test('personal cooldowns and availability days do not use global weekly resets',()=>{
  const logs=[log('osrs-tears','2026-10-27T14:00:00.000Z')];
  assert.equal(activityStatus(activity('osrs-tears'),logs,new Date('2026-10-28T00:00:00Z')).done,true);
  assert.equal(activityStatus(activity('osrs-tears'),logs,new Date('2026-11-03T00:00:00Z')).ready,true);
  assert.equal(activityStatus(activity('rs3-thalmund'),[],new Date('2026-11-01T12:00:00Z')).ready,false);
  assert.equal(activityStatus(activity('rs3-thalmund'),[],new Date('2026-11-04T12:00:00Z')).ready,true);
  const stock=[log('rs3-cacti','2026-10-27T14:00:00.000Z')];
  assert.equal(activityStatus(activity('rs3-cacti'),stock,new Date('2026-10-28T00:00:00Z')).done,true);
  assert.equal(activityStatus(activity('rs3-cacti'),stock,new Date('2026-11-03T14:00:00Z')).ready,true);
});
test('undo restores eligibility while keeping the original receipt',()=>{
  const entry=log('rs3-herby','2026-10-31T10:00:00.000Z');
  entry.undoneAt='2026-10-31T10:01:00.000Z';
  assert.equal(activityStatus(activity('rs3-herby'),[entry],new Date('2026-10-31T12:00:00Z')).ready,true);
  assert.equal(entry.at,'2026-10-31T10:00:00.000Z');
});
test('XP comparison subtracts active time, preserves negative results and keeps BXP deferred',()=>{
  const estimate=estimateReward({xp:50000,bxp:10000,gp:null,minutes:10,basis:'Test'}, {},100000);
  assert.equal(estimate.savedMinutes,26);
  assert.equal(estimate.gp,null);
  assert.equal(estimate.bxp,10000);
  assert.equal(estimateReward({xp:1000,minutes:10,basis:''},{},100000).savedMinutes,-9.4);
  assert.equal(estimateReward({xp:null,minutes:10,basis:''},{},100000).savedMinutes,null);
});
test('journal sanitization preserves long history and estimate receipts, rejecting corrupt input',()=>{
  const logs=Array.from({length:1200},()=>log('rs3-herby','2026-10-31T10:00:00.000Z'));
  logs[0].snapshot={gp:123,xp:456,minutes:5,rate:100000,basis:'Original assumption'};
  const result=cleanJournal({logs:[...logs,{...logs[0]},log('unknown','2026-10-31T10:00:00.000Z')],rates:{rs3:0,osrs:75000},overrides:{'rs3-herby':{xp:Infinity,gp:-100,note:'New assumption'}},pinned:['unknown','rs3-herby']},routines);
  assert.equal(result.logs.length,1200);
  assert.equal(result.logs[0].snapshot.basis,'Original assumption');
  assert.equal(result.logs[0].snapshot.xp,456);
  assert.equal(result.overrides['rs3-herby'].xp,undefined);
  assert.equal(result.rates.rs3,200000);
  assert.equal(result.rates.osrs,75000);
  assert.deepEqual(result.pinned,['rs3-herby']);
});
test('CSV retains timestamps and quotes notes without spreadsheet formula injection',()=>{
  const entry=log('rs3-herby','2026-10-31T10:00:00.000Z');entry.snapshot={basis:'=SUM(1,2) "test"',gp:5};
  const csv=csvLog([entry],routines);
  assert.ok(csv.includes('2026-10-31T10:00:00.000Z'));
  assert.ok(csv.includes("'=SUM(1,2)"));
  assert.ok(csv.includes('""test""'));
});
test('catalog includes current reset cycles and excludes removed 2026 dailies',()=>{
  assert.equal(new Set(routines.map(a=>a.id)).size,routines.length);
  for(const id of ['rs3-oyster','rs3-statues','rs3-troll','rs3-effigies','rs3-chinchompa','rs3-sinkholes','rs3-herby','rs3-penguins','osrs-tears'])assert.ok(activity(id));
  assert.equal(activity('rs3-cache').cadence,'flexible');
  assert.ok(!routines.some(a=>/vis wax|travelling merchant|wilderness flash event|jack of trades/i.test(a.title)));
  assert.ok(!routines.some(a=>a.game==='osrs'&&a.cadence==='monthly'));
  for(const a of routines){assert.equal(new URL(a.guide).protocol,'https:');assert.ok(['daily','weekly','monthly','flexible'].includes(a.cadence));assert.ok(Number.isFinite(a.minutes));assert.ok(a.basis);}
});
