// Curated additions/corrections from the dated deep-dive report, not automatic crawl output.
export const deepMethodRefs={
  'osrs-pyre-fox':['theo-hunter'],'osrs-pedals':['theo-agility'],'osrs-poh-agility':['theo-agility'],
  'osrs-summer-garden':['theo-thieving'],'osrs-fixed-fly':['theo-fishing'],'osrs-slimy-eels':['theo-fishing'],
  'osrs-infernal-eels':['theo-fishing'],'osrs-dark-crabs':['theo-fishing'],'osrs-guam-tar':['theo-herblore'],
  'osrs-gold-bracelets':['theo-crafting'],'osrs-bolt-tips':['theo-fletching'],
  'osrs-cannonballs':['theo-smithing'],'osrs-stamina-potions':['theo-herblore'],
  'osrs-altar-bones':['theo-prayer'],'osrs-superior-bones':['theo-prayer'],'osrs-valuables':['theo-thieving'],
  'osrs-monkey-traps':['theo-hunter'],'osrs-wyrm-62':['theo-agility'],
  'rs3-invention-disassemble':['pvme-invention'],'rs3-invention-early':['pvme-invention'],
  'rs3-invention-siphon':['pvme-invention'],'rs3-invention-60':['pvme-invention'],
  'rs3-urns':['pvme-skills'],'rs3-harps':['pvme-skills'],
  'rs3-savages-afk':['pvme-savages'],'rs3-lords-afk':['pvme-lords'],'rs3-phantoms-afk':['pvme-phantoms'],
  'rs3-exalted-essence':['artisan-havenhythe'],
  'rs3-concentrated-gold':['artisan-machines-6'],'rs3-swarm':['artisan-tavia'],
  'rs3-arch-research':['artisan-machines-7'],
  'osrs-motherlode':['theo-mining'],'osrs-calcified':['theo-mining'],
  'osrs-bloods':['theo-runecrafting'],'osrs-souls':['theo-runecrafting'],
  'osrs-slayer-task':['theo-slayer'],'osrs-abyssals':['theo-slayer'],
};
for(const level of [1,30,60,90])deepMethodRefs[`osrs-campfire-${level}`]=['theo-firemaking'];
for(const level of [1,15,25,40,45,80])deepMethodRefs[`osrs-cook-${level}`]=['theo-cooking'];
for(const level of [1,33,46,87])deepMethodRefs[`osrs-glass-${level}`]=['theo-crafting'];
for(const level of [5,20,35,50,65,80])deepMethodRefs[`osrs-bows-${level}`]=['theo-fletching'];
for(const level of [19,34,54,74,89])deepMethodRefs[`osrs-dart-tips-${level}`]=['theo-smithing'];
for(const level of [15,26,35,53,64,73,80,87])deepMethodRefs[`osrs-salvage-${level}`]=['theo-salvaging'];
for(const skill of ['construction','crafting','fishing','fletching','herblore','hunter'])deepMethodRefs[`rs3-iaia-${skill}`]=['artisan-iaia'];
export function addDeepAfk(add){
  const a=(game,id,skill,level,until,title,page,attention,window,requirements,notes,extra={})=>add(game,id,skill,level,until,title,page,attention,window,requirements,notes,null,{members:true,...extra});
  const o=(...args)=>a('osrs',...args),r=(...args)=>a('rs3',...args);
  o('pyre-fox','hunter',57,59,'Pyre fox deadfall traps','Pyre fox','variable','Short waits; reset every catch','Varlamore access, knife and logs; axe for replenishing logs.','Current creature requirement is 57, despite the creator guide saying 51. One trap at a time; not an extended idle method.');
  o('pedals','agility',30,99,'Blast Furnace pedals','Blast Furnace','variable','Run energy limits each stretch','Blast Furnace access and run-energy restoration plan.','A slow niche option; potion and equipment assumptions change the interval. Repeated stamina costs matter.');
  o('poh-agility','agility',1,49,'POH dungeon trap setup','Dungeon','variable','Layout, aggression and success-rate dependent','Permitted access to a correctly built dungeon, TzHaar ranger and floor traps. Owning the ranger setup needs Construction 88.','A specialist low-level route with combat hazards. Higher Agility changes trap success and can stop the loop; follow the complete setup.');
  o('summer-garden','thieving',65,99,'Timed summer garden runs',"Sorceress's Garden",'variable','Short run, then manual restart','Access to the summer garden and a correctly timed manual route.','Timing aids do not make this unattended. Repeated runs, failed timing and juice hand-ins require input.');
  o('fixed-fly','fishing',20,37,'Fixed fly-fishing spot near Prifddinas','Pay-to-play Fishing training','variable','Inventory fills; location stays fixed','Regicide-area access, fly rod and feathers; salmon joins at 30.','A fixed spot removes repositioning, not banking or dropping. Do not assume access from Fishing level alone.');
  o('slimy-eels','fishing',28,37,'Fixed-spot slimy eels','Raw slimy eel','variable','Inventory fills; manual disposal','Death to the Dorgeshuun, light source, rod and bait in the south dungeon.','Distinguish slimy eels at 28 from cave eels at 38. Darkness and local monsters still need a safe route.');
  o('infernal-eels','fishing',80,86,'Infernal eels','Infernal eel','variable','Fish, then crack the inventory','Mor Ul Rek inner-city access via fire cape, oily fishing rod, bait, ice gloves or Smiths gloves (i), and hammer.','Cracking avoids a banking trip but adds manual processing. No rare-resource profit is assumed.');
  o('dark-crabs','fishing',85,99,'Wilderness dark crabs','Raw dark crab','variable','Fixed spot; ongoing player-killer risk','Wilderness Resource Area, lobster pot, dark fishing bait and a loss-tolerant setup.','The fixed spot does not make this safe to leave unattended. Elite diary and fish barrel are optional upgrades; hardcores should consider a safer location.');
  o('guam-tar','herblore',19,37,'Guam tar batches','Guam tar','batch','One herb inventory, then restock','Clean guam, swamp tar and pestle and mortar.','An alternative to short potion inventories; the minimum for guam tar is 19, not the minimum of a multi-tar guide table.');
  o('camphor-kits','construction',66,99,'Camphor repair-kit batches','Camphor repair kit','batch','Production batch; restock materials','Shipwright workbench, hammer, saw, camphor planks, adamantite nails and swamp paste.','A later production tier. Raw material costs and upgraded tools affect the trade-off; no profit projection is supplied.');
  o('gold-bracelets','crafting',7,32,'Gold bracelet batches','Gold bracelet','batch','Inventory-length furnace loop','Gold bars, bracelet mould, furnace and banking route.','A low-attention crafting alternative. Processing and sale prices must be checked separately.');
  o('bolt-tips','fletching',11,99,'Cut opals into bolt tips','Opal bolt tips','batch','A gem inventory at a time','Cut opals and a chisel.','Longer batch convenience with little XP per gem. Cutting tips and attaching them to bolts are separate recipes.');
  for(const[level,until,metal]of [[19,33,'Iron'],[34,53,'Steel'],[54,73,'Mithril'],[74,88,'Adamant'],[89,99,'Rune']])o(`dart-tips-${level}`,'smithing',level,until,`${metal} dart-tip batches`,`${metal} dart tip`,'batch','One-bar Make-All batches','The Tourist Trap completed, matching bars, hammer and an anvil.','An alternative to cannonballs; method selection depends on costs and how often you can restart a batch.');
  for(const skill of ['construction','crafting','fishing','fletching','herblore','hunter'])r(`iaia-${skill}`,skill,75,120,'Dream of Iaia station','Dream of Iaia','long','Train stored XP; finite camp-resource supply','Extinction and its quest prerequisites; build the matching level-75 station with Anachronia resources.','Resource generation can continue offline; earning station XP requires training in game. Idle logout still applies.');
  for(const[level,until,wood]of [[10,19,'Oak'],[20,39,'Willow'],[40,49,'Maple'],[70,79,'Yew'],[90,99,'Elder']])r(`retier-bows-${level}`,'fletching',level,until,`${wood} shortbow batches`,`${wood} shortbow (unstrung)`,'batch','Cut one inventory, then bank','Matching logs and knife.','Uses the July 20, 2026 re-tier, not the older training-guide table.',{members:level>=70});
  r('invention-early','invention',4,26,'Level cheap augmented gear, then disassemble','Invention training','variable','Host activity, then manual disassembly','Complete the tutorial and discover item maximum level 5; augment suitable inexpensive gear.','Disassembly destroys the item. Keep valuable equipment out of this early training loop.',{otherSkills:{crafting:80,smithing:80,divination:80}});
  r('invention-60','invention',60,120,'Item level 12, then siphon','Equipment siphon','passive','Item XP alongside combat/skilling; siphon manually','Discover item maximum level 15 and use suitable augmented equipment with charges.','Full siphoning XP needs item level 12. This is distinct from merely unlocking siphons at Invention 27.',{otherSkills:{crafting:80,smithing:80,divination:80}});
  r('urns','crafting',1,74,'Cracked mining urn production','Cracked mining urn','batch','Form and fire inventories separately','Soft clay, pottery wheel and kiln.','A low-level production bridge. Forming, firing and adding a rune are different steps.',{members:false});
  r('hunter-birdhouses','hunter',5,74,'Havenhythe birdhouse cycles','Birdhouses','variable','Short tier-dependent cycles and manual resets','Havenhythe access, prepared birdhouses and matching seeds. Crafting your own also needs the listed Crafting/Fletching levels.','RS3 low-tier traps finish quickly; this is not the OSRS 50-minute birdhouse loop. Higher tiers and banking unlocks change the route.');
  r('bamboo','woodcutting',90,95,'Arc bamboo','Bamboo','variable','Gather, bundle and manage inventory','The Arc access, hatchet and appropriate island.','Bundles reduce banking pressure; chimes are not direct GE coins.');
  r('golden-bamboo','woodcutting',96,99,'Golden bamboo','Golden Bamboo (tree)','long','Resource depletion, storage and idle logout','Uncharted Isles access, a suitable island and hatchet; porter/bundling setup as needed.','Current unlock is 96. Resource lifetime can exceed your client’s idle timer, so it is not a promise of uninterrupted training.');
  r('eternal-trees','woodcutting',100,110,'Eternal magic trees','Eternal magic tree','variable','Tree lifecycle and inventory management','Suitable hatchet and Piscatoris or Havenhythe tree access.','Follow the current tree mechanics and inventory plan; high-level bonuses are not a beginner rate.');
  r('arc-energy','divination',90,94,'Positive/negative Arc energy','Positive energy','variable','Stackable energy; idle and spring limits','The Arc and relevant island access.','A resource-oriented route. Creating ancestral energy from the pair needs 95; chimes are not GE profit.');
  r('ancestral','divination',95,120,'Ancestral energy springs','Ancestral energy','long','Island resource and idle-timer limits','Uncharted Isles access and an ancestral-energy island.','Stackable resources reduce conversion visits. Island supply and travel still constrain the session.');
  r('magnetic-minnows','fishing',68,120,'Magnetic minnows','Magnetic minnow','variable','Stackable catch; baiting and spot changes','Deep Sea Fishing hub access.','A different attention pattern from ordinary inventory-filling fish. Rebaiting and spot changes interrupt it.');
  r('concentrated-gold','mining',80,88,'Concentrated gold deposits','Concentrated gold rocks','variable','Stamina, inventory and supply dependent','Living Rock Caverns access, suitable pickaxe; consider gold stone spirits, perfect juju and porter charges.','The creator case study uses Mining 95 and upgraded gear. Level 80 unlocks the rock, not that account\'s output or profit. Include inputs and banking in any personal estimate.');
  r('arch-research','archaeology',40,120,'Archaeology research expeditions','Research','passive','Send a funded team; collect later','Assistant qualification, research tutorial and chronotes; individual sites have additional requirements.','Expeditions can finish while offline, unlike excavation training. Research costs can exceed the materials returned. Qualifications still need restoration, collection and mystery progress.');
  r('exalted-essence','runecrafting',65,89,'Exalted essence altar batches','Exalted essence','batch','Consume essence one at a time, then restock','Exalted essence, a supported altar and its access requirements.','Does not work at soul or Necromancy altars. Quoted runes/XP multipliers do not establish profit at today’s essence price.');
  r('soul-altar','runecrafting',90,120,'Soul altar charging loop','Soul altar','batch','Charging periods between active supply/craft trips',"'Phite Club completed; soul-altar access and pure essence.",'Longer charging phases include active travel and rune-crafting steps. Distinguish charging time from whole-loop XP/hour.');
  for(const[level,until,page,access]of [
    [24,35,'Lodge art storage','Infernal Source cellar access; complete mysteries before moving deeper.'],
    [36,41,'Sacrificial altar','Dungeon of Disorder access and its preceding mysteries.'],
    [42,50,'Prodromoi remains','Everlight mass-grave area access.'],
    [51,59,'Amphitheatre debris','Everlight amphitheatre access.'],
    [60,69,'Ministry remains','Senntisten cathedral access.'],
    [70,90,'Ikovian memorial','Stormguard welcome-area access; the assistant qualification and site progression need checking.'],
    [91,105,'Gravitron research debris','Stormguard research area, upgraded travel equipment and preceding site mysteries.'],
    [106,111,'Aughra remains','Orthen Moksha ritual site; associate qualification and Know Thy Measure progression.'],
    [112,120,'Aetherium forge',"Stormguard Howl's workshop; partial Howl's Floating Workshop mystery."]
  ])r(`arch-${level}`,'archaeology',level,until,page,page,'variable','Excavation until inventory, artefact or soil interruption',`${access} Suitable mattock and storage/porter plan.`,'A sampled low-attention hotspot, not a complete collection route or fastest-XP ladder. Restore artefacts, finish mysteries and visit other collection hotspots actively. Camping without time-sprite tracking sacrifices focused XP.');
  for(const[level,until,title,page]of [[95,104,'Abyssal savages','Abyssal savage'],[113,114,'Armoured phantoms','Armoured phantom'],[115,120,'Abyssal lords','Abyssal lord']])r(`${level===95?'savages':level===113?'phantoms':'lords'}-afk`,'slayer',level,until,`${title}: complete setup`,page,'variable','Sustain, positioning and supplies are critical','Correct assignment for Slayer XP; follow the full style/location-specific PVME setup.','Combat access does not prove safe AFK eligibility. A gear or positioning change can invalidate the setup.');
  for(const[level,until,name,agility]of [[85,89,'Sapphire glacialis',80],[90,94,'Snowy knight',85],[95,120,'Black warlock',90]])r(`butterfly-${level}`,'hunter',level,until,`Barehanded ${name.toLowerCase()}`,`${name} (Hunter)`,'variable','Automatic pursuit until movement interrupts','Use the barehanded method rather than net-and-jar trapping.','Hunter and Agility requirements rise together; higher level alone does not stop movement interruptions.',{otherSkills:{agility}});
}
const patch='https://secure.runescape.com/m=news/patch-notes-mid-game-rebalance';
export function applyDeepAfk(rows){
  const set=(id,value)=>{const row=rows.find(r=>r.id===id);if(!row)throw Error(`Missing correction target ${id}`);Object.assign(row,value);};
  set('rs3-bows-5',{level:1,until:9,title:'Normal shortbow batches',notes:'Normal shortbows start at 1 after the 2026 re-tier. Headless arrows are a separate starter alternative.'});
  set('rs3-bows-50',{level:50,until:69,title:'Acadia shortbow batches',members:false,notes:'Acadia shortbows are a F2P production option under the current tier table. Cutting and stringing are separate batches.'});
  set('rs3-bows-80',{until:89,title:'Magic shortbow batches',notes:'Magic shortbows start at 80 under the current tier table. Cutting and stringing are separate batches.'});
  for(const row of rows.filter(r=>r.game==='rs3'&&r.skill==='fletching'&&(/bows-|retier-bows-/.test(r.id)))){row.patchUrl=patch;row.patchNote='Current shortbow unlocks follow Jagex’s July 20, 2026 re-tier. Earlier tables may be stale.';row.source='https://runescape.wiki/w/Fletching';}
  for(const id of ['rs3-fort','rs3-town-hall-2','rs3-town-hall-3']){const row=rows.find(r=>r.id===id);row.patchUrl='https://secure.runescape.com/m=news/mid-game-rebalance-is-live';row.patchNote='July 2026 reduced passive Fort XP and rewarded active optimal-hotspot tracking. Do not apply an older active XP quote to AFK play.';}
  set('rs3-butterflies',{until:84,title:'Barehanded ruby harvests',source:'https://runescape.wiki/w/Ruby_harvest_(Hunter)'});
  set('rs3-hunter-start',{until:4,notes:'Early traps need repeated input. Havenhythe birdhouses give another short-cycle option from Hunter 5; sustained idle methods arrive later.'});
  set('rs3-invention-disassemble',{until:3,title:'Invention tutorial: active unlock',attention:'active',window:'Active tutorial, not AFK',notes:'The tutorial reaches level 4. Augmented-item training follows after the relevant discoveries.'});
  set('rs3-invention-siphon',{until:59,title:'Item level 10: disassembly / early siphoning',window:'Earn item XP during a host activity, then process manually',notes:'Discover item maximum level 10. PVME’s early route disassembles cheap items; item-level-12 full siphoning comes after the level-60 maximum-level unlock. This does not generate XP while offline.'});
  const monkey=rows.find(r=>r.id==='osrs-monkey-traps');monkey.requirements+=' Bring a Kruk monkey greegree.';
  const harps=rows.find(r=>r.id==='rs3-harps');harps.patchUrl=patch;harps.patchNote='Jagex increased harmonic-dust output in July 2026. Old dust/hour quotes need a fresh setup check.';
}
