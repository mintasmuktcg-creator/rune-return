import { historicalUpdates } from './history.js';
export { archivePosts, archiveMeta } from './archive-data.js';
// Original editorial summaries, with per-entry provenance. No scraped article bodies.
export const catalog = {
  reviewed: '2026-10-31',
  coverageStart: '2023-01-01',
  defaultDate: '2026-07-01',
  version: 2,
};
export const categories = [
  { id: 'all', name: 'Everything new', icon: '◈' },
  { id: 'quests', name: 'Quests & stories', icon: '⌘' },
  { id: 'bosses', name: 'Bosses & combat', icon: '⚔' },
  { id: 'drops', name: 'Rare drops & gear', icon: '◇' },
  { id: 'activities', name: 'Skilling & activities', icon: '❋' },
  { id: 'changes', name: 'Game-changing updates', icon: '✧' },
];
const wiki = (game, title) => `https://${game === 'osrs' ? 'oldschool.' : ''}runescape.wiki/w/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
const jagex = slug => `https://www.jagex.com/news/${slug}`;
const wyrmSource = jagex('set-sail-for-adventure-–-old-school-runescape-unveils-new-area-wyrmscraig');
const havenSource = jagex('runescape-expands-like-never-before-as-havenhythe-part-ii-arrives');
const recentUpdates = [
  {
    id: 'osrs-fractured-archive', game: 'osrs', date: '2026-10-20', title: 'The Fractured Archive',
    subtitle: 'A new endgame to get lost in.', tags: ['bosses', 'drops'], level: 'Endgame', style: 'Solo or group', priority: 65,
    summary: 'Old School’s fourth raid opens an ancient vault. Learn a new boss gauntlet and chase a fresh set of high-end rewards.',
    start: 'Read the entry requirements and mechanics, then choose a learner route or team.',
    requirements: 'Endgame gear and combat preparation. Check the current raid guide for access requirements.',
    rewards: ['Obligator', 'Ascension crossbows', 'Zorya’s tome', 'Rondache'],
    source: jagex('old-school-runescape-challenges-the-toughest-players-to-overcome-the-fractured-archive-raid'), guide: wiki('osrs', 'The Fractured Archive'),
  },
  {
    id: 'osrs-wyrmscraig', game: 'osrs', date: '2026-07-29', title: 'Wyrmscraig',
    subtitle: 'Chart a course for somewhere new.', tags: ['activities', 'quests'], level: 'Mid game', style: 'Explore', priority: 95,
    summary: 'A player-designed island gives Sailing a new destination, with an unfamiliar village, a story to uncover and skilling detours.',
    start: 'Check your Sailing level, then plot a route to Wyrmscraig in the Lonely Sea.',
    requirements: '62 Sailing to reach the island; individual activities have further requirements.',
    rewards: ['New island to explore', 'Quest and activity unlocks'],
    source: wiki('osrs', 'Wyrmscraig'), guide: wiki('osrs', 'Wyrmscraig'),
  },
  {
    id: 'osrs-fallen-from-grace', game: 'osrs', date: '2026-07-29', title: 'Fallen From Grace',
    subtitle: 'Meet Wyrmscraig’s troubled guardian.', tags: ['quests'], level: 'Check requirements', style: 'Story', priority: 90,
    summary: 'Investigate the island’s protector and open the way to more Wyrmscraig content.',
    start: 'Reach Wyrmscraig and follow the quest guide’s starting point.',
    requirements: 'Island access plus the quest’s listed prerequisites.', rewards: ['The Mad Angel encounter', 'More island activities'],
    source: wyrmSource, guide: wiki('osrs', 'Fallen From Grace'),
  },
  {
    id: 'osrs-mad-angel', game: 'osrs', date: '2026-07-29', title: 'The Mad Angel',
    subtitle: 'A new fight. A new weapon to chase.', tags: ['bosses', 'drops'], level: 'Check requirements', style: 'Repeatable boss', priority: 85,
    summary: 'Return after Fallen From Grace to challenge the island’s guardian again.',
    start: 'Complete the quest, then study the repeatable encounter.',
    requirements: 'Fallen From Grace; prepare using the boss guide.', rewards: ['Hallowfell'],
    source: wyrmSource, guide: wiki('osrs', 'The Mad Angel'),
  },
  {
    id: 'osrs-golem-crafting', game: 'osrs', date: '2026-07-29', title: 'Golem crafting',
    subtitle: 'Trade the boss room for a workbench.', tags: ['activities'], level: 'Check requirements', style: 'Skilling', priority: 72,
    summary: 'Gather sunstone and craft protectors as a different way to train Crafting.',
    start: 'Finish Fallen From Grace, then find the island’s golem activity.',
    requirements: 'Quest completion and relevant skilling levels.', rewards: ['Crafting experience'],
    source: wyrmSource, guide: wiki('osrs', 'Golem crafting'),
  },
  {
    id: 'osrs-goat-hunting', game: 'osrs', date: '2026-07-29', title: 'Wyrmscraig goat hunting',
    subtitle: 'The scenic route has horns.', tags: ['activities', 'drops'], level: 'Check requirements', style: 'Hunter', priority: 75,
    summary: 'Try a herding-based Hunter activity, with a new pet on the horizon.',
    start: 'Check the goat-hunting guide before travelling.',
    requirements: 'Wyrmscraig access and the activity’s requirements.', rewards: ['Hunter experience', 'Mr McGroot pet'],
    source: wyrmSource, guide: wiki('osrs', 'Wyrmscraig'),
  },
  {
    id: 'osrs-ruff-situation', game: 'osrs', date: '2026-09-08', title: 'A Ruff Situation',
    subtitle: 'Your comeback could use a good dog.', tags: ['quests'], level: 'Novice', style: 'Story', priority: 100,
    summary: 'A dog-themed quest adds a gentler change of pace to your return. Meet the new canine residents of Gielinor.',
    start: 'Open the quest guide to find the dog shelter and starting NPCs.',
    requirements: 'Check the quest overview before setting off.', rewards: ['Dog-themed quest content'],
    source: jagex('old-school-runescape-goes-barking-mad-with-dog-themed-quest'), guide: wiki('osrs', 'A Ruff Situation'),
  },
  {
    id: 'osrs-crab-quest', game: 'osrs', date: '2026-09-08', title: 'Crab Quest',
    subtitle: 'A short new quest for the list.', tags: ['quests'], level: 'Intermediate', style: 'Story', priority: 88,
    summary: 'A new intermediate quest arrived alongside A Ruff Situation. A focused alternative to tackling a large storyline.',
    start: 'Use the quest overview for its start point, required items and prerequisites.',
    requirements: 'Check the current quest requirements.', rewards: ['Quest completion and unlocks'],
    source: wiki('osrs', 'Quests/Release dates'), guide: wiki('osrs', 'Crab Quest'),
  },
  {
    id: 'osrs-halloween-2026', game: 'osrs', date: '2026-10-28', endDate: '2026-11-18', title: 'Halloween in Rimmington',
    subtitle: 'A little seasonal mischief.', tags: ['activities'], level: 'Check requirements', style: 'Limited-time event', priority: 92,
    summary: 'Visit this year’s Halloween event and pick up the vampyre-themed cosmetic rewards before the event closes.',
    start: 'Speak to Angel or Henja in Rimmington.', requirements: 'Check the event guide for current availability.',
    rewards: ['Vampyre costume', 'Vampyre monocle and fangs'],
    source: 'https://secure.runescape.com/m=news/halloween-event-2026-tfa-tweaks--more?oldschool=1', guide: wiki('osrs', '2026 Halloween event'),
  },
  {
    id: 'rs3-havenhythe-2', game: 'rs3', date: '2026-09-28', title: 'Havenhythe: Part II',
    subtitle: 'There’s a whole new east to explore.', tags: ['activities', 'quests', 'drops'], level: 'Mid game', style: 'Explore', priority: 95,
    summary: 'Four new areas extend Havenhythe, adding skilling activities and rewards alongside the next chapter of its story.',
    start: 'Revisit Havenhythe and check your progress through Secrets of Amberfell.',
    requirements: 'Activity requirements vary. The story finale needs Secrets of Amberfell and several skilling levels.',
    rewards: ['Ultra-rare hatchet chase', 'Bogolin Pearls', 'New skilling resources'], source: havenSource, guide: wiki('rs3', 'Havenhythe'),
  },
  {
    id: 'rs3-heralds', game: 'rs3', date: '2026-09-28', title: 'Heralds of Crimson',
    subtitle: 'Pick the Havenhythe story back up.', tags: ['quests'], level: 'Check requirements', style: 'Story', priority: 90,
    summary: 'Continue the Havenhythe storyline and work toward access to its new boss encounter.',
    start: 'Check the quest overview and complete missing story prerequisites first.',
    requirements: 'See the guide for the full quest and skill requirements.', rewards: ['Access to the Ghrazi Blood Knights'],
    source: wiki('rs3', 'Heralds of Crimson'), guide: wiki('rs3', 'Heralds of Crimson'),
  },
  {
    id: 'rs3-ghrazi', game: 'rs3', date: '2026-10-12', title: 'The Ghrazi Blood Knights',
    subtitle: 'Bring a partner. Learn a new fight.', tags: ['bosses', 'drops'], level: 'High level', style: 'Duo at launch', priority: 85,
    summary: 'Lady and Lord Ghrazi bring a new high-level encounter to Havenhythe, with an enrage system for a longer-term challenge.',
    start: 'Finish the relevant story unlocks, find a partner and read the current boss guide.',
    requirements: 'Story access and high-level combat preparation. Duo-only at the reviewed launch; check for later solo changes.',
    rewards: ['New boss loot table', 'Enrage progression'], source: 'https://secure.runescape.com/m=news/the-ghrazi-blood-knights-are-here', guide: wiki('rs3', 'The Ghrazi Blood Knights'),
  },
  {
    id: 'rs3-home-quest', game: 'rs3', date: '2026-07-13', title: 'There’s No Place Like Home…',
    subtitle: 'An easy first stop on your return.', tags: ['quests'], level: 'Novice', style: 'No combat', priority: 100,
    summary: 'A short, free-to-play tutorial quest introduces the rebuilt housing and furniture systems.',
    start: 'Talk to Alfred Stonemason in Rimmington.', requirements: 'No quest prerequisites; the guide lists the small item requirement.',
    rewards: ['Player-owned house access', 'Housing tutorial'], source: wiki('rs3', "There's No Place Like Home..."), guide: wiki('rs3', "There's No Place Like Home..."),
  },
  {
    id: 'rs3-housing', game: 'rs3', date: '2026-07-13', title: 'Make yourself at home',
    subtitle: 'Your old house has changed.', tags: ['activities', 'changes'], level: 'All levels', style: 'Construction', priority: 94,
    summary: 'The Construction update rebuilds player-owned housing. Learn the new furniture and placement systems instead of relying on your old routine.',
    start: 'Complete There’s No Place Like Home… in Rimmington.', requirements: 'Complete the new housing tutorial, even if you owned a house before.',
    rewards: ['Customisable home', 'New furniture workflow'], source: wiki('rs3', '2026 Construction update'), guide: wiki('rs3', 'Player-owned house'),
  },
  {
    id: 'rs3-avatar', game: 'rs3', date: '2026-07-08', dateNote: 'Available by the official announcement date', title: 'A fresh face for your return',
    subtitle: 'Your character looks a little different.', tags: ['changes'], level: 'All levels', style: 'Visual update', priority: 70,
    summary: 'The player-avatar update refreshes the look of RuneScape’s characters. Take a moment to revisit your appearance.',
    start: 'Review your character’s appearance and the official update notes.', requirements: 'See the announcement for the update’s scope.', rewards: ['Updated character visuals'],
    source: jagex('introducing-the-new-face-of-runescape-–-the-player-avatar-update-is-now-available'), guide: wiki('rs3', 'Player avatar update'),
  },
  {
    id: 'rs3-plugin-beta', game: 'rs3', date: '2026-10-06', title: 'Official plugin open beta',
    subtitle: 'Set up your client before the adventure.', tags: ['changes'], level: 'All levels', style: 'Beta release', priority: 82,
    summary: 'RuneScape’s plugin beta is another reason to review your client setup. Check current plugin availability and compatibility in the official notes.',
    start: 'Read the beta announcement and follow its setup instructions.', requirements: 'Supported client and current beta requirements.', rewards: ['Client customisation'],
    source: 'https://secure.runescape.com/m=news/the-week-ahead-plugin-beta-starts-today', guide: 'https://secure.runescape.com/m=news/the-week-ahead-plugin-beta-starts-today',
  },
  {
    id: 'rs3-equilibrium', game: 'rs3', date: '2026-08-10', endDate: '2026-09-21', title: 'Leagues II: Equilibrium',
    subtitle: 'A chapter you missed, now concluded.', tags: ['activities', 'changes'], level: 'All levels', style: 'Ended event', priority: 20,
    summary: 'The second RuneScape League ran with powerful relics and an accelerated progression experience. This event has ended; it is here for context.',
    start: 'Read the recap rather than planning to join this ended League.', requirements: 'No longer available to start.', rewards: ['Historical event context'],
    source: jagex('leagues-ii-equilibrium-showers-blessings-of-power-in-runescape-starting-today'), guide: wiki('rs3', 'Equilibrium League'),
  },
];

export const updates = [...recentUpdates, ...historicalUpdates];

// Evergreen reminders. These are never presented as additions since the chosen date.
export const routines = [
  { id: 'rs3-oyster', game: 'rs3', title: 'Giant Oyster', cadence: 'monthly', summary: 'A familiar monthly treasure diversion, if you have the unlock.', requirements: 'Beneath Cursed Tides; check the guide.', guide: wiki('rs3', 'Giant Oyster') },
  { id: 'rs3-herby', game: 'rs3', title: 'Herby Werby', cadence: 'weekly', summary: 'A weekly Anachronia detour for Herblore experience.', requirements: 'Check access and current activity rules.', guide: wiki('rs3', 'Herby Werby') },
  { id: 'rs3-penguins', game: 'rs3', title: 'Penguin Hide and Seek', cadence: 'weekly', summary: 'Make some time for a weekly penguin hunt.', requirements: 'Quest unlocks can expand the rewards available.', guide: wiki('rs3', 'Penguin Hide and Seek') },
  { id: 'osrs-tears', game: 'osrs', title: 'Tears of Guthix', cadence: 'manual', summary: 'A familiar weekly diversion. Eligibility is based on your own last visit and progress, so reset this reminder manually.', requirements: 'Tears of Guthix and the current weekly eligibility conditions.', guide: wiki('osrs', 'Tears of Guthix (minigame)') },
  { id: 'osrs-stars', game: 'osrs', title: 'Shooting Stars', cadence: 'manual', summary: 'A social Mining detour when you want something slower. This is an evergreen activity, not a new release.', requirements: 'Mining level depends on the star tier.', guide: wiki('osrs', 'Shooting Stars') },
];
