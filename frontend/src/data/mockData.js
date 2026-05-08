export const teams = [
  { id: 'aether-fc', name: 'Aether FC', shortName: 'AET', crest: 'AF', captain: 'Naru', identity: 'Tempo dictators with brutal wing rotations.', colors: ['#40d8ff', '#1b5cff'], avgRating: 88.4, form: ['W', 'W', 'D', 'W', 'W'], rank: 1, players: 11, winRate: '74%', trophies: 8, founded: 'Season 03', chemistry: 92 },
  { id: 'velora-athletic', name: 'Velora Athletic', shortName: 'VEL', crest: 'VA', captain: 'Lyo', identity: 'Pressing machine with elite final-third recovery.', colors: ['#ae7bff', '#4b1fff'], avgRating: 86.9, form: ['W', 'L', 'W', 'W', 'D'], rank: 2, players: 10, winRate: '68%', trophies: 5, founded: 'Season 04', chemistry: 87 },
  { id: 'solstice-united', name: 'Solstice United', shortName: 'SOL', crest: 'SU', captain: 'Mika', identity: 'Wide overloads, quick cutbacks, ruthless transitions.', colors: ['#ffd66b', '#ff8a34'], avgRating: 85.8, form: ['W', 'W', 'L', 'D', 'W'], rank: 3, players: 12, winRate: '63%', trophies: 3, founded: 'Season 02', chemistry: 84 },
  { id: 'northport-city', name: 'Northport City', shortName: 'NOR', crest: 'NC', captain: 'Rex', identity: 'Structured block with punishing counter attacks.', colors: ['#66f0c9', '#0f8c7a'], avgRating: 84.7, form: ['L', 'W', 'D', 'W', 'L'], rank: 4, players: 11, winRate: '56%', trophies: 2, founded: 'Season 05', chemistry: 79 },
  { id: 'ironvale-rovers', name: 'Ironvale Rovers', shortName: 'IRV', crest: 'IR', captain: 'Cruz', identity: 'Physical midfield duels and direct vertical play.', colors: ['#ff6688', '#ae1b54'], avgRating: 82.9, form: ['D', 'L', 'W', 'D', 'W'], rank: 5, players: 9, winRate: '49%', trophies: 1, founded: 'Season 06', chemistry: 73 },
  { id: 'atlas-borough', name: 'Atlas Borough', shortName: 'ATL', crest: 'AB', captain: 'Jae', identity: 'Young roster that thrives on chaos and late pressure.', colors: ['#5cb7ff', '#364bff'], avgRating: 81.2, form: ['L', 'D', 'L', 'W', 'L'], rank: 6, players: 10, winRate: '41%', trophies: 0, founded: 'Season 07', chemistry: 69 },
]

export const players = [
  { id: 'naru', name: 'Naru', teamId: 'aether-fc', rating: 92, position: 'CAM', nation: 'USA', archetype: 'Chance Architect', portrait: 'NA', stats: { goals: 29, assists: 34, matches: 41, avgRating: 8.8, motm: 11, winRate: '76%' }, attributes: { pace: 84, passing: 96, shooting: 88, defense: 62, vision: 97, clutch: 94 }, form: [8.2, 9.1, 8.8, 9.4, 8.9, 8.6, 9.2, 8.7, 9.0, 9.5], trophies: { leagues: 3, cups: 2, mvps: 2, totw: 8 }, heat: ['5 wins in a row', '14 key passes in last 3', 'Most chances created this month'], rivalVictim: 'Velora Athletic', timeline: ['Season 03 - Aether FC debut', 'Season 04 - Cup champion', 'Season 05 - League MVP'] },
  { id: 'lyo', name: 'Lyo', teamId: 'velora-athletic', rating: 90, position: 'ST', nation: 'Brazil', archetype: 'Box Predator', portrait: 'LY', stats: { goals: 37, assists: 14, matches: 42, avgRating: 8.7, motm: 9, winRate: '70%' }, attributes: { pace: 93, passing: 77, shooting: 95, defense: 39, vision: 81, clutch: 96 }, form: [7.9, 8.8, 9.4, 8.2, 8.6, 9.0, 9.1, 8.3, 8.9, 9.3], trophies: { leagues: 2, cups: 1, mvps: 1, totw: 7 }, heat: ['8 goals in last 5', '3 match winners this week', 'Fastest hat trick this season'], rivalVictim: 'Northport City', timeline: ['Season 04 - Velora Athletic signing', 'Season 05 - Golden Boot winner'] },
  { id: 'mika', name: 'Mika', teamId: 'solstice-united', rating: 88, position: 'RW', nation: 'Japan', archetype: 'Isolation Winger', portrait: 'MI', stats: { goals: 24, assists: 21, matches: 39, avgRating: 8.4, motm: 7, winRate: '64%' }, attributes: { pace: 95, passing: 84, shooting: 87, defense: 54, vision: 82, clutch: 85 }, form: [8.1, 8.0, 7.8, 8.6, 8.9, 8.7, 8.2, 8.5, 8.4, 8.8], trophies: { leagues: 1, cups: 2, mvps: 0, totw: 5 }, heat: ['4 dribbles completed per match', 'Most wide chances created in playoffs'], rivalVictim: 'Atlas Borough', timeline: ['Season 02 - Solstice academy', 'Season 06 - Cup final MVP'] },
  { id: 'rex', name: 'Rex', teamId: 'northport-city', rating: 86, position: 'CDM', nation: 'England', archetype: 'Shield Controller', portrait: 'RX', stats: { goals: 8, assists: 16, matches: 40, avgRating: 8.1, motm: 5, winRate: '58%' }, attributes: { pace: 76, passing: 88, shooting: 69, defense: 91, vision: 84, clutch: 79 }, form: [7.7, 8.2, 8.0, 8.4, 7.9, 8.1, 8.3, 8.5, 7.8, 8.4], trophies: { leagues: 1, cups: 0, mvps: 0, totw: 4 }, heat: ['Leads recoveries this season', 'Best duel win rate among midfielders'], rivalVictim: 'Ironvale Rovers', timeline: ['Season 05 - Northport captain named', 'Season 06 - Defensive XI'] },
  { id: 'cruz', name: 'Cruz', teamId: 'ironvale-rovers', rating: 84, position: 'CB', nation: 'Spain', archetype: 'Aerial Enforcer', portrait: 'CR', stats: { goals: 4, assists: 5, matches: 37, avgRating: 7.9, motm: 3, winRate: '51%' }, attributes: { pace: 71, passing: 78, shooting: 49, defense: 92, vision: 75, clutch: 82 }, form: [7.8, 7.5, 8.1, 7.7, 8.0, 7.9, 8.2, 7.8, 8.0, 8.1], trophies: { leagues: 0, cups: 1, mvps: 0, totw: 3 }, heat: ['Most clearances in knockout stage'], rivalVictim: 'Solstice United', timeline: ['Season 06 - Ironvale arrival', 'Season 07 - Cup winner'] },
  { id: 'jae', name: 'Jae', teamId: 'atlas-borough', rating: 82, position: 'LB', nation: 'South Korea', archetype: 'Overlap Engine', portrait: 'JA', stats: { goals: 5, assists: 13, matches: 36, avgRating: 7.8, motm: 2, winRate: '43%' }, attributes: { pace: 87, passing: 80, shooting: 63, defense: 83, vision: 78, clutch: 74 }, form: [7.6, 7.4, 7.8, 7.9, 7.7, 8.0, 7.5, 7.8, 8.1, 7.9], trophies: { leagues: 0, cups: 0, mvps: 0, totw: 2 }, heat: ['Most progressive carries for Atlas'], rivalVictim: 'Aether FC', timeline: ['Season 07 - Atlas captain promoted'] },
]

export const standings = teams.map((team, index) => ({
  teamId: team.id,
  team: team.shortName,
  played: 16,
  wins: 11 - index,
  draws: index < 3 ? 3 : 2,
  losses: index < 2 ? 2 : 3 + Math.max(0, index - 3),
  goalsFor: 34 - index * 3,
  goalsAgainst: 14 + index * 2,
  points: 36 - index * 4,
  form: team.form,
}))

export const matches = [
  {
    id: 'aether-vs-velora-final',
    homeTeamId: 'aether-fc',
    awayTeamId: 'velora-athletic',
    homeScore: 3,
    awayScore: 2,
    status: 'Final',
    tournament: 'IOSCA Champions Cup',
    format: '5v5',
    date: 'May 10',
    duration: '23:18',
    mvp: 'Naru',
    standout: 'Naru | 9.5',
    stats: [['Possession', 56, 44], ['Shots', 13, 9], ['Pass Accuracy', 89, 83], ['Tackles Won', 18, 20]],
    timeline: [
      { minute: 4, side: 'home', label: 'Goal', detail: 'Naru curls one top corner.' },
      { minute: 11, side: 'away', label: 'Goal', detail: 'Lyo equalizes on the counter.' },
      { minute: 17, side: 'home', label: 'Assist', detail: 'Sable finds Kiro at the back post.' },
      { minute: 19, side: 'away', label: 'Goal', detail: 'Velora press and convert rebound.' },
      { minute: 22, side: 'home', label: 'Winner', detail: 'Naru wins it from the half-space.' },
    ],
    momentum: [42, 48, 57, 60, 63, 54, 50, 61, 67, 72, 58, 64],
    turningPoint: 'Aether survived Velora\'s minute-18 press trap and answered with the winning transition before extra pressure could build.',
    topPerformers: ['naru', 'lyo', 'rex'],
    lineup: [
      { role: 'GK', player: 'Voss', teamId: 'aether-fc', x: 10, y: 50 },
      { role: 'LB', player: 'Juno', teamId: 'aether-fc', x: 24, y: 20 },
      { role: 'CB', player: 'Sable', teamId: 'aether-fc', x: 28, y: 50 },
      { role: 'RB', player: 'Kiro', teamId: 'aether-fc', x: 24, y: 80 },
      { role: 'CAM', player: 'Naru', teamId: 'aether-fc', x: 54, y: 50 },
      { role: 'ST', player: 'Flux', teamId: 'aether-fc', x: 78, y: 50 },
      { role: 'GK', player: 'Ivo', teamId: 'velora-athletic', x: 90, y: 50 },
      { role: 'LB', player: 'Rune', teamId: 'velora-athletic', x: 76, y: 20 },
      { role: 'CB', player: 'Vale', teamId: 'velora-athletic', x: 72, y: 50 },
      { role: 'RB', player: 'Theo', teamId: 'velora-athletic', x: 76, y: 80 },
      { role: 'ST', player: 'Lyo', teamId: 'velora-athletic', x: 46, y: 50 },
    ],
    votes: [{ label: 'Naru', percent: 46 }, { label: 'Lyo', percent: 31 }, { label: 'Sable', percent: 23 }],
  },
  { id: 'solstice-vs-northport', homeTeamId: 'solstice-united', awayTeamId: 'northport-city', homeScore: 1, awayScore: 1, status: 'Final', tournament: 'Premier Season', format: '6v6', date: 'May 08', duration: '19:04', mvp: 'Rex', standout: 'Rex | 8.4' },
  { id: 'ironvale-vs-atlas', homeTeamId: 'ironvale-rovers', awayTeamId: 'atlas-borough', homeScore: 2, awayScore: 0, status: 'Final', tournament: 'Premier Season', format: '5v5', date: 'May 07', duration: '18:44', mvp: 'Cruz', standout: 'Cruz | 8.1' },
  { id: 'velora-vs-solstice', homeTeamId: 'velora-athletic', awayTeamId: 'solstice-united', homeScore: 4, awayScore: 3, status: 'Live 78\'', tournament: 'Champions Cup', format: '5v5', date: 'Today', duration: 'Live', mvp: 'Lyo', standout: 'Lyo | 9.0' },
]

export const fixtures = [
  { id: 'f1', homeTeamId: 'aether-fc', awayTeamId: 'atlas-borough', date: 'May 11 | 8:30 PM', stage: 'Premier Season' },
  { id: 'f2', homeTeamId: 'northport-city', awayTeamId: 'velora-athletic', date: 'May 12 | 7:00 PM', stage: 'Cup Semi Final' },
  { id: 'f3', homeTeamId: 'solstice-united', awayTeamId: 'ironvale-rovers', date: 'May 13 | 9:00 PM', stage: 'Premier Season' },
]

export const tournaments = [
  { id: 'iosca-champions-cup', name: 'IOSCA Champions Cup', logo: 'CC', status: 'Playoffs', teams: 8, prestige: 'Elite', schedule: 'May 2026', description: 'Premier knockout event featuring the best clubs in the community.', topScorers: ['Lyo', 'Naru', 'Mika'], topAssists: ['Naru', 'Rex', 'Jae'], mvpRace: ['Naru', 'Lyo', 'Rex'] },
  { id: 'iosca-premier-season', name: 'IOSCA Premier Season', logo: 'PS', status: 'Active', teams: 12, prestige: 'Foundational', schedule: 'Apr - Jun 2026', description: 'Main seasonal table built around weekly rivalry fixtures.', topScorers: ['Lyo', 'Mika', 'Naru'], topAssists: ['Naru', 'Mika', 'Jae'], mvpRace: ['Naru', 'Mika', 'Rex'] },
  { id: 'founders-shield', name: 'Founder\'s Shield', logo: 'FS', status: 'Upcoming', teams: 6, prestige: 'Prestige', schedule: 'June 2026', description: 'Short-format invitational built around legacy clubs.', topScorers: ['TBD'], topAssists: ['TBD'], mvpRace: ['TBD'] },
]

export const records = [
  { label: 'Most Goals Ever', holder: 'Lyo', value: 148, context: 'Across all official IOSCA competitions' },
  { label: 'Highest Match Rating', holder: 'Naru', value: 9.9, context: 'Champions Cup Final | Season 05' },
  { label: 'Longest Win Streak', holder: 'Aether FC', value: 12, context: 'Premier Season run' },
  { label: 'Biggest Upset', holder: 'Atlas Borough', value: '3-1', context: 'Defeated Aether FC in cup quarters' },
  { label: 'Most Assists', holder: 'Naru', value: 112, context: 'Creative record holder' },
  { label: 'Best Defensive Season', holder: 'Northport City', value: 11, context: 'Only 11 goals conceded' },
]

export const media = [
  { id: 'm1', title: 'Final whistle chaos', type: 'Highlight', length: '00:42', accent: 'cyan' },
  { id: 'm2', title: 'Naru outside-foot winner', type: 'Goal Clip', length: '00:18', accent: 'gold' },
  { id: 'm3', title: 'Velora press montage', type: 'Team Feature', length: '01:22', accent: 'purple' },
  { id: 'm4', title: 'Top saves of the week', type: 'Compilation', length: '02:03', accent: 'green' },
  { id: 'm5', title: 'Rivalry night gallery', type: 'Screenshots', length: '12 stills', accent: 'red' },
  { id: 'm6', title: 'Hall of Fame opening reel', type: 'Broadcast Intro', length: '00:55', accent: 'blue' },
]

export const rankingGroups = [
  { title: 'Top Rated Players', items: [{ label: 'Naru', value: '92 OVR', meta: 'Aether FC' }, { label: 'Lyo', value: '90 OVR', meta: 'Velora Athletic' }, { label: 'Mika', value: '88 OVR', meta: 'Solstice United' }] },
  { title: 'Top Scorers', items: [{ label: 'Lyo', value: 37, meta: 'Velora Athletic' }, { label: 'Naru', value: 29, meta: 'Aether FC' }, { label: 'Mika', value: 24, meta: 'Solstice United' }] },
  { title: 'Top Assists', items: [{ label: 'Naru', value: 34, meta: 'Aether FC' }, { label: 'Mika', value: 21, meta: 'Solstice United' }, { label: 'Rex', value: 16, meta: 'Northport City' }] },
]

export const homeFeatures = [
  { label: 'Match of the Week', title: 'Aether FC vs Velora Athletic', description: 'Two title contenders meet in a high-pressure Champions Cup final with league-wide bragging rights on the line.', action: '/matches/aether-vs-velora-final', accent: 'cyan' },
  { label: 'Top Player', title: 'Naru is running the league', description: 'Creative leader, biggest match performer, and current favorite in the MVP race.', action: '/players/naru', accent: 'gold' },
  { label: 'Tournament Finals', title: 'Champions Cup is entering its last weekend', description: 'The bracket is tightening and every match now shifts legacy.', action: '/tournaments/iosca-champions-cup', accent: 'purple' },
  { label: 'Team Spotlight', title: 'Velora Athletic pressure system', description: 'A modern pressing identity with elite transitions and heavy rivalry energy.', action: '/teams/velora-athletic', accent: 'blue' },
]

export const quickStats = [
  { label: 'Active Players', value: '84', delta: '+6 this month' },
  { label: 'Matches This Week', value: '27', delta: '4 live today' },
  { label: 'Highest Rated', value: 'Naru 92', delta: 'Aether FC' },
  { label: '#1 Team', value: 'Aether FC', delta: '74% win rate' },
]

export const teamOfWeek = [
  { player: 'Voss', role: 'GK', teamId: 'aether-fc', x: 10, y: 50 },
  { player: 'Jae', role: 'LB', teamId: 'atlas-borough', x: 26, y: 18 },
  { player: 'Cruz', role: 'CB', teamId: 'ironvale-rovers', x: 28, y: 42 },
  { player: 'Rex', role: 'CB', teamId: 'northport-city', x: 28, y: 58 },
  { player: 'Kiro', role: 'RB', teamId: 'aether-fc', x: 26, y: 82 },
  { player: 'Juno', role: 'CM', teamId: 'aether-fc', x: 48, y: 32 },
  { player: 'Naru', role: 'CAM', teamId: 'aether-fc', x: 56, y: 50 },
  { player: 'Mika', role: 'RW', teamId: 'solstice-united', x: 72, y: 18 },
  { player: 'Flux', role: 'ST', teamId: 'aether-fc', x: 82, y: 50 },
  { player: 'Lyo', role: 'LW', teamId: 'velora-athletic', x: 72, y: 82 },
]
