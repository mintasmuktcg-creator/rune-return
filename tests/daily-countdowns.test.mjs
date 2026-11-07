import test from 'node:test';
import assert from 'node:assert/strict';
import {formatCountdown,activityTimer,activityStatus,nextReset} from '../dailyscape-core.js';
import {routines} from '../dailyscape-data.js';
const activity=id=>routines.find(a=>a.id===id);

test('live countdowns retain seconds, days and exact boundaries without negative time',()=>{
  const now=new Date('2026-11-07T23:59:58Z');
  assert.equal(formatCountdown(nextReset('daily',now),now),'00:00:02');
  assert.equal(formatCountdown('2026-11-09T01:02:03Z',now),'1d 01:02:05');
  assert.equal(formatCountdown(now.toISOString(),now),'00:00:00');
  assert.equal(formatCountdown('2026-11-01T00:00:00Z',now),'00:00:00');
  assert.equal(formatCountdown(null,now),null);assert.equal(formatCountdown('invalid',now),null);
});
test('daily weekly and monthly timers advance at UTC reset including leap years',()=>{
  for(const [id,boundary]of [['rs3-challenges','2026-11-08T00:00:00Z'],['rs3-herby','2026-11-11T00:00:00Z'],['rs3-oyster','2028-03-01T00:00:00Z']]){
    const a=activity(id),before=new Date(Date.parse(boundary)-1000),logs=[{activityId:id,at:before.toISOString()}];
    const timer=activityTimer(a,activityStatus(a,logs,before),before);assert.equal(timer.text,'00:00:01');
    const now=new Date(boundary),status=activityStatus(a,logs,now),next=activityTimer(a,status,now);
    assert.equal(status.count,0);assert.ok(Date.parse(next.target)>now.getTime());assert.notEqual(next.text,'00:00:00');assert.equal(logs.length,1);
  }
  const leap=new Date('2028-02-28T00:00:00Z');assert.equal(formatCountdown(nextReset('monthly',leap),leap),'2d 00:00:00');
});
test('personal cooldown timers need a log and become ready without adopting a global weekly reset',()=>{
  const a=activity('osrs-tears'),now=new Date('2026-11-10T23:59:59Z');
  const empty=activityTimer(a,activityStatus(a,[],now),now);assert.equal(empty.target,null);assert.match(empty.text,/Log a completion/);
  const logs=[{activityId:a.id,at:'2026-11-04T14:30:00Z'}];
  const timer=activityTimer(a,activityStatus(a,logs,now),now);assert.equal(timer.target,'2026-11-11T00:00:00.000Z');assert.equal(timer.text,'00:00:01');
  const after=new Date('2026-11-11T00:00:00Z');assert.equal(activityTimer(a,activityStatus(a,logs,after),after).text,'Ready to check');
  const stock=activity('rs3-cacti'),status=activityStatus(stock,[{activityId:stock.id,at:'2026-11-04T14:30:00Z'}],now);
  assert.equal(activityTimer(stock,status,now).target,'2026-11-11T14:30:00.000Z');
});
test('restricted availability days and repeatable activities do not invent a universal reset',()=>{
  const now=new Date('2026-11-08T12:00:00Z'),tip=activity('rs3-barmaid');
  const timer=activityTimer(tip,activityStatus(tip,[],now),now);
  assert.equal(timer.target,'2026-11-11T00:00:00.000Z');assert.equal(timer.availableAt,'2026-11-12T00:00:00.000Z');
  const manual=routines.find(a=>a.reset==='manual');assert.equal(activityTimer(manual,activityStatus(manual,[],now),now).text,'Repeatable');
  for(const a of routines){const t=activityTimer(a,activityStatus(a,[],now),now);assert.ok(t.label&&t.text,a.id);if(t.target)assert.ok(Date.parse(t.target)>now.getTime(),a.id);}
});
