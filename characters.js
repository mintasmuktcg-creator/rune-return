import { modes, normalizeName, identity, cleanCharacters, sanitizeSnapshot } from './character-core.js';
import { escapeHtml as esc } from './core.js';
import { initializeAuth, client, authRedirect } from './auth.js';
import { config } from './config.js';

let characters = [], activeId = null, session = null, ready = true, cloudReady = false;
let generation = 0, saveChain = Promise.resolve(), message = '', busy = false;
let callbacks;
const $ = selector => document.querySelector(selector);
const storageKey = () => `runereturn.characters.v1.${session?.user.id || 'guest'}`;
const active = () => characters.find(c => c.id === activeId) || null;
function readLocal() {
  try { const value = JSON.parse(localStorage.getItem(storageKey()) || '{}'); characters = cleanCharacters(value.characters); activeId = characters.some(c => c.id === value.activeId) ? value.activeId : null; }
  catch { characters = []; activeId = null; message = 'Device storage unavailable. Character changes may last only for this visit.'; }
}
function writeLocal() {
  try { localStorage.setItem(storageKey(), JSON.stringify({ characters, activeId })); }
  catch { message = 'Device storage unavailable. Export your plan before leaving.'; }
}
function changed() { writeLocal(); callbacks.onChange(active()); renderBar(); }
function cloudSave(character) {
  if (!session || !cloudReady) return;
  const owner = session.user.id, version = generation;
  const row = { owner_id: owner, id: character.id, game: character.game, mode: character.mode, name: character.name, snapshot: character.snapshot, progress: character.progress };
  saveChain = saveChain.then(async () => {
    if (version !== generation) return;
    const { error } = await client.from('rr_characters').upsert(row, { onConflict: 'owner_id,id' });
    if (version !== generation) return;
    message = error ? 'Cloud save failed. The device copy is kept; use “Retry cloud saves”.' : 'Character saved to your RuneReturn account.';
    renderBar();
    if ($('#account-dialog').open) renderDialog();
  }).catch(() => { if (version === generation) { message = 'Cloud save unavailable. Device copy kept; retry when connected.'; renderBar(); } });
}
export function updateCharacterProgress(progress) {
  const character = active();
  if (!character) return false;
  character.progress = structuredClone(progress); writeLocal(); cloudSave(character); return true;
}
export function currentCharacter() { return active(); }
export function selectCharacterForGame(game) {
  if (active()?.game === game) return;
  activeId = null; changed();
}
function renderBar() {
  const selected = active();
  const snapshot = selected?.snapshot;
  $('#account-button').textContent = session ? 'My account & characters' : 'Characters & sign in';
  $('#character-bar').innerHTML = `<div><span class="eyebrow">YOUR CHARACTER</span><strong>${selected ? esc(selected.name) : 'Make this adventure yours.'}</strong><small>${selected ? `${selected.game.toUpperCase()} · ${esc(modes[selected.game][selected.mode])} · Public lookup, ownership unverified` : 'Connect a display name to compare your skills with new content.'}</small></div><div class="character-bar-actions">${snapshot ? `<span class="character-total">${snapshot.overall.level?.toLocaleString() || '—'}<small>total level</small></span>` : ''}<button class="outline-button" data-account-open>${selected ? 'Stats & characters' : '+ Add character'}</button></div>`;
}
function renderDialog() {
  const selected = active();
  const snapshot = selected?.snapshot;
  const guest = session ? (() => { try { return cleanCharacters(JSON.parse(localStorage.getItem('runereturn.characters.v1.guest') || '{}').characters); } catch { return []; } })() : [];
  const authStatus = session ? `<div class="account-status"><strong>Signed in as ${esc(session.user.email || 'RuneReturn player')}</strong><button class="text-button" data-signout>Sign out</button></div><p class="account-hint">Cloud sync saves characters and their adventure checklists. Display names do not prove game-account ownership.</p>${guest.length ? `<button class="outline-button" data-import-guest ${!cloudReady ? 'disabled' : ''}>Import ${guest.length} device character${guest.length === 1 ? '' : 's'} into this account</button>` : ''}<button class="text-button" data-retry-cloud>Retry cloud saves / connection</button>` :
    client ? `<p class="account-hint">Sign into RuneReturn to sync characters across devices. This is separate from your Jagex account.</p><form id="signin-form" class="account-form"><label>Email address<input type="email" name="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><button class="primary-button" ${busy ? 'disabled' : ''}>Email me a sign-in link</button></form><p class="account-hint">Your device characters stay local until you explicitly import them after signing in. Open the sign-in link in this browser.</p>` : `<div class="account-setup"><strong>Cloud accounts are awaiting setup.</strong><p>A dedicated RuneReturn Supabase project hasn’t been configured yet. ${["127.0.0.1", "localhost"].includes(location.hostname) ? "You can add characters and use live stats on this local preview now." : "You can save display names on this device. Live stat imports and cloud sync will become available after backend setup."} Device profiles are not a login.</p></div>`;
  const game = callbacks.getGame();
  $('#account-content').innerHTML = `<button class="dialog-close" data-account-close aria-label="Close account and characters">×</button><p class="eyebrow">YOUR RUNERETURN ACCOUNT</p><h2>Meet your adventurers.</h2>${authStatus}<p class="account-message" role="status">${esc(message)}</p><h3>Saved characters</h3><label class="account-label">Active character<select id="active-character" ${!ready ? 'disabled' : ''}><option value="">Browse without a character</option>${characters.map(c => `<option value="${c.id}" ${activeId === c.id ? 'selected' : ''}>${esc(c.name)} · ${c.game.toUpperCase()} · ${esc(modes[c.game][c.mode])}</option>`).join('')}</select></label><p class="account-hint">Each character has its own adventure checklist. Browsing without a character restores your guest checklist.</p>
    <form id="add-character" class="account-form"><label>Game<select name="game" id="character-game"><option value="osrs" ${game === 'osrs' ? 'selected' : ''}>Old School RuneScape</option><option value="rs3" ${game === 'rs3' ? 'selected' : ''}>RuneScape 3</option></select></label><label>Display name<input name="name" autocomplete="off" required maxlength="12" placeholder="Your character name"></label><label>Hiscores board<select name="mode" id="character-mode">${Object.entries(modes[game]).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select></label><button class="primary-button" ${!ready || characters.length >= 20 || busy ? 'disabled' : ''}>Add & import stats</button></form><p class="account-hint">Up to 20 characters. Only public data is fetched. Never enter a Jagex password.</p>
    ${selected ? `<div class="character-detail"><div class="account-status"><h3>${esc(selected.name)} <small>${selected.game.toUpperCase()}</small></h3><button class="outline-button" data-refresh-character ${busy || !ready ? 'disabled' : ''}>${busy ? 'Importing…' : 'Refresh stats'}</button></div>${snapshot ? `<p class="account-hint">${esc(snapshot.source)} · Fetched ${new Date(snapshot.fetchedAt).toLocaleString()}<br>This is fetch time, not the character’s last login or the game’s update time. Unranked values stay unknown.</p><div class="skill-grid">${Object.entries(snapshot.skills).map(([name, skill]) => `<div><span>${esc(name)}</span><strong>${skill.level ?? '—'}</strong><small>${skill.xp == null ? 'XP unknown' : `${skill.xp.toLocaleString()} XP`}</small></div>`).join('')}</div><details class="activity-list"><summary>Hiscores activities & reported boss scores (${snapshot.activities.filter(a => a.score !== null).length})</summary><dl>${snapshot.activities.filter(a => a.score !== null).map(a => `<div><dt>${esc(a.name)}</dt><dd>${a.score.toLocaleString()}</dd></div>`).join('')}</dl></details>` : '<p class="account-hint">No imported snapshot yet. Refresh to try the public hiscores.</p>'}<p class="account-hint">Quest completion, bank, equipment and exact last-login data are not connected. We do not infer them from levels or boss scores.</p><button class="danger-button" data-remove-character ${!ready || busy ? 'disabled' : ''}>Remove this saved character</button></div>` : ''}`;
}
async function lookup(character) {
  let endpoint = config.characterApiUrl;
  const headers = { 'Content-Type': 'application/json' };
  if (!endpoint && ['127.0.0.1', 'localhost'].includes(location.hostname)) endpoint = new URL('./api/character', document.baseURI).href;
  if (!endpoint && config.supabaseUrl) endpoint = `${config.supabaseUrl}/functions/v1/character-lookup`;
  if (!endpoint) throw new Error('Character lookup needs the RuneReturn backend configured for this hosted site.');
  const local = new URL(endpoint, location.href).origin === location.origin && ['127.0.0.1', 'localhost'].includes(location.hostname);
  if (!local) {
    if (!session) throw new Error('Sign into RuneReturn to refresh a character on the hosted site.');
    const result = await client.auth.getSession();
    if (!result.data.session) throw new Error('Your sign-in expired. Sign in again to refresh.');
    headers.Authorization = `Bearer ${result.data.session.access_token}`;
    headers.apikey = config.supabasePublishableKey;
  }
  const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ game: character.game, mode: character.mode, name: character.name }), signal: AbortSignal.timeout(18000) });
  let result;
  try { result = await response.json(); } catch { throw new Error('The character service did not return a valid response.'); }
  if (!response.ok) throw new Error(result.error || 'Character lookup failed. Try again later.');
  const snapshot = sanitizeSnapshot(result, character);
  if (!snapshot) throw new Error('Character data did not match the requested profile. Previous stats were kept.');
  return snapshot;
}
async function refresh(character) {
  busy = true; message = 'Reading public hiscores…'; renderDialog();
  const version = generation;
  try {
    const snapshot = await lookup(character);
    if (version !== generation || !characters.includes(character)) return;
    character.snapshot = snapshot; message = 'Stats imported. Quest completion remains unknown.'; cloudSave(character); changed();
  } catch (error) { if (version === generation) message = error.message; }
  finally { busy = false; renderDialog(); }
}
async function changeSession(next) {
  if (next?.user.id === session?.user.id && (next === null) === (session === null)) { session = next; return; }
  const version = ++generation;
  session = next; cloudReady = false; readLocal(); ready = !session;
  const desiredActiveId = activeId;
  if (session) activeId = null;
  changed(); renderDialog();
  if (!session) { ready = true; return; }
  message = 'Loading your account’s characters…'; renderDialog();
  const { data, error } = await client.from('rr_characters').select('id,game,mode,name,snapshot,progress').eq('owner_id', session.user.id).limit(20);
  if (version !== generation) return;
  if (error) { message = 'Cloud characters could not load. Check the project setup or connection. Your cached copy is preserved and read-only until you retry.'; ready = false; }
  else { characters = cleanCharacters(data); activeId = characters.some(c => c.id === desiredActiveId) ? desiredActiveId : null; cloudReady = true; ready = true; message = 'Account connected. Device profiles are separate until imported.'; changed(); }
  renderDialog();
}
export async function initCharacters(hooks) {
  callbacks = hooks; readLocal(); renderBar();
  if (active()) callbacks.onChange(active());
  document.addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.id === 'account-button' || button.hasAttribute('data-account-open')) { renderDialog(); $('#account-dialog').showModal(); }
    if (button.hasAttribute('data-account-close')) $('#account-dialog').close();
    if (button.hasAttribute('data-refresh-character') && active() && ready && !busy) await refresh(active());
    if (button.hasAttribute('data-signout')) {
      if (busy) return;
      const { error } = await client.auth.signOut();
      if (error) { message = 'Sign-out failed. Please retry.'; renderDialog(); }
    }
    if (button.hasAttribute('data-remove-character') && active() && ready && !busy) {
      const id = activeId, version = generation; busy = true; renderDialog();
      await saveChain;
      const result = session ? await client.from('rr_characters').delete().eq('owner_id', session.user.id).eq('id', id) : { error: null };
      busy = false;
      if (version !== generation) return;
      if (result.error) message = 'Removal failed. Character and device copy were kept.';
      else { characters = characters.filter(c => c.id !== id); activeId = null; message = 'Saved character removed. This does not affect your game account.'; changed(); }
      renderDialog();
    }
    if (button.hasAttribute('data-import-guest') && session && cloudReady) {
      let guest = [];
      try { guest = cleanCharacters(JSON.parse(localStorage.getItem('runereturn.characters.v1.guest') || '{}').characters); } catch { /* no profiles */ }
      for (const row of guest) {
        if (characters.length >= 20) break;
        if (characters.some(c => identity(c.game, c.mode, c.name) === identity(row.game, row.mode, row.name))) continue;
        const imported = { ...row, id: crypto.randomUUID() }; characters.push(imported); cloudSave(imported);
      }
      changed(); renderDialog();
    }
    if (button.hasAttribute('data-retry-cloud') && session) {
      if (!cloudReady) { const previous = session; session = null; await changeSession(previous); }
      else characters.forEach(cloudSave);
    }
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'active-character') { activeId = event.target.value || null; changed(); renderDialog(); }
    if (event.target.id === 'character-game') $('#character-mode').innerHTML = Object.entries(modes[event.target.value]).map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
  });
  document.addEventListener('submit', async event => {
    if (!['add-character', 'signin-form'].includes(event.target.id)) return;
    event.preventDefault(); if (busy) return;
    const values = new FormData(event.target);
    if (event.target.id === 'signin-form') {
      busy = true; renderDialog();
      try {
        const { error } = await client.auth.signInWithOtp({ email: String(values.get('email')), options: { emailRedirectTo: authRedirect() } });
        message = error ? error.message : 'Check your email for your RuneReturn sign-in link. No game credentials are needed.';
      } catch { message = 'Could not request a sign-in link. Please retry.'; }
      busy = false; renderDialog(); return;
    }
    if (!ready) return;
    try {
      const game = String(values.get('game')), mode = String(values.get('mode')), name = normalizeName(String(values.get('name')));
      if (characters.length >= 20) throw new Error('Remove a character before adding another (20 maximum).');
      const existing = characters.find(c => identity(c.game, c.mode, c.name) === identity(game, mode, name));
      if (existing) { activeId = existing.id; changed(); message = 'That character is already saved.'; renderDialog(); return; }
      const character = { id: crypto.randomUUID(), game, mode, name, snapshot: null, progress: null };
      identity(game, mode, name); characters.push(character); activeId = character.id; cloudSave(character); changed(); await refresh(character);
    } catch (error) { message = error.message; renderDialog(); }
  });
  try {
    const auth = await initializeAuth();
    if (!auth) return;
    auth.auth.onAuthStateChange((_event, next) => { setTimeout(() => { changeSession(next).catch(() => { message = 'Account connection failed. Retry to reconnect.'; ready = false; renderDialog(); }); }, 0); });
    const result = await auth.auth.getSession();
    await changeSession(result.data.session);
  } catch (error) { message = `Account setup: ${error.message}`; }
  renderBar();
}
