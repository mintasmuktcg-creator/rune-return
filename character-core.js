export const modes = {
  osrs: { normal: 'Standard', ironman: 'Ironman', hardcore: 'Hardcore Ironman', ultimate: 'Ultimate Ironman' },
  rs3: { normal: 'Standard' },
};
export function normalizeName(value) {
  if (typeof value !== 'string') throw new Error('Enter a character display name.');
  const name = value.replaceAll('_', ' ').trim().replace(/ +/g, ' ');
  if (!/^[A-Za-z0-9 -]{1,12}$/.test(name)) throw new Error('Use a 1–12 character display name containing letters, numbers, spaces or hyphens.');
  return name;
}
export function identity(game, mode, name) {
  if (!Object.hasOwn(modes, game) || !Object.hasOwn(modes[game], mode)) throw new Error('Choose a supported game and hiscores mode.');
  return `${game}:${mode}:${normalizeName(name).toLowerCase()}`;
}
const number = (value, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= 0 && value <= max ? value : null;
const skillName = name => ({ hitpoints: 'constitution', runecraft: 'runecrafting' })[name.toLowerCase()] || name.toLowerCase();
export function normalizeHiscores(payload, { game, mode, name, fetchedAt = new Date().toISOString() }) {
  identity(game, mode, name);
  if (typeof payload?.name === 'string' && normalizeName(payload.name).toLowerCase() !== normalizeName(name).toLowerCase()) throw new Error('Hiscores returned a different character name. Check whether the character was renamed.');
  if (!payload || !Array.isArray(payload.skills) || !payload.skills.length || payload.skills.length > 100 || !Array.isArray(payload.activities) || payload.activities.length > 1000) throw new Error('The hiscores response format was not recognised.');
  const skills = {};
  let overall = null;
  for (const row of payload.skills) {
    if (typeof row?.name !== 'string' || !/^[A-Za-z ]{1,40}$/.test(row.name)) continue;
    const value = { level: number(row.level, row.name === 'Overall' ? 10000 : 200), xp: number(row.xp), rank: number(row.rank) };
    if (row.name === 'Overall') overall = value;
    else skills[skillName(row.name)] = value;
  }
  if (!overall || Object.keys(skills).length < 5) throw new Error('The hiscores response did not include usable skills.');
  const activities = payload.activities.filter(row => typeof row?.name === 'string' && row.name.length <= 100)
    .map(row => ({ name: row.name, score: number(row.score), rank: number(row.rank) }));
  return { game, mode, name: normalizeName(name), fetchedAt, source: 'Jagex public hiscores', overall, skills, activities, questStatus: 'unavailable', ownership: 'unverified' };
}
export function sanitizeSnapshot(snapshot, character) {
  if (!snapshot || snapshot.game !== character.game || snapshot.mode !== character.mode || typeof snapshot.fetchedAt !== 'string' || !Number.isFinite(Date.parse(snapshot.fetchedAt))) return null;
  try {
    if (normalizeName(snapshot.name).toLowerCase() !== character.name.toLowerCase()) return null;
    // Reuse the exact parser for snapshots from browser storage or cloud JSON.
    return normalizeHiscores({ skills: [{ name: 'Overall', ...snapshot.overall }, ...Object.entries(snapshot.skills || {}).map(([name, values]) => ({ name, ...values }))], activities: snapshot.activities }, { ...character, fetchedAt: snapshot.fetchedAt });
  } catch { return null; }
}
export function cleanCharacters(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, 20).flatMap(row => {
    try {
      if (typeof row?.id !== 'string' || !/^[a-zA-Z0-9-]{1,64}$/.test(row.id)) return [];
      const character = { id: row.id, game: row.game, mode: row.mode, name: normalizeName(row.name) };
      const key = identity(character.game, character.mode, character.name);
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ ...character, snapshot: sanitizeSnapshot(row.snapshot, character), progress: row.progress && typeof row.progress === 'object' ? row.progress : null }];
    } catch { return []; }
  });
}
export function skillMatch(requirements, snapshot, now = Date.now()) {
  if (!requirements || !Object.keys(requirements).length) return { status: 'unknown', label: 'Requirements not yet mapped', missing: [] };
  if (!snapshot) return { status: 'unknown', label: 'Import stats to compare', missing: [] };
  if (now - Date.parse(snapshot.fetchedAt) > 86400000 || Date.parse(snapshot.fetchedAt) > now + 300000) return { status: 'stale', label: 'Refresh stats to compare', missing: [] };
  const missing = [];
  let unknown = false;
  for (const [skill, level] of Object.entries(requirements)) {
    const actual = snapshot.skills[skill]?.level;
    if (actual == null) unknown = true;
    else if (actual < level) missing.push({ skill, actual, required: level });
  }
  if (missing.length) return { status: 'training', label: 'Needs training', missing };
  if (unknown) return { status: 'unknown', label: 'Some skill data unavailable', missing: [] };
  return { status: 'met', label: 'Listed skill requirements met', missing: [] };
}
