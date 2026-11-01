// Provider boundary: these are normalized RuneReturn observations, not Jagex routes.
import { gameSkills } from './progression-data.js';
export const progressionProviders=[
  {id:'manual',status:'available',description:'Player-confirmed levels, unlocks and completion.'},
  {id:'hiscores',status:'available',description:'Current imported public skills; no quest/collection inference.'},
  {id:'rs3-client',status:'planned',description:'Needs a tested companion and permitted transfer path.'},
  {id:'rs3-web',status:'awaiting-contract',description:'No verified replacement API endpoint/schema is configured.'},
];
export function normalizeProgressionObservation(payload){
  if(payload?.schema!=='runereturn.rs3.snapshot.v1'||payload.game!=='rs3'||!Number.isFinite(Date.parse(payload.captured_at_utc)))throw new Error('Unsupported progression observation.');
  const skills={};for(const[id,row]of Object.entries(payload.skills||{}))if(gameSkills.rs3.includes(id)&&row&&Number.isInteger(row.level)&&row.level>=1&&row.level<=200)skills[id]={level:row.level,xp:Number.isSafeInteger(row.xp)&&row.xp>=0?row.xp:null};
  const quests=(Array.isArray(payload.quests)?payload.quests:[]).filter(row=>row&&Number.isSafeInteger(row.config_id)&&['unknown','not-started','started','complete'].includes(row.state)).map(row=>({configId:row.config_id,state:row.state}));
  return {game:'rs3',capturedAt:new Date(payload.captured_at_utc).toISOString(),source:'rs3-client',skills,quests,capabilities:{skills:Object.keys(skills).length?'present':'unavailable',quests:Object.hasOwn(payload,'quests')?'present':'unavailable'},trackingId:typeof payload.tracking_id==='string'&&/^\d{1,20}$/.test(payload.tracking_id)&&BigInt(payload.tracking_id)<=18446744073709551615n?payload.tracking_id:null};
}
