import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSession } from '../session-core.js';
const candidate=(id,minutes,gp=100,xp=1000,extra={})=>({activity:{id,title:id,kind:'dnd',requirements:'None',summary:'A short activity'},status:{ready:true},eligible:true,pinned:false,value:{minutes,gp,xp},...extra});
test('session plans stay within time and offer no more than three activities',()=>{
  const result=buildSession({candidates:[candidate('a',5),candidate('b',5),candidate('c',5),candidate('d',5)],budget:15});
  assert.equal(result.tasks.length,3);
  assert.equal(result.tasks.reduce((sum,task)=>sum+task.minutes,0),15);
  assert.equal(result.remaining,0);
});
test('plans exclude completed, restricted and over-budget activities',()=>{
  const result=buildSession({candidates:[candidate('done',5,100,1000,{status:{ready:false}}),candidate('locked',5,100,1000,{eligible:false}),candidate('long',20),candidate('ready',5)],budget:15});
  assert.deepEqual(result.tasks.map(task=>task.id),['ready']);
  assert.equal(result.remaining,10);
});
test('GP and XP plans rank known returns and leave unknown GP unset',()=>{
  const candidates=[candidate('low',5,100,500),candidate('high',5,10000,20000),candidate('unknown',5,null,null)];
  assert.deepEqual(buildSession({candidates,budget:15,goal:'gp'}).tasks.map(task=>task.id),['high','low']);
  assert.deepEqual(buildSession({candidates,budget:15,goal:'xp'}).tasks.map(task=>task.id),['high','low']);
});
test('mixed plans reserve a quest-progress block without claiming full quest duration',()=>{
  const result=buildSession({candidates:[candidate('a',5),candidate('b',5)],stories:[{id:'quest',title:'A story'}],budget:30,goal:'mixed'});
  assert.equal(result.tasks.at(-1).type,'story');
  assert.equal(result.tasks.at(-1).minutes,20);
  assert.equal(result.tasks.reduce((sum,task)=>sum+task.minutes,0),30);
  assert.deepEqual(buildSession({candidates:[],stories:[],budget:15,goal:'story'}).tasks,[]);
});
test('pins influence mixed suggestions, and relaxed plans exclude danger',()=>{
  const dangerous=candidate('wild',5,100,1000,{activity:{id:'wild',title:'Wild',kind:'dnd',requirements:'Wilderness PvP',summary:'Danger'}});
  const pinned=candidate('pinned',5,100,1000,{pinned:true});
  assert.equal(buildSession({candidates:[dangerous,pinned],budget:15}).tasks[0].id,'pinned');
  assert.deepEqual(buildSession({candidates:[dangerous,pinned],budget:15,goal:'relaxed'}).tasks.map(task=>task.id),['pinned']);
  assert.throws(()=>buildSession({candidates:[],budget:0}));
});
