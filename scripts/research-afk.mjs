// Bounded, read-only research capture. Downloaded != reviewed; never promotes methods.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
const root='artifacts/afk-deep-dive';await mkdir(root,{recursive:true});
const ua='RuneReturn/0.5 (public companion-method research; no player data)';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(url){const r=await fetch(url,{headers:{'User-Agent':ua},signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return r.text();}
async function sitemap(url){const $=load(await get(url),{xml:true});return $('loc').map((_,el)=>$(el).text()).get();}
const seedGroups=[
  {provider:'theoatrix',game:'osrs',urls:(await sitemap('https://www.theoatrix.net/blog-posts-sitemap.xml')).filter(url=>/afk|1-99|skilling|salvag|fishing|woodcut|hunter|agility|construction|sailing/i.test(url)).slice(0,120)},
  {provider:'pvme',game:'rs3',urls:(await sitemap('https://pvme.io/sitemap.xml')).filter(url=>/\/afk\/|\/slayer\/|\/noncombat-skilling|\/invention-basics|\/scavenging-farming|\/mid-game-combat/.test(url)).slice(0,120)},
  {provider:'ironman-guide',game:'osrs',urls:(await sitemap('https://ironman.guide/sitemap.xml')).filter(url=>/\/(afk|herblore|crafting|skilling|sailing|training|woodcutting|fishing|hunter|smithing|prayer)(\/|$)/.test(new URL(url).pathname)).slice(0,15)},
  {provider:'rsbandb',game:'rs3',urls:['https://update.rsbandb.com/transcripts/1098_transcript.htm']},
  {provider:'jagex',game:'rs3',urls:['https://secure.runescape.com/m=news/mid-game-rebalance-is-live','https://secure.runescape.com/m=news/player-owned-housing-rework-out-now','https://secure.runescape.com/m=news/patch-notes-mid-game-rebalance']},
  {provider:'artisanrs',game:'rs3',urls:(await sitemap('https://artisanrs.com/sitemap.xml')).filter(url=>/\/videos\/|\/tools\/(afk-thieving|auto-screener|stone-spirits|equilibrium-afk)/.test(url)).slice(0,45)},
];
const results=[];
await Promise.all(seedGroups.map(async group=>{for(const url of [...new Set(group.urls)]){const id=createHash('sha256').update(url).digest('hex').slice(0,16);try{
  let html;try{html=await readFile(`${root}/${id}.html`,'utf8');}catch{html=await get(url);await writeFile(`${root}/${id}.html`,html);await sleep(600);}
  const $=load(html);const structured=[];$('script[type="application/ld+json"]').each((_,el)=>{try{const v=JSON.parse($(el).text());structured.push(...(Array.isArray(v)?v:[v]));}catch{}});
  const article=structured.flatMap(v=>v['@graph']||[v]).find(v=>/Article|BlogPosting|VideoObject/.test(String(v['@type'])));
  $('script,style,nav,footer,header,.md-sidebar,.md-header,.md-footer,.md-tabs').remove();
  const main=$('[data-hook="post-description"]').first().length?$('[data-hook="post-description"]').first():$('article').first().length?$('article').first():$('main').first().length?$('main').first():$('body');
  main.find('img').each((_,el)=>{const alt=$(el).attr('alt');if(alt)$(el).replaceWith(` ${alt} `);});
  main.find('p,h1,h2,h3,h4,li,blockquote').append('\n');
  const text=main.text().replace(/\r/g,'').replace(/[\t ]+/g,' ').replace(/\n\s*\n/g,'\n').trim();
  const headings=main.find('h1,h2,h3,h4').map((_,el)=>$(el).text().trim()).get();
  const warnings=text.split('\n').filter(line=>/may not work|outdated|March 2026|rework|beta changes|no longer|nerf/i.test(line)).map(line=>line.trim().slice(0,350)).slice(0,12);
  const links=main.find('a[href]').map((_,el)=>{try{const u=new URL($(el).attr('href'),url);return u.protocol==='https:'?{title:$(el).text().trim().slice(0,100),url:u.href}:null;}catch{return null;}}).get().filter(Boolean);
  await writeFile(`${root}/${id}.txt`,text);
  results.push({id,url,provider:group.provider,game:group.game,title:article?.headline||$('h1').first().text().trim()||$('title').text().trim(),author:article?.author?.name||null,published:article?.datePublished||article?.uploadDate||$('meta[property="article:published_time"]').attr('content')||$('time[datetime]').first().attr('datetime')||null,modified:article?.dateModified||null,capturedAt:new Date().toISOString(),status:'captured-not-reviewed',characters:text.length,headings,warnings,links,fingerprint:createHash('sha256').update(text).digest('hex')});
}catch(error){results.push({id,url,provider:group.provider,game:group.game,status:'unavailable',error:error.message});}}
console.log(JSON.stringify({provider:group.provider,captured:results.filter(r=>r.provider===group.provider&&r.status==='captured-not-reviewed').length,failed:results.filter(r=>r.provider===group.provider&&r.status==='unavailable').length}));}));
await writeFile(`${root}/manifest.json`,JSON.stringify({capturedAt:new Date().toISOString(),meaning:'Capture/discovery only; human source review and patch validation are separate.',sources:results.sort((a,b)=>a.url.localeCompare(b.url))},null,2));
console.log(JSON.stringify({total:results.length,captured:results.filter(r=>r.status==='captured-not-reviewed').length,unavailable:results.filter(r=>r.status==='unavailable').length}));
