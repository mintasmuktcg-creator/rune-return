import { afkMethods } from './afk-data.js';
export function afkSkills(game){return [...new Set(afkMethods.filter(m=>m.game===game).map(m=>m.skill))];}
export function cleanAfkPreferences(raw,game){
  const skills=afkSkills(game),p={skill:skills.includes('mining')?'mining':skills[0],level:null,access:'all',attention:'all'};
  if(!raw||typeof raw!=='object')return p;
  if(skills.includes(raw.skill))p.skill=raw.skill;
  if(Number.isInteger(raw.level)&&raw.level>=1&&raw.level<=(game==='osrs'?99:120))p.level=raw.level;
  if(['all','f2p'].includes(raw.access))p.access=raw.access;
  if(['all','long','variable','batch'].includes(raw.attention))p.attention=raw.attention;
  return p;
}
export function buildAfkRoute({game,skill,level=null,skills={},membership='unknown',access='all',attention='all'}){
  const known=Number.isInteger(level)&&level>=1&&level<=(game==='osrs'?99:120);
  const rows=afkMethods.filter(m=>m.game===game&&m.skill===skill&&(access!=='f2p'||!m.members)&&(attention==='all'||m.attention===attention)).sort((a,b)=>a.level-b.level||a.id.localeCompare(b.id)).map(method=>{
    const reasons=[];
    if(!known)reasons.push('Add your level to locate yourself on this route.');
    else if(level<method.level)reasons.push(`Requires ${method.level} ${skill}.`);
    if(method.members&&membership!=='members')reasons.push(membership==='f2p'?'Requires membership.':'Membership not confirmed.');
    const capped=known&&method.f2pLevelCap&&level>method.f2pLevelCap&&(membership==='f2p'||access==='f2p');
    if(capped)reasons.push(`F2P progression is capped at ${method.f2pLevelCap}.`);
    for(const[id,min]of Object.entries(method.otherSkills)){if(!Number.isInteger(skills[id]))reasons.push(`${id} ${min}: level unknown.`);else if(skills[id]<min)reasons.push(`${id} ${min}: you have ${skills[id]}.`);}
    const blocked=capped||(known&&level<method.level)||(method.members&&membership==='f2p')||Object.entries(method.otherSkills).some(([id,min])=>Number.isInteger(skills[id])&&skills[id]<min);
    return {method,reasons,status:blocked?'locked':known?'check-setup':'unknown',inRange:known&&level>=method.level&&level<=method.until};
  });
  // Access is never inferred from a known skill level: quest/gear/location checks remain manual.
  const current=rows.filter(row=>row.inRange&&row.status!=='locked');
  const next=known?rows.find(row=>row.method.level>level):null;
  return {rows,current,next,known,level:known?level:null};
}
