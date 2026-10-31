import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { createCharacterService } from '../_shared/character-service.js';
const lookup = createCharacterService();
const limits = new Map<string, { start: number; count: number }>();
const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean);
Deno.serve(async request => {
  const origin = request.headers.get('origin') || '';
  const headers = { 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : '', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin', 'Cache-Control': 'no-store' };
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (!allowed.includes(origin)) return json({ error: 'Origin is not allowed.' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const token = request.headers.get('authorization') || '';
  if (!token.startsWith('Bearer ')) return json({ error: 'Sign in to look up a character.' }, 401);
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token.slice(7));
  if (error || !data.user) return json({ error: 'Your session expired. Sign in again.' }, 401);
  const now = Date.now(), id = data.user.id;
  let limit = limits.get(id);
  if (!limit || now - limit.start >= 60000) { limit = { start: now, count: 0 }; if (limits.size >= 1000) limits.delete(limits.keys().next().value!); limits.set(id, limit); }
  if (++limit.count > 12) return json({ error: 'Too many lookups. Wait a minute and retry.' }, 429);
  try {
    const text = await request.text();
    if (text.length > 1024) return json({ error: 'Request too large.' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'Expected a JSON object.' }, 400); }
    if (!body || Array.isArray(body) || typeof body !== 'object') return json({ error: 'Expected a character.' }, 400);
    return json(await lookup(body));
  } catch (error) {
    const e = error as Error & { status?: number };
    return json({ error: e.status ? e.message : 'Could not retrieve character stats. Check the name and mode or retry later.' }, e.status || 400);
  }
});
