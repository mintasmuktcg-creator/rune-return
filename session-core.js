// Plans budget active play time, not growth clocks or a full quest's duration.
export function buildSession({ candidates, stories = [], budget = 30, goal = 'mixed' }) {
  if (![15,30,60].includes(budget)) throw new Error('Choose a 15, 30 or 60 minute session.');
  if (!['mixed','story','gp','xp','relaxed'].includes(goal)) throw new Error('Choose a supported session goal.');
  const tasks=[];let remaining=budget;
  const story=stories[0];
  if(goal==='story')return {tasks:story?[{type:'story',id:story.id,title:story.title,minutes:budget}]:[],remaining:story?0:budget,budget,goal};
  const eligible=candidates.filter(({activity,status,eligible,value})=>eligible&&status.ready&&value.minutes>0&&value.minutes<=budget&&
    (goal!=='gp'||value.gp>0)&&
    (goal!=='xp'||value.xp>0||value.bxp>0)&&
    (goal!=='relaxed'||(activity.kind!=='combat'&&!/wilderness|pvp|danger|combat|boss|fight|defeat/i.test(`${activity.requirements} ${activity.summary}`))));
  const score=row=>goal==='gp'?row.value.gp/row.value.minutes:goal==='xp'?((row.value.xp||0)+(row.value.bxp||0))/row.value.minutes:(row.pinned?100000:0)+(row.activity.kind==='dnd'?100:0)-row.value.minutes;
  eligible.sort((a,b)=>score(b)-score(a)||a.activity.id.localeCompare(b.activity.id));
  for(const row of eligible){
    // Leave room for a story step when a mixed session can include one.
    const reserve=goal==='mixed'&&story?Math.min(10,budget/2):0;
    if(row.value.minutes>remaining-reserve)continue;
    tasks.push({type:'activity',id:row.activity.id,title:row.activity.title,minutes:row.value.minutes,value:row.value});
    remaining-=row.value.minutes;
    if(tasks.length===(goal==='mixed'&&story?2:3))break;
  }
  if(goal==='mixed'&&story&&remaining>0){tasks.push({type:'story',id:story.id,title:story.title,minutes:remaining});remaining=0;}
  return {tasks,remaining,budget,goal};
}
