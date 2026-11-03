// Compile explicitly selected reviews; captures alone never earn a reviewed state.
import {readFile,writeFile} from 'node:fs/promises';
const decisions=JSON.parse(await readFile('research/afk-reviewed-publications.json','utf8'));
const manifest=JSON.parse(await readFile('artifacts/afk-deep-dive/manifest.json','utf8'));
const authors={theoatrix:'Theoatrix',pvme:'PvM Encyclopedia community',artisanrs:'ArtisanRS',rsbandb:'RSBANDBUpdate!'};
const records=decisions.map(decision=>{const page=manifest.sources.find(s=>s.url===decision.url);if(!page||page.status!=='captured-not-reviewed')throw Error(`Missing source capture: ${decision.id}`);return {id:decision.id,game:page.game,creator:authors[page.provider],title:decision.title||page.title,url:page.url,published:Object.hasOwn(decision,'published')?decision.published:page.published?.slice(0,10)||null,modified:page.modified?.slice(0,10)||null,checked:'2026-11-02',review:'written',skills:decision.skills,summary:decision.summary,...(decision.recorded?{recorded:decision.recorded}:{}),...(decision.compatibility?{compatibility:decision.compatibility}:{}),...(decision.compatibilityNote?{compatibilityNote:decision.compatibilityNote}:{})};});
await writeFile('reviewed-creator-sources.js','// Generated from explicit source-section decisions; no fetched article bodies.\nexport const reviewedCreatorSources='+JSON.stringify(records,null,2)+';\n');
console.log(`Compiled ${records.length} explicitly selected source-section reviews.`);
