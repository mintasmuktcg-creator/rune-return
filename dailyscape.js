import { routines, dailyCatalog } from './dailyscape-data.js';
import { activityStatus, nextReset, formatCountdown, activityTimer, estimateReward, cleanJournal, csvLog } from './dailyscape-core.js';
import { escapeHtml as esc } from './core.js';

const $ = selector => document.querySelector(selector);
const number = value => new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(value);
const stamp = value => new Date(value).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
const labels = {daily:'Daily',weekly:'Weekly',monthly:'Monthly',flexible:'On your clock'};
const kinds = {all:'All activities',dnd:'D&Ds',training:'XP & training',claim:'Free claims',shop:'Shop runs',utility:'Utility',reputation:'Reputation',combat:'Combat'};
let hooks, game='osrs', query='', tab='activities', cadence='all', kind='all', onlyPinned=false, statusFilter='all', logLimit=30;
let identity='', journal=cleanJournal(null,routines), broken=false;
let statusRefreshAt=0;
let cardLimit=6,cardRange='';
const activityById = id => routines.find(activity=>activity.id===id);
function load() {
  const profile=hooks.getProfile();
  const next=`runereturn.dailyscape.v1.${profile.key}`;
  if(next===identity)return;
  identity=next;broken=false;logLimit=30;
  try {
    const stored=localStorage.getItem(identity);
    journal=cleanJournal(stored?JSON.parse(stored):null,routines);
    if(!stored) journal.legacy={...hooks.getLegacyChecks()};
  }catch{broken=true;journal=cleanJournal(null,routines);}
}
function save(next) {
  if(broken){hooks.toast('The saved journal could not be read. Restore a JSON backup before adding entries.');return false;}
  try{localStorage.setItem(identity,JSON.stringify(next));journal=next;return true;}
  catch{hooks.toast('Your journal could not be saved. Export a backup or free device storage; this action was not recorded.');return false;}
}
function estimate(activity){return estimateReward(activity,journal.overrides[activity.id],journal.rates[activity.game]);}
function stateFor(activity,now=new Date()){return activityStatus(activity,journal.logs,now,journal.member,journal.legacy[activity.id]);}
function allowed(activity){return (!activity.members||journal.member)&&!(activity.noIron&&hooks.getProfile().mode&&hooks.getProfile().mode!=='normal');}
function timeBenefit(value) {
  if(value.savedMinutes==null)return value.gp!=null?'GP reward; XP not valued':'No fixed GP or XP estimate';
  return value.savedMinutes>=0?`~${number(value.savedMinutes)} min saved`:`~${number(-value.savedMinutes)} min slower than training`;
}
function countdown(value,now=new Date()){return formatCountdown(value,now)||'Time unavailable';}
function timerMarkup(activity,status,now=new Date()) {
  const timer=activityTimer(activity,status,now);
  return `<span>${esc(timer.label)}</span><strong>${esc(timer.text)}</strong>${timer.target?`<time datetime="${timer.target}" title="${timer.target}">${esc(stamp(timer.target))}</time>`:''}${timer.availableAt?`<small>Available in ${countdown(timer.availableAt,now)} <time datetime="${timer.availableAt}">(${esc(stamp(timer.availableAt))})</time></small>`:''}`;
}
function resetWidgets(now=new Date()) {
  return ['daily','weekly','monthly'].map(period=>{
    if(game==='osrs'&&period==='monthly')return '<span>Monthly cycle<strong class="daily-reset-note">No standard cycle</strong><small>See optional recurring runs instead.</small></span>';
    if(game==='osrs'&&period==='weekly'){
      const activity=activityById('osrs-tears'),status=stateFor(activity,now),timer=activityTimer(activity,status,now);
      return `<span>Tears of Guthix<strong class="daily-reset-note">${esc(timer.text)}</strong><small>Personal 7-day reminder; log your run to start it. XP/quest-point eligibility also applies.</small></span>`;
    }
    const target=nextReset(period,now);
    return `<span>${labels[period]} reset<strong>${countdown(target,now)}</strong><time datetime="${target}" title="${target}">${esc(stamp(target))}</time></span>`;
  }).join('');
}
function receipt(value) {
  const parts=[];
  if(value.gp!=null)parts.push(`${number(value.gp)} GP`);
  if(value.xp!=null)parts.push(`${number(value.xp)} XP`);
  if(value.bxp!=null)parts.push(`${number(value.bxp)} BXP`);
  return parts.join(' · ')||'Reward not valued';
}
function card(activity) {
  const value=estimate(activity), status=stateFor(activity), eligible=allowed(activity), pinned=journal.pinned.includes(activity.id);
  const limitText=activity.reset==='manual'?'Repeatable':activity.reset==='cooldown'?status.done?'On cooldown':'Ready to check':`${status.count}/${status.limit} recorded`;
  const latest=journal.logs.filter(log=>log.activityId===activity.id&&!log.undoneAt).sort((a,b)=>b.at.localeCompare(a.at))[0];
  return `<article class="update-card daily-card ${status.done?'daily-done':''}" data-daily-card="${activity.id}">
    <div class="daily-card-top"><span class="badge ${status.done?'live':''}">${esc(labels[activity.cadence])} · ${esc(limitText)}</span><button class="daily-pin" data-daily-pin="${activity.id}" aria-pressed="${pinned}" aria-label="${pinned?'Unpin':'Pin'} ${esc(activity.title)}">${pinned?'★':'☆'}</button></div>
    <h3>${esc(activity.title)}</h3><p class="description">${esc(activity.summary)}</p>
    <div class="daily-value"><strong>${value.scenario?'Example: ':''}${value.gp!=null?`~${number(value.gp)} GP`:value.xp||value.bxp?`${number(value.xp||0)} XP${value.bxp?` + ${number(value.bxp)} BXP`:''}`:'Reward varies / utility'}</strong><span>${esc(timeBenefit(value))}</span><small>${number(value.minutes)} min active · ${number(value.rate)} XP/h comparison${value.gp!=null?' · GP before selling fees':''}</small></div>
    <div class="daily-activity-timer" role="timer" aria-live="off" data-activity-timer="${activity.id}">${timerMarkup(activity,status)}</div>
    <details class="daily-info"><summary>Details & reward calculator</summary>
    <p class="daily-requirements">${activity.members?'Members':'Free-to-play available'} · ${esc(activity.requirements)}${activity.noIron?' Not available to Ironman accounts.':''}</p>
    <p class="daily-basis">${value.custom?'Your estimate. ':value.scenario?'Example scenario. ':activity.snapshot?'Dated price estimate. ':''}${esc(value.basis)}</p>
    ${activity.timing?`<p class="daily-timing">${esc(activity.timing)}</p>`:''}
    ${!status.scheduled?`<p class="daily-timing">Not scheduled today (UTC). Check the stated availability day.</p>`:''}
    ${latest?`<p class="daily-completed">Last marked <time datetime="${latest.at}" title="${latest.at}">${esc(stamp(latest.at))}</time>${latest.extra?' · reset-token run':''} <button class="text-button" data-daily-undo="${latest.id}">Undo</button></p>`:status.legacy?'<p class="daily-completed">Imported checked reminder; original timestamp unavailable.</p>':''}
    <details class="daily-calculator"><summary>Edit reward & time estimate</summary>
      <form data-daily-estimate="${activity.id}" class="daily-estimate-form">
        <label>Net GP before selling fees<input type="number" name="gp" min="-1000000000000" max="1000000000000" step="any" value="${value.gp??''}" placeholder="Unknown / no GP reward"></label>
        <label>Direct XP<input type="number" name="xp" min="0" max="1000000000000" step="any" value="${value.xp??''}" placeholder="Unknown"></label>
        <label>Bonus XP (used later)<input type="number" name="bxp" min="0" max="1000000000000" step="any" value="${value.bxp??''}" placeholder="None / unknown"></label>
        <label>Active minutes (travel too)<input required type="number" name="minutes" min="0" max="100000" step="any" value="${value.minutes}"></label>
        <label>Alternative XP per hour<input required type="number" name="rate" min="1" max="1000000000000" step="any" value="${value.rate}"></label>
        <label class="daily-wide">Assumptions / notes<textarea name="note" maxlength="1200" rows="3">${esc(value.basis)}</textarea></label>
        <p class="daily-wide daily-timing">Time saved = (direct XP + fully consumed bonus XP) ÷ alternative XP/hour × 60 − active minutes. BXP is deferred, not XP already earned. For mixed skills, use a suitable blended comparison rate. GP inputs should subtract supplies and purchases; no GP value is assigned to XP.</p>
        <div class="daily-wide daily-actions"><button class="outline-button" type="submit">Save my estimate</button><button class="text-button" type="button" data-daily-default="${activity.id}">Use catalog estimate</button></div>
      </form></details></details>
    <div class="card-bottom"><a class="text-button" href="${esc(activity.guide)}" target="_blank" rel="noopener noreferrer">Activity guide ↗</a><button class="save-button ${status.done?'saved':''}" data-daily-complete="${activity.id}" ${!status.ready||!eligible?'disabled':''}>${!eligible?'Account restriction':status.done?'✓ Complete':activity.reset==='manual'?'Log a completion':status.count?`Mark run ${status.count+1} complete`:'Mark complete'}</button></div>
    ${status.legacy?`<button class="text-button daily-extra" data-daily-clear-legacy="${activity.id}">Clear imported check</button>`:''}
    ${activity.resetTokens&&status.done&&eligible?`<button class="text-button daily-extra" data-daily-extra="${activity.id}">Log an extra run using a reset token</button>`:''}
  </article>`;
}
function download(content,filename,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function history(relevant) {
  const records=journal.logs.filter(log=>relevant.some(activity=>activity.id===log.activityId)).sort((a,b)=>b.at.localeCompare(a.at));
  const active=records.filter(log=>!log.undoneAt);
  const gp=active.reduce((sum,log)=>sum+(log.snapshot.gp||0),0);
  const savings=active.reduce((sum,log)=>{const reward=estimateReward({minutes:log.snapshot.minutes??0,basis:''},log.snapshot,log.snapshot.rate||journal.rates[game]);return sum+(reward.savedMinutes||0);},0);
  return `<section class="daily-history"><div class="daily-history-head"><div><h3>Your completion journal</h3><p>${active.length} active records · ${number(gp)} estimated GP before fees · ${number(savings)} estimated net minutes saved</p><small>Estimates captured when marked complete; not verified earnings. Records with unknown rewards are excluded from value totals. Undone entries remain visible.</small></div><button class="outline-button" data-daily-export="csv">Export full CSV</button></div>
    ${records.length?`<ol class="daily-log">${records.slice(0,logLimit).map(log=>`<li class="${log.undoneAt?'daily-log-undone':''}"><div><strong>${esc(activityById(log.activityId).title)}</strong><time datetime="${log.at}" title="${log.at}">Marked complete ${esc(stamp(log.at))}</time><small>${esc(receipt(log.snapshot))}${log.extra?' · Reset-token run':''}${log.undoneAt?` · Undone ${esc(stamp(log.undoneAt))}`:''}</small><details><summary>Saved estimate assumptions</summary><p>${esc(log.snapshot.basis||'No numeric estimate saved.')} ${number(log.snapshot.minutes||0)} active min; ${number(log.snapshot.rate||0)} XP/h comparison.</p></details></div>${!log.undoneAt?`<button class="text-button" data-daily-undo="${log.id}">Undo entry</button>`:''}</li>`).join('')}</ol>${records.length>logLimit?'<button class="outline-button" data-daily-more>Show 30 more entries</button>':''}`:'<div class="empty-state"><h3>Your first entry awaits.</h3><p>Mark an activity complete to save its time and estimate here. Resetting a checklist never deletes its history.</p></div>'}</section>`;
}
export function renderDailyScape(nextGame,nextQuery) {
  game=nextGame;query=nextQuery;load();
  const relevant=routines.filter(activity=>activity.game===game);
  const todayLogs=journal.logs.filter(log=>!log.undoneAt&&activityById(log.activityId)?.game===game&&log.at.slice(0,10)===new Date().toISOString().slice(0,10));
  $('#stats').innerHTML=[...['daily','weekly','monthly'].map(period=>[relevant.filter(activity=>activity.cadence===period&&allowed(activity)&&stateFor(activity).ready).length,`${period} activities ready`]),[todayLogs.length,'completions logged today (UTC)']].map(([count,label])=>`<div><span>◷</span><strong>${count}</strong><small>${label}</small></div>`).join('');
  const selected=relevant.filter(activity=>(cadence==='all'||activity.cadence===cadence)&&(kind==='all'||activity.kind===kind)&&(!onlyPinned||journal.pinned.includes(activity.id))&&(`${activity.title} ${activity.summary} ${activity.requirements}`.toLowerCase().includes(query.toLowerCase().trim()))&&(statusFilter==='all'||(statusFilter==='ready'?stateFor(activity).ready&&allowed(activity):stateFor(activity).done)));
  $('#shown-count').textContent=`${selected.length} activities · ${relevant.length} in catalog`;
  const controls=`<div class="daily-hub"><div class="daily-resets" data-daily-reset-widgets role="timer" aria-live="off" aria-label="Activity reset countdowns">${resetWidgets()}</div><details class="daily-reset-details"><summary>Reset times & rules</summary><div class="daily-intro"><p class="eyebrow">A LITTLE PROGRESS, ON YOUR TERMS</p><h3>Make your own DailyScape.</h3><p>Browse D&Ds, claims, shop runs and repeatable goals. Pin what matters to you, compare the rewards and keep a dated record of every run.</p><p class="daily-timing">Global resets use 00:00 UTC (RS3 weeklies: Wednesday). Personal cooldowns, stock accumulation and availability days are labelled separately. This list ignores your last-played date. Quest eligibility is not imported.</p></div></details>
    <div class="daily-tabs" role="group" aria-label="DailyScape view"><button class="outline-button" data-daily-tab="activities" aria-pressed="${tab==='activities'}">Activity checklist</button><button class="outline-button" data-daily-tab="history" aria-pressed="${tab==='history'}">Completion journal (${journal.logs.filter(log=>activityById(log.activityId)?.game===game).length})</button></div>
    <details class="daily-settings"><summary>Account, estimates & backups</summary><p>Journal for <strong>${esc(hooks.getProfile().label)}</strong>. Stored in this browser, separately for each selected character. DailyScape history is not cloud-synced. Export a backup to keep or move it; importing merges records without deleting existing history.</p><form id="daily-settings-form" class="daily-settings-form"><label><input type="checkbox" name="member" ${journal.member?'checked':''}> Members account</label><label>Default ${game.toUpperCase()} comparison XP/hour<input type="number" name="rate" min="1" max="1000000000000" required value="${journal.rates[game]}"></label><button class="outline-button">Save settings</button></form><p>Use a realistic alternative training rate. Card estimates can override it. GP snapshots were reviewed ${dailyCatalog.reviewed}; they are not live quotes. XP planning examples are labelled and do not assume your imported levels.</p><div class="daily-actions"><button class="outline-button" data-daily-export="json">Download JSON backup</button><button class="outline-button" data-daily-export="csv">Export full CSV</button><label class="outline-button daily-upload">Merge JSON backup<input type="file" id="daily-import" accept="application/json,.json"></label></div></details>
    ${broken?'<p class="notice">The local journal could not be read. New writes are blocked to protect the stored copy. Restore a JSON backup to recover your journal.</p>':''}
    ${tab==='activities'?`<div class="daily-filters"><div class="daily-cadences" role="group" aria-label="Activity frequency">${[['all','All'],...Object.entries(labels)].map(([id,label])=>`<button class="outline-button" data-daily-cadence="${id}" aria-pressed="${cadence===id}">${label}</button>`).join('')}</div><label><span class="sr-only">Activity kind</span><select id="daily-kind">${Object.entries(kinds).map(([id,label])=>`<option value="${id}" ${id===kind?'selected':''}>${label}</option>`).join('')}</select></label><label><span class="sr-only">Completion status</span><select id="daily-status"><option value="all" ${statusFilter==='all'?'selected':''}>Any status</option><option value="ready" ${statusFilter==='ready'?'selected':''}>Ready to do</option><option value="done" ${statusFilter==='done'?'selected':''}>Completed this period</option></select></label><label><input type="checkbox" id="daily-pinned" ${onlyPinned?'checked':''}> Pinned only</label></div><div class="daily-grid">${selected.length?selected.slice(0,cardLimit).map(card).join(''):`<div class="empty-state"><h3>No activities in this view.</h3><p>${game==='osrs'&&cadence==='monthly'?'OSRS does not have a standard monthly D&D cycle here.':'Try another frequency, clear search, or change your filters.'}</p><button class="outline-button" data-daily-clear-filters>Clear filters</button></div>`}</div>${selected.length>cardLimit?'<button class="outline-button daily-more" data-daily-cards-more>Show 6 more activities</button>':''}`:history(relevant.filter(activity=>`${activity.title} ${activity.summary}`.toLowerCase().includes(query.toLowerCase().trim())))}
    <details class="daily-catalog-details"><summary>Catalog coverage & sources</summary>
    ${game==='rs3'?`<p class="daily-catalog-note">Reviewed ${dailyCatalog.reviewed} after the <a href="${dailyCatalog.overhaul}" target="_blank" rel="noopener noreferrer">2026 overhaul ↗</a>. Removed dailies are excluded; uncapped activities are under “On your clock.” Shop routes group related stores. ${relevant.length} catalog activities; account restrictions and specific shop margins still need checking.</p>`:`<p class="daily-catalog-note">OSRS has no standard monthly D&D cycle in this catalog. Tears of Guthix uses a personal seven-day cooldown. Shop claims and diary utility charges are included alongside optional recurring runs.</p>`}
    <p class="daily-catalog-note">Activity references: <a href="${dailyCatalog.sources[game]}" target="_blank" rel="noopener noreferrer">${game.toUpperCase()} repeatable-events index ↗</a>. This catalog covers the reviewed repeatable activities and grouped routes, rather than every possible stock item or training loop. Numeric estimates never verify actual completion or profit.</p></details></div>`;
  $('#results').innerHTML=controls;
  const now=new Date();statusRefreshAt=Math.min(Date.parse(nextReset('daily',now)),...relevant.map(activity=>Date.parse(stateFor(activity,now).resetAt)).filter(time=>Number.isFinite(time)&&time>now.getTime()));
}
export function dailyPlanningContext(selectedGame) {
  load();
  return routines.filter(activity=>activity.game===selectedGame).map(activity=>({activity,status:stateFor(activity),eligible:allowed(activity),value:estimate(activity),pinned:journal.pinned.includes(activity.id)}));
}
export function revealDailyActivity(){tab='activities';cadence='all';kind='all';onlyPinned=false;statusFilter='all';}
function rerender(){if(hooks.isVisible())renderDailyScape(game,query);}
export function initDailyScape(callbacks) {
  hooks=callbacks;
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(!button.hasAttribute('data-daily-complete')&&!button.hasAttribute('data-daily-extra')&&!button.hasAttribute('data-daily-undo')&&!Object.keys(button.dataset).some(key=>key.startsWith('daily')))return;
    load();
    const id=button.dataset.dailyComplete||button.dataset.dailyExtra;
    if(id){
      const activity=activityById(id);if(!activity||!allowed(activity))return;
      const extra=Boolean(button.dataset.dailyExtra);
      if(extra&&!activity.resetTokens)return;
      if(!extra&&!stateFor(activity).ready)return;
      const value=estimate(activity),at=new Date().toISOString();
      const next=structuredClone(journal);delete next.legacy[id];
      next.logs.push({id:crypto.randomUUID(),activityId:id,at,undoneAt:null,extra,snapshot:{gp:value.gp,xp:value.xp,bxp:value.bxp,minutes:value.minutes,rate:value.rate,basis:value.basis}});
      if(save(next)){rerender();hooks.toast(`${activity.title} recorded at ${stamp(at)}.`);document.querySelector(`[data-daily-card="${id}"] .daily-pin`)?.focus({preventScroll:true});}
      return;
    }
    if(button.dataset.dailyUndo){const next=structuredClone(journal),entry=next.logs.find(log=>log.id===button.dataset.dailyUndo);if(entry&&!entry.undoneAt){entry.undoneAt=new Date().toISOString();if(save(next)){rerender();hooks.toast('Completion undone. Its original timestamp remains in the journal.');}}}
    if(button.dataset.dailyPin){const next=structuredClone(journal);next.pinned=next.pinned.includes(button.dataset.dailyPin)?next.pinned.filter(id=>id!==button.dataset.dailyPin):[...next.pinned,button.dataset.dailyPin];if(save(next))rerender();}
    if(button.dataset.dailyDefault){const next=structuredClone(journal);delete next.overrides[button.dataset.dailyDefault];if(save(next))rerender();}
    if(button.dataset.dailyClearLegacy){const next=structuredClone(journal);delete next.legacy[button.dataset.dailyClearLegacy];if(save(next))rerender();}
    if(button.dataset.dailyTab){tab=button.dataset.dailyTab;rerender();}
    if(button.dataset.dailyCadence){cadence=button.dataset.dailyCadence;rerender();}
    if(button.hasAttribute('data-daily-clear-filters')){cadence='all';kind='all';statusFilter='all';onlyPinned=false;hooks.clearSearch();query='';rerender();}
    if(button.hasAttribute('data-daily-cards-more')){cardLimit+=6;rerender();}
    if(button.hasAttribute('data-daily-more')){logLimit+=30;rerender();}
    if(button.dataset.dailyExport){const json=button.dataset.dailyExport==='json';download(json?JSON.stringify({...journal,exportedAt:new Date().toISOString(),profile:hooks.getProfile().label},null,2):csvLog(journal.logs,routines),`runereturn-dailyscape-${new Date().toISOString().slice(0,10)}.${json?'json':'csv'}`,json?'application/json':'text/csv;charset=utf-8');}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(form.id!=='daily-settings-form'&&!form.dataset.dailyEstimate)return;
    event.preventDefault();load();const data=new FormData(form),next=structuredClone(journal);
    if(form.id==='daily-settings-form'){next.member=data.has('member');next.rates[game]=Number(data.get('rate'));}
    else{const value={};for(const key of ['gp','xp','bxp','minutes','rate'])value[key]=data.get(key)===''?null:Number(data.get(key));value.note=String(data.get('note')||'');next.overrides[form.dataset.dailyEstimate]=value;}
    const safe=cleanJournal(next,routines);if(save(safe)){rerender();hooks.toast('DailyScape settings saved. Existing journal estimates are unchanged.');}
  });
  document.addEventListener('change',async event=>{
    const input=event.target;
    if(input.id==='daily-kind'){kind=input.value;rerender();}
    if(input.id==='daily-status'){statusFilter=input.value;rerender();}
    if(input.id==='daily-pinned'){onlyPinned=input.checked;rerender();}
    if(input.id==='daily-import'&&input.files[0]){
      const profileKey=identity;
      try{
        if(input.files[0].size>20000000)throw Error('Choose a JSON backup smaller than 20 MB.');
        const raw=JSON.parse(await input.files[0].text());
        if(raw.version!==1||!Array.isArray(raw.logs)||raw.logs.some(log=>!log||!activityById(log.activityId)))throw Error('This is not a compatible RuneReturn DailyScape backup.');
        const imported=cleanJournal(raw,routines);
        if(imported.logs.length!==raw.logs.length)throw Error('Backup contains invalid or duplicate entries; the existing journal was kept.');
        if(profileKey!==identity||`runereturn.dailyscape.v1.${hooks.getProfile().key}`!==profileKey)throw Error('The selected character changed. Import again for the intended character.');
        const merged=new Map(journal.logs.map(log=>[log.id,log]));
        for(const entry of imported.logs){const old=merged.get(entry.id);if(!old)merged.set(entry.id,entry);else if(entry.undoneAt&&(!old.undoneAt||entry.undoneAt>old.undoneAt))merged.set(entry.id,{...old,undoneAt:entry.undoneAt});}
        const next=cleanJournal({...imported,logs:[...merged.values()],overrides:{...journal.overrides,...imported.overrides},pinned:[...journal.pinned,...imported.pinned]},routines);
        // A user-selected valid backup can recover an unreadable local journal.
        broken=false;if(save(next)){rerender();hooks.toast('Backup merged. Existing history was kept.');}
      }catch(error){hooks.toast(error.message||'Could not import this backup.');}
    }
  });
  window.addEventListener('storage',event=>{if(event.key===identity){identity='';load();rerender();}});
  // Update only clock fragments; preserve open calculators, inputs and focus.
  const refreshWhenIdle=()=>{
    if(document.hidden||!hooks.isVisible())return;
    const now=new Date();
    const widgets=$('[data-daily-reset-widgets]');if(widgets)widgets.innerHTML=resetWidgets(now);
    document.querySelectorAll('[data-activity-timer]').forEach(node=>{const activity=activityById(node.dataset.activityTimer);if(activity)node.innerHTML=timerMarkup(activity,stateFor(activity,now),now);});
    if(now.getTime()>=statusRefreshAt&&!$('#results details[open]')&&!document.activeElement?.closest('#results form'))rerender();
  };
  document.addEventListener('visibilitychange',refreshWhenIdle);
  window.addEventListener('focus',refreshWhenIdle);
  setInterval(refreshWhenIdle,1000);
}
