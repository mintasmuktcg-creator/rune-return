import { buildSession } from './session-core.js';
import { escapeHtml as esc } from './core.js';
let hooks,budget=30,goal='mixed',plan=null,contextKey='';
const $=selector=>document.querySelector(selector);
const number=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(value);
export function renderHome(context) {
  const key=`${context.game}|${context.since}|${context.profile}`;
  if(key!==contextKey){contextKey=key;plan=null;}
  else if(plan)plan=buildSession({...hooks.context(),budget,goal});
  $('#home').innerHTML=`<div class="home-intro"><p class="eyebrow">YOUR NEXT ADVENTURE</p><h1>Welcome back.<br><em>Where to next?</em></h1><p>A new story, a quick routine, or a little of both. Pick one thing to enjoy today.</p></div>
    <div class="home-choices"><button data-view="discover"><span>01 / EXPLORE</span><strong>What did I miss?</strong><small>Updates since your last visit.</small><b aria-hidden="true">↗</b></button><button id="home-session-open"><span>02 / MAKE A PLAN</span><strong>I have a little time.</strong><small>A short session, built around your goal.</small><b aria-hidden="true">↗</b></button><button data-view="routines"><span>03 / KEEP A ROUTINE</span><strong>My DailyScape.</strong><small>Checklists, rewards and your journal.</small><b aria-hidden="true">↗</b></button></div>
    <section id="session-builder" class="session-builder" ${!plan?'hidden':''} aria-labelledby="session-title"><div class="session-heading"><div><p class="eyebrow">ONE SESSION AT A TIME</p><h2 id="session-title">What sounds good?</h2></div><button class="text-button" id="home-session-close">Close planner ×</button></div><form id="session-form"><label>Time to play<select name="budget"><option value="15" ${budget===15?'selected':''}>15 minutes</option><option value="30" ${budget===30?'selected':''}>30 minutes</option><option value="60" ${budget===60?'selected':''}>An hour</option></select></label><label>Today’s goal<select name="goal">${[['mixed','A little of everything'],['story','Quest & story progress'],['gp','Earn GP'],['xp','Gain XP'],['relaxed','Something relaxed']].map(([id,label])=>`<option value="${id}" ${id===goal?'selected':''}>${label}</option>`).join('')}</select></label><button class="primary-button">Build my session ↗</button></form><div id="session-result" role="status" aria-live="polite">${plan?renderPlan(plan):'<p class="session-hint">Up to three suggestions. Nothing is marked complete automatically.</p>'}</div></section>
    <p class="home-footnote">Your progress stays on this device. Character connections and backups are available when you need them.</p>`;
}
function renderPlan(result){
  if(!result.tasks.length)return '<div class="session-empty"><h3>No suitable suggestions yet.</h3><p>Try a longer session or another goal. You can also check your completed filters, reward estimates and saved adventures.</p><button class="text-button" data-view="routines">Open DailyScape ↗</button></div>';
  return `<div class="session-plan"><p class="session-plan-label">Your ${result.budget}-minute plan · ${result.tasks.length} suggestions</p><ol>${result.tasks.map(task=>`<li><div><span>${task.minutes} MIN${task.type==='story'?' / QUEST PROGRESS':''}</span><h3>${esc(task.title)}</h3><p>${task.type==='story'?'Start or continue this story. The allotted time is a session budget, not an estimate of the full quest length.':`${task.value.scenario?'Example estimate · ':''}${task.value.gp!=null?`~${number(task.value.gp)} GP before fees`:task.value.xp||task.value.bxp?`${number(task.value.xp||0)} XP${task.value.bxp?` + ${number(task.value.bxp)} BXP`:''}`:'Reward varies'} · Active time includes your configured travel allowance.`}</p></div><button class="text-button" ${task.type==='story'?`data-detail="${task.id}"`:`data-open-routine="${task.id}"`}>${task.type==='story'?'Where to start':'Open activity'} ↗</button></li>`).join('')}</ol>${result.remaining?`<p class="session-hint">${number(result.remaining)} minutes left open. Keep them for travel, setup or whatever you feel like.</p>`:''}<p class="session-hint">Suggestions use your checklist status and estimates. Check quest unlocks, equipment and actual availability before starting; character eligibility is not confirmed.</p></div>`;
}
export function initHome(callbacks){
  hooks=callbacks;
  document.addEventListener('click',event=>{
    if(event.target.closest('#home-session-open')){$('#session-builder').hidden=false;$('#session-builder select').focus({preventScroll:true});$('#session-builder').scrollIntoView({behavior:'smooth',block:'nearest'});}
    if(event.target.closest('#home-session-close')){$('#session-builder').hidden=true;$('#home-session-open').focus({preventScroll:true});}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='session-form')return;
    event.preventDefault();const data=new FormData(event.target);budget=Number(data.get('budget'));goal=String(data.get('goal'));
    const context=hooks.context();plan=buildSession({...context,budget,goal});$('#session-result').innerHTML=renderPlan(plan);
  });
}
