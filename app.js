import { catalog, categories, updates, routines, archivePosts, archiveMeta } from './data.js';
import { todayUtc, validDate, isEnded, filterUpdates, cleanState, escapeHtml as esc } from './core.js';
import { initCharacters, currentCharacter, updateCharacterProgress, selectCharacterForGame, dailyProfile } from './characters.js';
import { initDailyScape, renderDailyScape, dailyPlanningContext, revealDailyActivity } from './dailyscape.js';
import { initHome, renderHome } from './home.js';
import { initProgression, renderProgression } from './progression.js';
import { skillMatch } from './character-core.js';
import { requirementsById } from './requirements.js';

const $ = selector => document.querySelector(selector);
const today = todayUtc();
const key = 'runereturn.progress.v1';
let storageAvailable = true;
let raw;
try { raw = JSON.parse(localStorage.getItem(key) || 'null'); } catch { storageAvailable = false; }
const fallback = catalog.defaultDate <= today ? catalog.defaultDate : today;
const state = cleanState(raw, updates, routines, fallback, today);
const url = new URL(location.href);
if (['osrs', 'rs3'].includes(url.searchParams.get('game'))) state.game = url.searchParams.get('game');
const since = url.searchParams.get('since');
if (validDate(since) && since >= '2001-01-04' && since <= today) state.dates[state.game] = since;
const requestedView = url.searchParams.get('view');
let view = ({dailyscape:'routines',catchup:'discover',saved:'plan',home:'home',progression:'progression'})[requestedView] || (validDate(since) ? 'discover' : 'home');
let category = 'all';
let query = '';
let sort = 'recommended';
let hideDone = false;
let includeEnded = false;
let hideSkillGaps = false;
let toastTimer;
let archiveLimit = 25;
let archiveRange = '';
function matchingPosts() {
  return archivePosts.filter(post => post.game === state.game && post.date > state.dates[state.game] && post.date <= today && post.title.toLowerCase().includes(query.toLowerCase().trim())).sort((a,b) => sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
}
function renderArchive() {
  const range = `${state.game}|${state.dates[state.game]}|${query}|${sort}`;
  if (range !== archiveRange) { archiveLimit = 25; archiveRange = range; $('#archive-section details').open = state.dates[state.game] < catalog.coverageStart; }
  const posts = matchingPosts();
  if (state.dates[state.game] < catalog.coverageStart) $('#discoveries').before($('#archive-section'));
  else $('#discoveries').after($('#archive-section'));
  $('#archive-section').hidden = view !== 'discover';
  $('#archive-summary').textContent = `${posts.length} dated update posts — browse the archive`;
  $('#archive-results').innerHTML = posts.slice(0, archiveLimit).map(post => `<li><time datetime="${post.date}">${dateLabel(post.date)}</time><a href="${esc(post.url)}" target="_blank" rel="noopener noreferrer">${esc(post.title)} ↗</a></li>`).join('') || '<li>No update posts match this date and search.</li>';
  $('#archive-more').hidden = posts.length <= archiveLimit;
  $('#archive-source').href = state.game === 'osrs' ? 'https://oldschool.runescape.wiki/w/Game_updates' : 'https://runescape.wiki/w/Game_updates';
}
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const dateLabel = date => dateFormat.format(new Date(`${date}T00:00:00Z`));
const iconFor = item => categories.find(c => c.id === item.tags[0])?.icon || '◈';
const gameLabel = () => state.game === 'osrs' ? 'Old School RuneScape' : 'RuneScape 3';
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function persist() {
  if (updateCharacterProgress({ dates: state.dates, saved: state.saved, completed: state.completed, routineChecks: state.routineChecks })) return;
  try { localStorage.setItem(key, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; toast('Browser storage unavailable. Changes will last for this session only.'); }
}
function syncUrl() {
  const next = new URL(location.href);
  next.searchParams.set('game', state.game);
  next.searchParams.set('since', state.dates[state.game]);
  next.searchParams.set('view',({routines:'dailyscape',discover:'catchup',plan:'saved',home:'home',progression:'progression'})[view]);
  history.replaceState(null, '', next);
}
function options(extra = {}) {
  return { game: state.game, since: state.dates[state.game], today, category, query, sort, hideDone, includeEnded, saved: state.saved, completed: state.completed, view, ...extra };
}
function badge(item) {
  if (isEnded(item, today)) return '<span class="badge ended">Event ended</span>';
  if (item.endDate) return `<span class="badge seasonal">Until ${dateLabel(item.endDate)}</span>`;
  if (item.style === 'Beta release') return '<span class="badge beta">Released as beta</span>';
  return '<span class="badge live">Released</span>';
}
function card(item) {
  const saved = state.saved.includes(item.id), done = state.completed.includes(item.id);
  const matching = currentCharacter()?.game === item.game ? skillMatch(requirementsById[item.id], currentCharacter().snapshot) : null;
  return `<article class="update-card ${done ? 'is-done' : ''}">
    <div class="card-top"><span class="card-symbol ${item.tags[0]}">${iconFor(item)}</span><div class="card-labels"><span class="category-label">${categories.find(c => c.id === item.tags[0]).name}</span><time datetime="${item.date}">${dateLabel(item.date)}</time></div>${badge(item)}</div>
    <h3><button class="title-button" data-detail="${item.id}">${esc(item.title)}</button></h3><p class="subtitle">${esc(item.subtitle)}</p><p class="description">${esc(item.summary)}</p>
    <div class="card-meta"><span>◷ ${esc(item.style)}</span><span>◇ ${esc(item.level)}</span></div>
    ${matching ? `<p class="skill-match ${matching.status}">${esc(matching.label)}${matching.missing.length ? ` · ${matching.missing.map(r => `${esc(r.skill)} ${r.actual}/${r.required}`).join(', ')}` : ''}<small>Quest prerequisites and equipment are not checked.</small></p>` : ''}
    ${item.tags.includes('drops') ? `<div class="reward-line"><span>ON THE HORIZON</span> ${esc(item.rewards.join(' · '))}</div>` : ''}
    <div class="card-bottom"><button class="text-button" data-detail="${item.id}">See where to start <span>↗</span></button><button class="save-button ${saved ? 'saved' : ''}" data-save="${item.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove' : 'Save'} ${esc(item.title)} ${saved ? 'from' : 'to'} my adventures">${saved ? '✓ Saved' : '+ Save'}</button></div>
    <label class="done-label"><input type="checkbox" data-done="${item.id}" ${done ? 'checked' : ''}> I’ve explored this</label>
  </article>`;
}
function renderRoutines() {
  renderDailyScape(state.game, query);
}
function render() {
  document.body.dataset.view=view;
  $('#home').hidden=view!=='home';
  $('#progression').hidden=view!=='progression';
  $('#discoveries').hidden=['home','progression'].includes(view);
  $('#saved-path-back').hidden=view!=='plan';
  $('#active-profile').textContent=dailyProfile().label==='Guest checklist'?'Guest · choose character':dailyProfile().label;
  $('#catchup-sidebar').hidden=view!=='discover';
  $('#discoveries').before($('#catchup-sidebar'));
  $('#stats').hidden=true;
  $('#character-bar').hidden=true;
  $('#about').hidden=['home','progression'].includes(view);
  $('#catchup-feedback').hidden = true;
  const allNew = filterUpdates(updates, options({ view: 'discover', category: 'all', query: '', hideDone: false, includeEnded: false }));
  const selected = filterUpdates(updates, options()).filter(item => !hideSkillGaps || currentCharacter()?.game !== item.game || skillMatch(requirementsById[item.id], currentCharacter().snapshot).status !== 'training');
  document.querySelectorAll('[data-game]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.game === state.game)));
  document.querySelectorAll('[data-view]').forEach(button => { button.classList.toggle('active', button.dataset.view === view); if (button.dataset.view === view) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  $('#last-played').value = state.dates[state.game];
  $('#return-date-label').textContent = `Last played ${dateLabel(state.dates[state.game])}`;
  $('#edit-return-date').setAttribute('aria-label', `Edit last-played date: ${dateLabel(state.dates[state.game])}`);
  $('#last-played').max = today;
  const postCount = archivePosts.filter(post => post.game === state.game && post.date > state.dates[state.game] && post.date <= today).length;
  $('#date-summary').textContent = `${postCount} update posts and ${allNew.length} curated highlights after ${dateLabel(state.dates[state.game])}. Archive begins ${dateLabel(archiveMeta.starts[state.game])}.`;
  $('#edition-label').textContent = gameLabel().toUpperCase();
  $('#hero-period').textContent = `Your adventure log starts ${dateLabel(state.dates[state.game])}`;
  $('#nav-count').textContent = state.saved.length;
  $('#category-filters').innerHTML = categories.map(c => `<button data-category="${c.id}" aria-pressed="${category === c.id}" class="${category === c.id ? 'active' : ''}"><span>${c.icon}</span>${c.name}<b>${c.id === 'all' ? allNew.length : allNew.filter(i => i.tags.includes(c.id)).length}</b></button>`).join('');
  $('#category-filters').hidden = view === 'routines';
  $('.filter-heading').hidden = view === 'routines';
  $('#stats').innerHTML = [
    [allNew.length, 'curated catch-up highlights', '◈'],
    [allNew.filter(i => i.tags.includes('quests')).length, 'stories waiting to be told', '⌘'],
    [allNew.filter(i => i.tags.includes('drops')).length, 'new reward chases', '◇'],
    [postCount, 'dated game-update posts', '✦'],
  ].map(([count, text, icon]) => `<div><span>${icon}</span><strong>${count}</strong><small>${text}</small></div>`).join('');
  $('#results-title').innerHTML = view === 'plan' ? 'Your next adventures<span class="gold">.</span>' : view === 'routines' ? 'Your DailyScape<span class="gold">.</span>' : `New since ${dateLabel(state.dates[state.game])}<span class="gold">.</span>`;
  $('#results-kicker').textContent = view === 'plan' ? 'SAVED ON THIS DEVICE' : view === 'routines' ? 'DAILIES · WEEKLIES · MONTHLIES' : 'YOUR PERSONAL CATCH-UP';
  $('#result-summary').textContent = view === 'plan' ? `${gameLabel()} · Your saved list, including entries outside the selected date range.` : view === 'routines' ? `${gameLabel()} · Rewards, reset timers and your completion journal` : `${gameLabel()} · Released after ${dateLabel(state.dates[state.game])} · Curated highlights`;
  $('#search').placeholder = view === 'routines' ? 'Search activities, rewards and requirements…' : 'Search quests, bosses, drops…';
  $('#search').setAttribute('aria-label', view === 'routines' ? 'Search DailyScape activities and journal' : 'Search updates');
  $('#export-plan').hidden = view === 'routines';
  $('#sort').hidden = view === 'routines';
  $('#hide-done').closest('label').hidden = view === 'routines';
  $('#include-ended').closest('label').hidden = view !== 'discover';
  $('#hide-skill-gaps').closest('label').hidden = view === 'routines' || !currentCharacter();
  const warnings = [];
  if (view === 'discover' && state.dates[state.game] < catalog.coverageStart) warnings.push(`Browse the open update archive below for older content. Curated highlight cards begin ${dateLabel(catalog.coverageStart)}; the update-post archive begins ${dateLabel(archiveMeta.starts[state.game])}.${state.game === 'osrs' && state.dates[state.game] < archiveMeta.starts.osrs ? ' Old School launched in 2013; pre-launch dates include its full available history.' : ''}`);
  if (view === 'discover' && today > catalog.reviewed) warnings.push(`Catalog last reviewed ${dateLabel(catalog.reviewed)}. Releases after that date may be missing; check official news for the latest.`);
  if (!storageAvailable) warnings.push('Browser storage is unavailable. Your progress may not persist after this session.');
  $('#notice').hidden = !warnings.length;
  $('#notice').textContent = warnings.join(' ');
  $('#coverage-note').textContent = `Update index reviewed ${dateLabel(archiveMeta.reviewed)}; archive begins ${dateLabel(archiveMeta.starts[state.game])}. It includes the available game-update posts listed by the Wiki, not every undocumented change. Curated major highlights begin ${dateLabel(catalog.coverageStart)}. Skill comparisons use the selected character’s latest hiscores snapshot and only explicitly mapped requirements. Other requirements and quest completion remain unknown. Suggested starting points are editorial picks.`;
  renderArchive();
  $('#news-link').href = `https://secure.runescape.com/m=news/archive${state.game === 'osrs' ? '?oldschool=1' : ''}`;
  $('#wiki-link').href = state.game === 'osrs' ? 'https://oldschool.runescape.wiki/' : 'https://runescape.wiki/';
  if (view === 'home') renderHome({game:state.game,since:state.dates[state.game],profile:dailyProfile().key});
  else if (view === 'progression') renderProgression(state.game);
  else if (view === 'routines') renderRoutines();
  else {
    $('#shown-count').textContent = `${selected.length} ${selected.length === 1 ? 'discovery' : 'discoveries'}`;
    $('#results').innerHTML = selected.length ? selected.map(card).join('') : `<div class="empty-state"><span>◇</span><h3>${view === 'plan' ? 'Your next chapter is unwritten.' : 'No discoveries in this view.'}</h3><p>${view === 'plan' ? 'Save an adventure from Discover to build your own return plan.' : 'Try another category, clear your search, or change your last-played date. This curated catalog is not a complete update archive.'}</p><button class="outline-button" id="reset-view">${view === 'plan' ? 'Explore updates ↗' : 'Clear filters'}</button></div>`;
  }
}
function showDetail(id) {
  const item = updates.find(i => i.id === id);
  if (!item) return;
  $('#detail-content').innerHTML = `<button class="dialog-close" aria-label="Close adventure details">×</button><span class="detail-symbol">${iconFor(item)}</span><p class="eyebrow">${esc(gameLabel())} / ${dateLabel(item.date)}</p><h2 id="dialog-title">${esc(item.title)}</h2>${badge(item)}<p class="detail-summary">${esc(item.summary)}</p><h3>Your first step</h3><p>${esc(item.start)}</p><h3>Before you go</h3><p>${esc(item.requirements)}</p><h3>${isEnded(item, today) ? 'Event context' : 'What’s waiting for you'}</h3><ul>${item.rewards.map(r => `<li>${esc(r)}</li>`).join('')}</ul><p class="detail-note">${currentCharacter()?.snapshot ? "Public skill stats are imported; quest completion and equipment remain unknown." : "No character stats are selected."} Reward names are goals, not guaranteed drops; check the guide for odds and current requirements.${item.dateNote ? ` Date note: ${esc(item.dateNote)}.` : ''}</p><div class="detail-actions"><a class="primary-button" href="${esc(item.guide)}" target="_blank" rel="noopener noreferrer">Open the guide ↗</a><button class="outline-button" data-save="${item.id}" aria-pressed="${state.saved.includes(item.id)}">${state.saved.includes(item.id) ? '✓ Saved · remove' : '+ Save adventure'}</button></div><a class="source-citation" href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Release source / date reference ↗</a>`;
  $('#detail').setAttribute('aria-labelledby', 'dialog-title');
  if (!$('#detail').open) $('#detail').showModal();
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.game) { state.game = button.dataset.game; selectCharacterForGame(state.game); category = 'all'; query = ''; $('#search').value = ''; persist(); syncUrl(); render(); }
  if (button.dataset.view) { view = button.dataset.view; category = 'all'; query = ''; $('#search').value = ''; syncUrl(); render(); $('#content').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (button.dataset.openRoutine) { const activity=routines.find(activity=>activity.id===button.dataset.openRoutine); if(activity){view='routines';revealDailyActivity();query=activity.title;$('#search').value=query;syncUrl();render();$('#discoveries').scrollIntoView({behavior:'smooth',block:'start'});} }
  if (button.dataset.category || button.dataset.path) { category = button.dataset.category || button.dataset.path; view = 'discover'; render(); if (button.dataset.path) $('#discoveries').scrollIntoView({ behavior: 'smooth' }); else document.querySelector(`[data-category="${category}"]`)?.focus(); }
  if (button.dataset.detail) showDetail(button.dataset.detail);
  if (button.classList.contains('dialog-close')) $('#detail').close();
  if (button.dataset.save) {
    const id = button.dataset.save;
    const saved = state.saved.includes(id);
    state.saved = saved ? state.saved.filter(value => value !== id) : [...state.saved, id];
    persist(); render(); if ($('#detail').open) showDetail(id);
    toast(saved ? 'Removed from your adventures.' : 'Saved to My adventures. Your next chapter is waiting.');
  }
  if (button.id === 'reset-view') { view = 'discover'; category = 'all'; query = ''; hideDone = false; $('#search').value = ''; $('#hide-done').checked = false; render(); }
});
function changeLastPlayed(event, force = false) {
  const value = event.target.value;
  if (!validDate(value) || value < '2001-01-04' || value > today) {
    // Native date inputs emit incomplete values while a user types. Wait for
    // commitment before restoring invalid input; never replace a partial edit.
    if (event.type === 'change' || force) { event.target.value = state.dates[state.game]; toast('Choose a valid date between January 4, 2001 and today.'); }
    return;
  }
  if (value === state.dates[state.game] && !force) return;
  const previousIds = filterUpdates(updates, options({ view: 'discover', category: 'all', query: '', hideDone: false, includeEnded: false })).map(item => item.id).sort().join('|');
  state.dates[state.game] = value;
  view = 'discover'; category = 'all'; query = ''; sort = 'newest';
  hideDone = false; hideSkillGaps = false; includeEnded = false;
  $('#search').value = ''; $('#sort').value = 'newest';
  for (const selector of ['#hide-done', '#hide-skill-gaps', '#include-ended']) $(selector).checked = false;
  persist(); syncUrl(); render();
  const next = filterUpdates(updates, options());
  const same = previousIds === next.map(item => item.id).sort().join('|');
  $('#catchup-feedback').hidden = false;
  $('#catchup-feedback').textContent = `Catch-up updated: ${next.length} highlights and ${matchingPosts().length} dated update posts after ${dateLabel(value)}. ${value < catalog.coverageStart ? 'The update archive is open below and includes the older history. Curated highlight cards cover 2023 onward.' : same ? 'These dates contain the same curated highlights; browse the update-post archive for smaller changes.' : 'The list below now shows this date range, newest first.'}`;
}
$('#archive-more').addEventListener('click', () => { archiveLimit += 25; renderArchive(); });
$('#edit-return-date').addEventListener('click', () => {
  $('#return-date-input').value = state.dates[state.game];
  $('#return-date-input').max = today;
  $('#return-date-game').textContent = gameLabel();
  $('#return-date-dialog').showModal();
  $('#return-date-input').focus();
});
$('#cancel-return-date').addEventListener('click', () => $('#return-date-dialog').close());
$('#return-date-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const value = $('#return-date-input').value;
  if (!validDate(value) || value < '2001-01-04' || value > today) return;
  $('#return-date-dialog').close();
  changeLastPlayed({ target: $('#return-date-input'), type: 'change' }, true);
});
$('#last-played').addEventListener('input', changeLastPlayed);
$('#last-played').addEventListener('change', changeLastPlayed);
$('#refresh-catchup').addEventListener('click', () => changeLastPlayed({ target: $('#last-played'), type: 'change' }, true));
$('#last-played').addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); changeLastPlayed({ target: event.target, type: 'change' }, true); }
});
$('#search').addEventListener('input', event => { query = event.target.value; render(); });
$('#sort').addEventListener('change', event => { sort = event.target.value; render(); });
$('#hide-done').addEventListener('change', event => { hideDone = event.target.checked; render(); });
$('#include-ended').addEventListener('change', event => { includeEnded = event.target.checked; render(); });
$('#hide-skill-gaps').addEventListener('change', event => { hideSkillGaps = event.target.checked; render(); });
document.addEventListener('change', event => {
  if (!event.target.dataset.done) return;
  const id = event.target.dataset.done;
  state.completed = event.target.checked ? [...new Set([...state.completed, id])] : state.completed.filter(value => value !== id);
  persist(); render();
});
$('#detail').addEventListener('click', event => { if (event.target === $('#detail')) { const r = $('#detail').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('#detail').close(); } });
$('#export-plan').addEventListener('click', () => {
  const saved = updates.filter(i => state.saved.includes(i.id));
  if (!saved.length) { toast('Save an adventure first, then export your plan.'); return; }
  const text = `# My RuneReturn adventure plan\n\nExported ${today}\n\n` + saved.map(i => `- [${state.completed.includes(i.id) ? 'x' : ' '}] ${i.title} (${i.game.toUpperCase()})\n  - Start: ${i.start}\n  - Guide: ${i.guide}\n`).join('\n');
  const blobUrl = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a'); a.href = blobUrl; a.download = 'my-runereturn-plan.md'; a.click(); setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  toast('Your adventure plan has been exported.');
});
initDailyScape({getProfile: dailyProfile, getLegacyChecks: () => state.routineChecks, isVisible: () => view === 'routines', toast, clearSearch: () => { query=''; $('#search').value=''; }});
initHome({context:()=>({candidates:dailyPlanningContext(state.game),stories:filterUpdates(updates,options({view:'discover',category:'quests',query:'',hideDone:true,sort:'recommended'}))})});
initProgression({getProfile:dailyProfile,getCharacter:currentCharacter,isVisible:()=>view==='progression',toast});
syncUrl(); render();
initCharacters({
  getGame: () => state.game,
  onChange: character => {
    let guest;
    try { guest = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* session-only fallback */ }
    const next = cleanState(character ? character.progress : guest, updates, routines, fallback, today);
    if (character) state.game = character.game;
    state.dates = next.dates; state.saved = next.saved; state.completed = next.completed; state.routineChecks = next.routineChecks;
    syncUrl(); render();
  },
});
