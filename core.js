export const todayUtc = (now = new Date()) => now.toISOString().slice(0, 10);
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
export function isEnded(item, today) { return Boolean(item.endDate && item.endDate <= today); }
export function filterUpdates(items, options) {
  const { game, since, today, category = 'all', query = '', includeEnded = false, hideDone = false, completed = [], saved = [], view = 'discover', sort = 'recommended' } = options;
  return items.filter(item => item.game === game && item.date <= today &&
    (view === 'plan' ? saved.includes(item.id) : item.date > since) &&
    (view === 'plan' || includeEnded || !isEnded(item, today)) &&
    (category === 'all' || item.tags.includes(category)) &&
    (!hideDone || !completed.includes(item.id)) &&
    `${item.title} ${item.summary} ${item.rewards.join(' ')} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a, b) => sort === 'newest' ? b.date.localeCompare(a.date) : sort === 'oldest' ? a.date.localeCompare(b.date) : b.priority - a.priority || b.date.localeCompare(a.date));
}
export function routinePeriod(cadence, now = new Date()) {
  if (cadence === 'manual') return 'manual';
  if (cadence === 'monthly') return todayUtc(now).slice(0, 7);
  const day = new Date(`${todayUtc(now)}T00:00:00Z`);
  // RuneScape weekly reset is Wednesday 00:00 UTC.
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 4) % 7);
  return todayUtc(day);
}
export function cleanState(raw, items, routines, fallbackDate, today) {
  const state = raw && typeof raw === 'object' ? raw : {};
  const ids = new Set(items.map(item => item.id));
  const list = key => Array.isArray(state[key]) ? [...new Set(state[key].filter(id => ids.has(id)))].slice(0, 500) : [];
  const date = key => validDate(state.dates?.[key]) && state.dates[key] >= '2001-01-04' && state.dates[key] <= today ? state.dates[key] : fallbackDate;
  const routineChecks = {};
  for (const routine of routines) {
    const value = state.routineChecks?.[routine.id];
    if (typeof value === 'string' && value.length <= 10) routineChecks[routine.id] = value;
  }
  return { game: state.game === 'rs3' ? 'rs3' : 'osrs', dates: { osrs: date('osrs'), rs3: date('rs3') }, saved: list('saved'), completed: list('completed'), routineChecks };
}
export const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
