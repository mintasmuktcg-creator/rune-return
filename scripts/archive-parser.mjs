import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { validDate } from '../core.js';
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function parseDate(text, year) {
  const match = text.trim().match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?$/);
  if (!match) return null;
  const month = months.indexOf(match[2]) + 1;
  const date = `${match[3] || year}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}`;
  return validDate(date) ? date : null;
}
export function parseArchive(html, game, start, end) {
  const host = game === 'osrs' ? 'oldschool.runescape.wiki' : 'runescape.wiki';
  const $ = load(html), rows = [], seen = new Set(); let year = null;
  function add(dateText, link) {
    const date = parseDate(dateText, year);
    const href = link.attr('href');
    if (!date || date < start || date > end || !href?.startsWith('/w/Update:')) return;
    const url = new URL(href, `https://${host}`).href;
    if (seen.has(url)) return;
    const title = link.text().replace(/^Update:/, '').trim();
    if (!title || title.length > 350) return;
    seen.add(url);
    rows.push({ id: `${game}-post-${createHash('sha256').update(url).digest('hex').slice(0,16)}`, game, date, title, url });
  }
  $('.mw-parser-output').children().each((_, el) => {
    const heading = $(el).find('h3').addBack('h3').first().text().trim();
    if (/^20\d\d$/.test(heading)) year = Number(heading);
    if (!year || year < Number(start.slice(0,4)) || year > Number(end.slice(0,4))) return;
    if (game === 'osrs') $(el).filter('ul').find('li').each((_, li) => add($(li).find('a').first().text(), $(li).find('a[href^="/w/Update:"]').first()));
    else $(el).filter('table').find('tr').each((_, tr) => add($(tr).find('td').first().text(), $(tr).find('a[href^="/w/Update:"]').first()));
  });
  return rows.sort((a,b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
