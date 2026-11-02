import test from 'node:test';
import assert from 'node:assert/strict';
import {creatorSources,creatorSource,creatorGuideUrl,guidesForSkill} from '../creator-sources.js';
import {afkMethods} from '../afk-data.js';
import {gameSkills} from '../progression-data.js';
import {buildAfkRoute,cleanAfkPreferences} from '../afk-core.js';
test('creator records distinguish publication from review and do not invent unknown dates',()=>{
  assert.equal(new Set(creatorSources.map(s=>s.id)).size,creatorSources.length);
  for(const s of creatorSources){assert.ok(['written','chapters'].includes(s.review));assert.match(s.checked,/^\d{4}-\d{2}-\d{2}$/);if(s.published)assert.ok(s.published<=s.checked);assert.equal(new URL(s.url).protocol,'https:');for(const skill of [...(s.skills||[]),...Object.keys(s.chapters||{})])assert.ok(gameSkills[s.game].includes(skill),`${s.id} ${skill}`);}
  assert.equal(creatorSource('pvme-beasts').published,null);
});
test('chapter links resolve to the actual skill, game and published timestamp',()=>{
  const guide=creatorSource('qp-all-skills-2026');
  assert.equal(new URL(creatorGuideUrl(guide,'mining')).searchParams.get('t'),'270s');
  assert.equal(new URL(creatorGuideUrl(guide,'necromancy')).searchParams.get('t'),'75s');
  assert.ok(guidesForSkill('rs3','dungeoneering').some(s=>s.id===guide.id));
  assert.ok(guidesForSkill('osrs','mining').every(s=>s.game==='osrs'));
});
test('reviewed-method filtering excludes chapter-only discovery links and retains mechanics requirements',()=>{
  for(const m of afkMethods)for(const id of m.creatorRefs){const source=creatorSource(id);assert.ok(source,`${m.id} ${id}`);assert.equal(source.game,m.game);assert.equal(source.review,'written');}
  const osrs=buildAfkRoute({game:'osrs',skill:'woodcutting',evidence:'creator'});assert.ok(osrs.rows.some(r=>r.method.id==='osrs-infected-roots'));assert.ok(!osrs.rows.some(r=>r.method.id==='osrs-oak'));
  const rs3=buildAfkRoute({game:'rs3',skill:'slayer',level:100,evidence:'creator'});assert.equal(rs3.rows.find(r=>r.method.id==='rs3-beasts-afk').status,'locked');
  assert.equal(buildAfkRoute({game:'rs3',skill:'woodcutting',evidence:'creator'}).rows.length,0);
});
test('existing preferences keep all-source access; creator filtering is an explicit persistent choice',()=>{
  assert.equal(cleanAfkPreferences({skill:'mining',level:70},'osrs').evidence,'all');
  assert.equal(cleanAfkPreferences({evidence:'creator'},'rs3').evidence,'creator');
  assert.equal(cleanAfkPreferences({evidence:'unreviewed-video'},'rs3').evidence,'all');
});
