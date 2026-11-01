const isoDay = date => date.toISOString().slice(0,10);
export function periodStart(cadence, now = new Date()) {
  const date = new Date(`${isoDay(now)}T00:00:00Z`);
  if (cadence === 'weekly') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 4) % 7);
  if (cadence === 'monthly') date.setUTCDate(1);
  return date.toISOString();
}
export function nextReset(cadence, now = new Date()) {
  const date = new Date(periodStart(cadence, now));
  if (cadence === 'monthly') date.setUTCMonth(date.getUTCMonth()+1);
  else date.setUTCDate(date.getUTCDate() + (cadence === 'weekly' ? 7 : 1));
  return date.toISOString();
}
export function activityStatus(activity, logs, now = new Date(), member = true, legacy = null) {
  const entries = logs.filter(log => log.activityId === activity.id && !log.undoneAt && !log.extra).sort((a,b) => b.at.localeCompare(a.at));
  const limit = !member && activity.freeLimit ? activity.freeLimit : activity.limit;
  const scheduled = activity.availableDay == null || now.getUTCDay() === activity.availableDay;
  let count = 0, resetAt = null;
  if (activity.reset === 'cooldown') {
    if (entries[0]) {
      const date = new Date(entries[0].at);
      if (activity.cooldownUtcDay) date.setUTCHours(0,0,0,0);
      resetAt = new Date(date.getTime() + activity.cooldownMinutes * 60000).toISOString();
      count = Date.parse(resetAt) > now.getTime() ? 1 : 0;
    }
  } else if (activity.reset !== 'manual') {
    const start = periodStart(activity.reset, now);
    count = entries.filter(log => log.at >= start && Date.parse(log.at) <= now.getTime()).length;
    resetAt = nextReset(activity.reset, now);
    const legacyPeriod = activity.reset === 'monthly' ? start.slice(0,7) : start.slice(0,10);
    if (!entries.length && legacy === legacyPeriod) count = limit;
  }
  return { count, limit, ready: scheduled && (activity.reset === 'manual' || count < limit), done: activity.reset !== 'manual' && count >= limit, scheduled, resetAt, lastAt: entries[0]?.at || null, legacy: !entries.length && count > 0 && Boolean(legacy) };
}
export function estimateReward(activity, override = {}, baseRate = 100000) {
  const value = key => Object.hasOwn(override,key) ? override[key] : (activity[key] ?? null);
  const gp = value('gp'), xp = value('xp'), bxp = value('bxp'), minutes = value('minutes');
  const rate = override.rate ?? baseRate;
  const xpTotal = (xp || 0) + (bxp || 0);
  const equivalent = xpTotal > 0 && rate > 0 ? xpTotal / rate * 60 : null;
  return { gp, xp, bxp, minutes, rate, equivalent, savedMinutes: equivalent == null ? null : equivalent - minutes, basis: override.note || activity.basis, custom: Object.keys(override).length > 0, scenario: !Object.keys(override).length && Boolean(activity.scenario) };
}
export function cleanJournal(raw, activities) {
  const ids = new Set(activities.map(a=>a.id));
  const journal = { version:1, logs:[], overrides:{}, pinned:[], rates:{osrs:50000,rs3:200000}, member:true, legacy:{} };
  if (!raw || typeof raw !== 'object') return journal;
  const number = (value,min,max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
  function values(row) {
    const result = {};
    for (const field of ['gp','xp','bxp','minutes','rate']) {
      if (!Object.hasOwn(row,field)) continue;
      const n = row[field];
      if (n === null && ['gp','xp','bxp'].includes(field)) result[field] = null;
      else if (number(n,field==='gp' ? -1e12 : field==='rate' ? 1 : 0,field==='minutes' ? 100000 : 1e12)) result[field] = n;
    }
    if (typeof row.note === 'string') result.note = row.note.slice(0,1200);
    return result;
  }
  const seen = new Set();
  for (const row of Array.isArray(raw.logs) ? raw.logs : []) {
    if (!row || !ids.has(row.activityId) || typeof row.id !== 'string' || row.id.length > 80 || seen.has(row.id) || !Number.isFinite(Date.parse(row.at))) continue;
    const at = new Date(row.at).toISOString();
    if (at < '2001-01-04T00:00:00.000Z' || Date.parse(at) > Date.now()+60000) continue;
    const snapshot = values(row.snapshot && typeof row.snapshot === 'object' ? row.snapshot : {});
    if (typeof row.snapshot?.basis === 'string') snapshot.basis = row.snapshot.basis.slice(0,1200);
    seen.add(row.id);
    journal.logs.push({ id:row.id,activityId:row.activityId,at,extra:Boolean(row.extra),undoneAt:Number.isFinite(Date.parse(row.undoneAt))?new Date(row.undoneAt).toISOString():null,snapshot });
  }
  for (const [id,row] of Object.entries(raw.overrides || {})) if (ids.has(id) && row && typeof row === 'object') journal.overrides[id] = values(row);
  journal.pinned = [...new Set((Array.isArray(raw.pinned)?raw.pinned:[]).filter(id=>ids.has(id)))];
  for (const game of ['osrs','rs3']) if (number(raw.rates?.[game],1,1e12)) journal.rates[game]=raw.rates[game];
  for (const [id,period] of Object.entries(raw.legacy || {})) if(ids.has(id) && typeof period==='string' && /^\d{4}-\d{2}(?:-\d{2})?$/.test(period)) journal.legacy[id]=period;
  journal.member = raw.member !== false;
  return journal;
}
export function csvLog(logs, activities) {
  const cell = value => `"${String(value??'').replace(/^[=+@\-\t\r]/,'\'$&').replaceAll('"','""')}"`;
  const rows = [['activity','game','marked_complete_utc','undone_utc','reset_token_run','estimated_gp_before_fees','estimated_xp','estimated_bonus_xp','active_minutes','baseline_xp_per_hour','estimate_basis']];
  for (const log of logs) {
    const activity = activities.find(a=>a.id===log.activityId);
    rows.push([activity?.title||log.activityId,activity?.game,log.at,log.undoneAt,log.extra,log.snapshot.gp,log.snapshot.xp,log.snapshot.bxp,log.snapshot.minutes,log.snapshot.rate,log.snapshot.basis]);
  }
  return rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
