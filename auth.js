import { config } from './config.js';
export let client = null;
export async function initializeAuth() {
  if (!config.supabaseUrl || !config.supabasePublishableKey) return null;
  const url = new URL(config.supabaseUrl);
  if (url.protocol !== 'https:') throw new Error('Account configuration needs an HTTPS Supabase URL.');
  const key = config.supabasePublishableKey;
  if (key.startsWith('sb_secret_')) throw new Error('A server secret cannot be used in browser configuration.');
  if (key.includes('.')) {
    let role;
    try { role = JSON.parse(atob(key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/'))).role; } catch { /* rejected below */ }
    if (role !== 'anon') throw new Error('Only a public publishable key or legacy anon key belongs in browser configuration.');
  } else if (!key.startsWith('sb_publishable_')) throw new Error('Use the project’s public publishable key.');
  const { createClient } = await import('./vendor/supabase.js');
  client = createClient(config.supabaseUrl, key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storageKey: 'runereturn.auth.v1' } });
  return client;
}
export function authRedirect() {
  const url = new URL(location.href);
  url.search = ''; url.hash = '';
  return url.href;
}
