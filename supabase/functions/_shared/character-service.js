import { identity, normalizeName, normalizeHiscores } from '../../../character-core.js';
const endpoints = {
  osrs: { normal: 'hiscore_oldschool', ironman: 'hiscore_oldschool_ironman', hardcore: 'hiscore_oldschool_hardcore_ironman', ultimate: 'hiscore_oldschool_ultimate' },
  rs3: { normal: 'hiscore' },
};
export function createCharacterService({ fetcher = fetch, now = () => Date.now() } = {}) {
  const cache = new Map();
  const pending = new Map();
  return async function lookup({ game, mode = 'normal', name }) {
    name = normalizeName(name);
    const key = identity(game, mode, name);
    if (cache.get(key)?.expires > now()) return cache.get(key).snapshot;
    if (pending.has(key)) return pending.get(key);
    if (pending.size >= 5) throw Object.assign(new Error('Hiscores are busy. Try again shortly.'), { status: 429 });
    const request = (async () => {
      const url = new URL(`https://secure.runescape.com/m=${endpoints[game][mode]}/index_lite.json`);
      url.searchParams.set('player', name);
      const response = await fetcher(url, { signal: AbortSignal.timeout(12000), redirect: 'error', headers: { Accept: 'application/json' } });
      if (response.status === 404) throw Object.assign(new Error('Character not found on this hiscores board. Check the spelling and mode; unranked characters may be absent.'), { status: 404 });
      if (!response.ok) throw Object.assign(new Error('Jagex hiscores are temporarily unavailable. Your saved stats have been kept.'), { status: 502 });
      const text = await response.text();
      if (text.length > 250000) throw new Error('Unexpectedly large hiscores response.');
      const snapshot = normalizeHiscores(JSON.parse(text), { game, mode, name, fetchedAt: new Date(now()).toISOString() });
      if (cache.size >= 100) cache.delete(cache.keys().next().value);
      cache.set(key, { expires: now() + 300000, snapshot });
      return snapshot;
    })();
    pending.set(key, request);
    try { return await request; } finally { pending.delete(key); }
  };
}
