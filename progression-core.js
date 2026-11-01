import { progressionNodes, moneyMethods, gameSkills, skillNames, paths } from './progression-data.js';
export const defaultProgression=game=>({version:1,game,persona:'returning',path:'balanced',target:'auto',skill:game==='rs3'?'necromancy':'mining',targetLevel:game==='rs3'?24:50,membership:'unknown',bankroll:null,risk:'low',manualSkills:{},facts:{},completed:[],samples:{},priceOverrides:{}});
export function cleanProgression(raw,game){
  const result=defaultProgression(game);if(!raw||typeof raw!=='object')return result;
  for(const [key,choices]of Object.entries({persona:['new','returning','active'],path:paths.map(p=>p.id),membership:['unknown','f2p','members'],risk:['low','medium','high']}))if(choices.includes(raw[key]))result[key]=raw[key];
  if(gameSkills[game].includes(raw.skill))result.skill=raw.skill;
  if(Number.isInteger(raw.targetLevel)&&raw.targetLevel>=2&&raw.targetLevel<=(game==='osrs'?99:120))result.targetLevel=raw.targetLevel;
  if(typeof raw.bankroll==='number'&&Number.isFinite(raw.bankroll)&&raw.bankroll>=0&&raw.bankroll<=1e12)result.bankroll=raw.bankroll;
  if(raw.target==='auto'||progressionNodes.some(n=>n.game===game&&n.id===raw.target))result.target=raw.target;
  for(const [key,value]of Object.entries(raw.manualSkills||{}))if(gameSkills[game].includes(key)&&Number.isInteger(value)&&value>=1&&value<=200)result.manualSkills[key]=value;
  const nodes=progressionNodes.filter(n=>n.game===game),facts=new Set(nodes.flatMap(n=>n.facts.map(f=>f.id)));
  for(const [id,value]of Object.entries(raw.facts||{}))if(facts.has(id)&&typeof value==='boolean')result.facts[id]=value;
  result.completed=[...new Set((Array.isArray(raw.completed)?raw.completed:[]).filter(id=>nodes.some(n=>n.id===id)))];
  for(const [id,values]of Object.entries(raw.samples||{}))if(nodes.some(n=>n.gpMethod===id)&&Array.isArray(values))result.samples[id]=values.filter(v=>v&&typeof v.id==='string'&&Number.isFinite(Date.parse(v.at))&&Number.isFinite(v.units)&&v.units>0&&v.units<=1e9&&Number.isFinite(v.minutes)&&v.minutes>0&&v.minutes<=100000).map(v=>({id:v.id.slice(0,80),at:new Date(v.at).toISOString(),units:v.units,minutes:v.minutes,level:Number.isInteger(v.level)?v.level:null}));
  for(const[id,value]of Object.entries(raw.priceOverrides||{}))if(nodes.some(n=>n.gpMethod===id)&&value&&['netSale','inputCost'].every(key=>typeof value[key]==='number'&&Number.isFinite(value[key])&&value[key]>=0&&value[key]<=1e12))result.priceOverrides[id]={netSale:value.netSale,inputCost:value.inputCost};
  return result;
}
export function knownSkills(profile,snapshot,now=Date.now()){
  const skills={},sources={};
  if(snapshot?.game===profile.game&&Number.isFinite(Date.parse(snapshot.fetchedAt))&&now-Date.parse(snapshot.fetchedAt)<=86400000&&Date.parse(snapshot.fetchedAt)<=now+60000){for(const [id,row]of Object.entries(snapshot.skills||{}))if(gameSkills[profile.game].includes(id)&&Number.isInteger(row.level)){skills[id]=row.level;sources[id]='hiscores';}}
  for(const [id,value]of Object.entries(profile.manualSkills)){skills[id]=value;sources[id]='manual';}
  return {skills,sources};
}
export function evaluateNode(node,profile,skills,mode='normal'){
  const reasons=[];
  if(profile.completed.includes(node.id))return {status:'done',reasons};
  if(node.skillGoal){const level=skills[node.skillGoal.skill];if(level==null)reasons.push({type:'unknown',text:`Add your ${skillNames[node.skillGoal.skill]} level.`});else if(level>=node.skillGoal.level)return {status:'done',reasons};return {status:reasons.length?'unknown':'ready',reasons};}
  if(node.members&&profile.membership!=='members')reasons.push({type:profile.membership==='f2p'?'blocked':'unknown',text:profile.membership==='f2p'?'Requires membership.':'Confirm whether this is a members account.'});
  if(node.gpMethod&&mode!=='normal')reasons.push({type:'blocked',text:'This GP model assumes Grand Exchange trading; Ironman supply planning needs a separate model.'});
  for(const[id,level]of Object.entries(node.skills)){if(skills[id]==null)reasons.push({type:'unknown',text:`${skillNames[id]} ${level}: current level unknown.`,skill:id,target:level});else if(skills[id]<level)reasons.push({type:'blocked',text:`Train ${skillNames[id]} from ${skills[id]} to ${level}.`,skill:id,target:level});}
  for(const id of node.requires)if(!profile.completed.includes(id))reasons.push({type:'blocked',text:`Complete ${progressionNodes.find(n=>n.id===id)?.title||id} first.`,nodeId:id});
  for(const fact of node.facts)if(profile.facts[fact.id]!==true)reasons.push({type:profile.facts[fact.id]===false?'blocked':'unknown',text:`${profile.facts[fact.id]===false?'Prepare':'Confirm'}: ${fact.label}.`,factId:fact.id});
  if(node.minimumBankroll){if(profile.bankroll==null)reasons.push({type:'unknown',text:`Confirm at least ${node.minimumBankroll.toLocaleString()} GP of working capital.`});else if(profile.bankroll<node.minimumBankroll)reasons.push({type:'blocked',text:`Need ${node.minimumBankroll.toLocaleString()} GP of working capital; you entered ${profile.bankroll.toLocaleString()}.`});}
  if(['low','medium','high'].indexOf(node.risk)>['low','medium','high'].indexOf(profile.risk))reasons.push({type:'blocked',text:`This has ${node.risk} risk; your preference is ${profile.risk}.`});
  return {status:reasons.some(r=>r.type==='blocked')?'blocked':reasons.length?'unknown':'ready',reasons};
}
export function gpEstimate(node,profile,skills){
  const method=moneyMethods[node.gpMethod];if(!method)return null;
  const level=skills[method.skill],band=method.bands.filter(b=>level!=null&&level>=b.level).at(-1);
  const prices=profile.priceOverrides[node.gpMethod]||method,margin=prices.netSale-prices.inputCost;
  const samples=profile.samples[node.gpMethod]||[];
  const rates=samples.map(s=>s.units/s.minutes*60).sort((a,b)=>a-b);
  const median=rates.length?rates.length%2?rates[(rates.length-1)/2]:(rates[rates.length/2-1]+rates[rates.length/2])/2:null;
  return {unit:method.unit,level,band,margin,netSale:prices.netSale,inputCost:prices.inputCost,customPrices:Boolean(profile.priceOverrides[node.gpMethod]),scenario:band?band.units.map(rate=>rate*margin).sort((a,b)=>a-b):null,personal:rates.length?{count:rates.length,median:median*margin,range:[rates[0]*margin,rates.at(-1)*margin].sort((a,b)=>a-b),sameLevel:samples.every(s=>s.level===level)}:null,basis:method.basis};
}
export function buildProgression(profile,snapshot=null,mode='normal',now=Date.now()){
  const known=knownSkills(profile,snapshot,now),skills=known.skills;
  const all=progressionNodes.filter(n=>n.game===profile.game).map(node=>{const row={node,...evaluateNode(node,profile,skills,mode),gp:gpEstimate(node,profile,skills)};if(profile.path==='gp'&&row.status!=='done'&&row.gp?.margin<=0){row.status='blocked';row.reasons.push({type:'blocked',text:'The entered prices give no positive margin. Recheck prices or choose another method.'});}return row;});
  let selected=all.filter(row=>profile.path==='balanced'||row.node.tags.includes(profile.path));
  if(profile.path==='skills'){
    const node={id:`skill-${profile.skill}-${profile.targetLevel}`,game:profile.game,title:`Train ${skillNames[profile.skill]} to ${profile.targetLevel}`,kind:'skill',tags:['skills'],skills:{},requires:[],facts:[],members:false,effort:30,priority:110,risk:'low',skillGoal:{skill:profile.skill,level:profile.targetLevel},summary:'A personal level target. Method and XP-rate choices still need your available unlocks and gear.',source:`https://${profile.game==='osrs'?'oldschool.':''}runescape.wiki/w/${encodeURIComponent(skillNames[profile.skill].split(' / ')[0].replaceAll(' ','_'))}`};
    selected.unshift({node,...evaluateNode(node,profile,skills,mode),gp:null});
  }
  const rank=row=>row.node.priority+(profile.persona==='new'?(row.node.requires.length===0?20:0):profile.persona==='active'?(row.node.requires.length?10:0):0)+all.filter(r=>r.node.requires.includes(row.node.id)).length*12-row.node.effort/10;
  selected.sort((a,b)=>rank(b)-rank(a)||a.node.id.localeCompare(b.node.id));
  let route=[];
  if(profile.target!=='auto'){
    const visit=(id,seen=new Set())=>{if(seen.has(id))return;seen.add(id);const row=all.find(r=>r.node.id===id);if(!row)return;for(const dep of row.node.requires)visit(dep,seen);route.push(row);};visit(profile.target);
  }
  const pool=route.length?route:selected;
  const ready=pool.filter(row=>row.status==='ready');
  if(profile.path==='gp'&&!route.length)ready.sort((a,b)=>(b.gp?.personal?.median??b.gp?.scenario?.[0]??-Infinity)-(a.gp?.personal?.median??a.gp?.scenario?.[0]??-Infinity));
  const next=ready[0]||pool.filter(row=>row.status==='unknown').sort((a,b)=>a.reasons.length-b.reasons.length)[0]||pool.find(row=>row.status==='blocked')||null;
  return {skills,sources:known.sources,all,selected,route,next,alternatives:pool.filter(row=>row!==next&&row.status!=='done').slice(0,2),completed:pool.filter(row=>row.status==='done').length};
}
