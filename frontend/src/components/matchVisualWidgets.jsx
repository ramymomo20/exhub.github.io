import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crest, EventIcon, Widget } from './ui'
import { getPlayerById } from '../data/repository'

const JERSEY_ICON = `${import.meta.env.BASE_URL}icons/jersey-icon.png`

const SHOT_FILTERS = ['goal', 'save', 'miss', 'yellow-card', 'second_yellow', 'red-card', 'own-goal']

const FORMATION_COORDS = {
  '5v5': [
    { position: 'GK', x: 50, y: 82 },
    { position: 'CB', x: 50, y: 62 },
    { position: 'LM', x: 24, y: 27 },
    { position: 'CF', x: 50, y: 22 },
    { position: 'RM', x: 76, y: 27 },
  ],
  '6v6': [
    { position: 'GK', x: 50, y: 84 },
    { position: 'LB', x: 22, y: 66 },
    { position: 'RB', x: 78, y: 66 },
    { position: 'CM', x: 50, y: 47 },
    { position: 'LW', x: 26, y: 23 },
    { position: 'RW', x: 74, y: 23 },
  ],
  '8v8': [
    { position: 'GK', x: 50, y: 84 },
    { position: 'LB', x: 18, y: 68 },
    { position: 'CB', x: 50, y: 67 },
    { position: 'RB', x: 82, y: 68 },
    { position: 'CM', x: 50, y: 48 },
    { position: 'LW', x: 22, y: 24 },
    { position: 'CF', x: 50, y: 20 },
    { position: 'RW', x: 78, y: 24 },
  ],
}

const HEAD_TO_HEAD_LABELS = [
  'Possession',
  'Shots',
  'Shots on Goal',
  'Saves',
  'Passes',
  'Passes Completed',
  'Interceptions',
  'Corners',
  'Fouls',
  'Offsides',
  'Yellow Cards',
  'Red Cards',
]

const SHOT_ZONE_TEMPLATE = Array.from({ length: 24 }, (_, index) => {
  const column = index % 8
  const row = Math.floor(index / 8)
  return {
    id: `zone-${index + 1}`,
    x: 4 + column * 12,
    y: 10 + row * 26,
    width: 11,
    height: 24,
  }
})

const PLAYER_STAT_COLUMNS = [
  { key: 'player', label: 'Player' },
  { key: 'position', label: 'Pos' },
  { key: 'goals', label: 'G' },
  { key: 'shots', label: 'SH' },
  { key: 'onTarget', label: 'OT' },
  { key: 'assists', label: 'A' },
  { key: 'secondAssists', label: '2ND' },
  { key: 'keyPasses', label: 'KP' },
  { key: 'chancesCreated', label: 'CC' },
  { key: 'passes', label: 'PAS' },
  { key: 'completed', label: 'CMP' },
  { key: 'completionPct', label: '%' },
  { key: 'interceptions', label: 'INT' },
  { key: 'possessions', label: 'POSS' },
  { key: 'saves', label: 'SVS' },
  { key: 'offsides', label: 'OFF' },
  { key: 'distance', label: 'DIST' },
  { key: 'fouls', label: 'FLS' },
  { key: 'foulsSuffered', label: 'FLS S' },
  { key: 'ownGoals', label: 'OG' },
  { key: 'goalsConceded', label: 'GC' },
  { key: 'corners', label: 'CRN' },
  { key: 'throwIns', label: 'TI' },
  { key: 'freeKicks', label: 'FK' },
  { key: 'goalKicks', label: 'GK' },
  { key: 'penalties', label: 'PEN' },
  { key: 'yellowCards', label: 'YC' },
  { key: 'redCards', label: 'RC' },
]

export function LineupsWidget({ match, homeTeam, awayTeam }) {
  const homePlayers = useMemo(() => buildLineupPlayers(match.lineups.home, match.format, match.lineupTooltips), [match])
  const awayPlayers = useMemo(() => buildLineupPlayers(match.lineups.away, match.format, match.lineupTooltips), [match])
  const viewMode = 'stats'

  return (
    <Widget title="Lineups" className="span-full lineups-visual-widget">
      <div className="lineups-widget-grid">
        <TeamLineupPitch
          team={homeTeam}
          players={homePlayers}
          score={match.homeScore}
          format={match.format}
          mode={viewMode}
        />
        <TeamLineupPitch
          team={awayTeam}
          players={awayPlayers}
          score={match.awayScore}
          format={match.format}
          mode={viewMode}
        />
      </div>
    </Widget>
  )
}

export function TeamLineupPitch({ team, players, score, format, mode }) {
  return (
    <article className="team-lineup-pitch card">
      <header className="team-lineup-header">
        <div className="team-lineup-title">
          <Crest teamId={team.id} />
          <div>
            <strong>{team.name}</strong>
            <small>{format} formation</small>
          </div>
        </div>
        <div className="team-lineup-meta">
          <span>{format}</span>
          <strong>{score}</strong>
        </div>
      </header>

      <div className="analytics-pitch analytics-pitch-vertical">
        <PitchLines orientation="vertical" />
        {players.map((player) => (
          <PlayerMarker
            key={player.id}
            player={player}
            mode={mode}
            teamColors={team.colors}
          />
        ))}
      </div>
    </article>
  )
}

export function PlayerMarker({ player, mode, teamColors }) {
  const bottomBadges = mode === 'stats' ? buildBottomMarkerEvents(player.events, player.position) : []
  const tooltipClass = player.isMvp ? ' player-marker-tooltip-mvp' : ''

  return (
    <div className={`player-marker${mode === 'titles' ? ' is-title-view' : ''}${player.isMvp ? ' is-mvp' : ''}`} style={{ left: `${player.x}%`, top: `${player.y}%` }}>
      <div className="player-marker-visual">
        <span className={`rating-badge ${getRatingBadgeClass(player.rating, player.isMvp)}`}>{player.rating.toFixed(1)}</span>
        {player.isMvp ? (
          <span className="player-mvp-medal-badge" title="MVP">
            <EventIcon type="mvp" />
          </span>
        ) : null}
        <JerseyMarker teamColors={teamColors} position={player.position} isMvp={player.isMvp} />
      </div>

      {player.playerId ? (
        <Link className="player-nameplate" to={`/players/${player.playerId}`}>
          {player.name}
        </Link>
      ) : (
        <span className="player-nameplate">{player.name}</span>
      )}

      {bottomBadges.length ? (
        <div className="player-bottom-events">
          {bottomBadges.map((item) => (
            <span key={`${player.id}-${item.type}`} className={`marker-event-badge marker-event-${item.type}`}>
              <EventIcon type={item.iconType} />
              <small>{item.count}</small>
            </span>
          ))}
        </div>
      ) : null}

      {player.tooltipLines.length ? (
        <div className={`player-marker-tooltip${tooltipClass}`}>
          <div className="player-marker-tooltip-head">
            <strong>{player.name}{player.isMvp ? <EventIcon type="mvp" /> : null}</strong>
            <span>{player.position}</span>
          </div>
          {player.tooltipLines.map((line) => (
            <small key={line}>{line}</small>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function JerseyMarker({ teamColors, position, isMvp = false }) {
  const maskStyle = {
    WebkitMaskImage: `url(${JERSEY_ICON})`,
    maskImage: `url(${JERSEY_ICON})`,
    '--jersey-start': teamColors?.[0] ?? '#41b7ff',
    '--jersey-end': teamColors?.[1] ?? teamColors?.[0] ?? '#2a8fd4',
  }

  return (
    <div className={`jersey-marker${isMvp ? ' is-mvp' : ''}`}>
      <span className="jersey-marker-body" style={maskStyle} />
      <span className="jersey-position-label">{position}</span>
    </div>
  )
}

export function ShotMapWidget({ match, homeTeam, awayTeam }) {
  const [visibleTypes, setVisibleTypes] = useState(SHOT_FILTERS)
  const shots = match.shotMap ?? []
  const filteredShots = shots.filter((shot) => visibleTypes.includes(shot.type))
  const teamNameLookup = {
    [homeTeam.id]: homeTeam.name,
    [awayTeam.id]: awayTeam.name,
  }

  function toggleType(type) {
    setVisibleTypes((current) => (
      current.includes(type) ? current.filter((value) => value !== type) : [...current, type]
    ))
  }

  return (
    <Widget title="Shot Map" className="span-full shot-map-widget">
      <div className="shot-map-pitch">
        <PitchLines orientation="horizontal" />
        <div className="pitch-watermark pitch-watermark-left">{homeTeam.crest}</div>
        <div className="pitch-watermark pitch-watermark-right">{awayTeam.crest}</div>
        {filteredShots.map((shot) => (
          <ShotMapIcon key={shot.id} shot={shot} teamName={teamNameLookup[shot.teamId] ?? shot.teamId} />
        ))}
      </div>

      <ShotMapLegend visibleTypes={visibleTypes} onToggle={toggleType} />
    </Widget>
  )
}

export function ShotMapIcon({ shot, teamName }) {
  return (
    <div
      className={`shot-map-icon shot-type-${shot.type}`}
      style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
    >
      <EventIcon type={shot.type} />
      <div className="shot-map-tooltip">
        <strong>{shot.playerName}</strong>
        <span>{teamName}</span>
        <small>{shot.minute}' | {formatEventLabel(shot.type)}</small>
      </div>
    </div>
  )
}

export function ShotMapLegend({ visibleTypes, onToggle }) {
  return (
    <div className="shot-map-legend">
      {SHOT_FILTERS.map((type) => {
        const active = visibleTypes.includes(type)

        return (
          <button
            key={type}
            type="button"
            className={`shot-map-legend-item${active ? ' is-active' : ''}`}
            onClick={() => onToggle(type)}
          >
            <span className="shot-map-legend-check">{active ? 'x' : ''}</span>
            <EventIcon type={type} />
            <span>{formatEventLabel(type)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ShotZonesWidget({ match, homeTeam, awayTeam }) {
  const zones = match.shotZoneMaps ?? buildFallbackShotZoneMaps(match, homeTeam, awayTeam)

  return (
    <Widget title="Shot Zones" className="span-full shot-zones-visual-widget">
      <div className="shot-zones-visual-grid">
        <ShotZoneMiniPitch zoneMap={zones.home} team={homeTeam} />
        <ShotZoneMiniPitch zoneMap={zones.away} team={awayTeam} />
      </div>
    </Widget>
  )
}

export function ShotZoneMiniPitch({ zoneMap, team }) {
  const zones = buildShotZoneLayout(zoneMap.zones ?? [], team, zoneMap)

  return (
    <article className="shot-zone-mini card">
      <header className="shot-zone-summary">
        <strong>{team.name}</strong>
        <span>{zoneMap.shots} shots</span>
        <span>{zoneMap.goals} goals</span>
        <span>{zoneMap.conversion}% conv.</span>
      </header>

      <div className="analytics-pitch analytics-pitch-horizontal analytics-pitch-mini analytics-pitch-attacking-third">
        <PitchLines orientation="zone" mini />
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`shot-zone-overlay${zone.percentage > 0 ? ' is-active' : ''}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              '--zone-opacity': Math.max(0.12, zone.percentage / 100),
            }}
            title={`${zone.shots} shots | ${zone.goals} goals | Occupied longest by ${zone.occupant}`}
          >
            {zone.percentage > 0 ? <strong>{zone.percentage}%</strong> : null}
          </div>
        ))}
      </div>
    </article>
  )
}

export function HeadToHeadWidget({ match, homeTeam, awayTeam }) {
  const comparison = useMemo(() => buildHeadToHeadModel(match), [match])

  return (
    <Widget title="Head To Head" className="span-two head-to-head-widget">
      <div className="accuracy-rings-row">
        <CircularAccuracyRing label={`${homeTeam.shortName} Shot Accuracy`} value={comparison.homeShotAccuracy} color="var(--cyan)" />
        <CircularAccuracyRing label={`${homeTeam.shortName} Pass Accuracy`} value={comparison.homePassAccuracy} color="var(--blue)" />
        <CircularAccuracyRing label={`${awayTeam.shortName} Shot Accuracy`} value={comparison.awayShotAccuracy} color="var(--red-soft)" />
        <CircularAccuracyRing label={`${awayTeam.shortName} Pass Accuracy`} value={comparison.awayPassAccuracy} color="var(--purple)" />
      </div>

      <div className="mirrored-stat-list">
        {comparison.rows.map((row) => (
          <MirroredStatBar key={row.label} row={row} />
        ))}
      </div>
    </Widget>
  )
}

export function CircularAccuracyRing({ label, value, color }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const clampedValue = Math.max(0, Math.min(100, value))
  const dashOffset = circumference - (clampedValue / 100) * circumference

  return (
    <div className="accuracy-ring-card">
      <div className="accuracy-ring-shell">
        <svg viewBox="0 0 84 84" className="accuracy-ring">
          <circle cx="42" cy="42" r={radius} className="accuracy-ring-track" />
          <circle
            cx="42"
            cy="42"
            r={radius}
            className="accuracy-ring-progress"
            style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="accuracy-ring-center">
          <strong>{Math.round(clampedValue)}%</strong>
        </div>
      </div>
      <span>{label}</span>
    </div>
  )
}

export function MirroredStatBar({ row }) {
  const widths = getMirroredBarWidths(row)

  return (
    <div className="mirrored-stat-row">
      <div className="mirrored-stat-values">
        <strong>{formatStatValue(row.homeValue, row.type)}</strong>
        <span>{row.label}</span>
        <strong>{formatStatValue(row.awayValue, row.type)}</strong>
      </div>
      <div className="mirrored-stat-bars">
        <div className="mirrored-bar-side mirrored-bar-home">
          <i style={{ width: `${widths.home}%` }} />
        </div>
        <div className="mirrored-bar-divider" />
        <div className="mirrored-bar-side mirrored-bar-away">
          <i style={{ width: `${widths.away}%` }} />
        </div>
      </div>
    </div>
  )
}

export function FullPlayerStatsWidget({ match, homeTeam, awayTeam }) {
  const homeRows = useMemo(() => buildMatchPlayerStatRows(match, 'home'), [match])
  const awayRows = useMemo(() => buildMatchPlayerStatRows(match, 'away'), [match])

  return (
    <Widget title="Full Player Stats" className="span-full full-player-stats-widget">
      <div className="player-stats-widget-grid">
        <TeamStatsTable team={homeTeam} rows={homeRows} />
        <TeamStatsTable team={awayTeam} rows={awayRows} />
      </div>
    </Widget>
  )
}

function TeamStatsTable({ team, rows }) {
  return (
    <article className="team-player-stats-card">
      <header className="team-player-stats-head">
        <div className="team-lineup-title">
          <Crest teamId={team.id} />
          <div>
            <strong>{team.name}</strong>
            <small>Match player stats</small>
          </div>
        </div>
      </header>

      <div className="player-stats-table-shell">
        <table className="player-stats-table-compact">
          <thead>
            <tr>
              {PLAYER_STAT_COLUMNS.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {PLAYER_STAT_COLUMNS.map((column) => (
                  <td key={`${row.id}-${column.key}`}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function PitchLines({ orientation, mini = false }) {
  if (orientation === 'horizontal') {
    return (
      <>
        <div className="analytics-pitch-halfway analytics-pitch-halfway-horizontal" />
        <div className={`analytics-pitch-circle${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-box analytics-pitch-box-left${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-box analytics-pitch-box-right${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-goal-box analytics-pitch-goal-box-left${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-goal-box analytics-pitch-goal-box-right${mini ? ' is-mini' : ''}`} />
        <div className="analytics-pitch-goal-frame analytics-pitch-goal-frame-left" />
        <div className="analytics-pitch-goal-frame analytics-pitch-goal-frame-right" />
      </>
    )
  }

  if (orientation === 'zone') {
    return (
      <>
        <div className="analytics-pitch-zone-box" />
        <div className="analytics-pitch-zone-goal-box" />
        <div className="analytics-pitch-zone-goal-frame" />
        <div className="analytics-pitch-zone-spot" />
        <div className="analytics-pitch-zone-arc" />
      </>
    )
  }

  return (
      <>
        <div className="analytics-pitch-halfway analytics-pitch-halfway-vertical" />
        <div className={`analytics-pitch-circle${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-box analytics-pitch-box-top${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-box analytics-pitch-box-bottom${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-goal-box analytics-pitch-goal-box-top${mini ? ' is-mini' : ''}`} />
        <div className={`analytics-pitch-goal-box analytics-pitch-goal-box-bottom${mini ? ' is-mini' : ''}`} />
        <div className="analytics-pitch-goal-frame analytics-pitch-goal-frame-top" />
        <div className="analytics-pitch-goal-frame analytics-pitch-goal-frame-bottom" />
      </>
  )
}

function buildLineupPlayers(lineup = [], format, tooltipLookup = {}) {
  const slots = FORMATION_COORDS[format] ?? FORMATION_COORDS['5v5']
  const normalized = lineup.map((entry) => ({ ...entry, position: normalizeRole(entry.role) }))
  const used = new Set()

  return slots.map((slot, slotIndex) => {
    const directIndex = normalized.findIndex((entry, entryIndex) => !used.has(entryIndex) && entry.position === slot.position)
    const fallbackIndex = directIndex >= 0 ? directIndex : normalized.findIndex((_, entryIndex) => !used.has(entryIndex))
    const source = fallbackIndex >= 0 ? normalized[fallbackIndex] : null

    if (fallbackIndex >= 0) {
      used.add(fallbackIndex)
    }

    const player = source?.playerId ? getPlayerById(source.playerId) : null
    const name = player?.name ?? source?.player ?? `Starter ${slotIndex + 1}`
    const id = source?.playerId ?? `${slot.position}-${slotIndex}`
    const badges = source?.badges ?? []

    return {
      id,
      playerId: source?.playerId ?? null,
      name,
      position: slot.position,
      rating: typeof source?.rating === 'number' ? source.rating : 0,
      x: slot.x,
      y: slot.y,
      isMvp: badges.some((badge) => badge.type === 'mvp'),
      events: badgesToEvents(badges),
      tooltipLines: source?.playerId ? (tooltipLookup[source.playerId] ?? []) : [],
    }
  })
}

function badgesToEvents(badges = []) {
  const byType = badges.reduce((accumulator, badge) => {
    accumulator[badge.type] = (accumulator[badge.type] ?? 0) + (badge.count ?? 1)
    return accumulator
  }, {})

  return {
    goals: byType.goal ?? 0,
    assists: byType.assist ?? 0,
    yellowCards: byType['yellow-card'] ?? 0,
    secondYellowCards: byType.second_yellow ?? byType['second-yellow'] ?? 0,
    redCards: byType['red-card'] ?? 0,
    saves: byType.save ?? 0,
    ownGoals: byType['own-goal'] ?? 0,
  }
}

function buildBottomMarkerEvents(events, position) {
  const primary = position === 'GK'
    ? [toEventBadgeData('save', events)]
    : [toEventBadgeData('goal', events), toEventBadgeData('assist', events)]

  const disciplinary = [
    toEventBadgeData('yellow-card', events),
    toEventBadgeData('second_yellow', events),
    toEventBadgeData('red-card', events),
    toEventBadgeData('own-goal', events),
  ]

  return [...primary, ...disciplinary].filter(Boolean)
}

function toEventBadgeData(kind, events) {
  const map = {
    goal: { type: 'goal', count: events.goals, iconType: 'goal' },
    assist: { type: 'assist', count: events.assists, iconType: 'assist' },
    save: { type: 'save', count: events.saves, iconType: 'save' },
    'yellow-card': { type: 'yellow-card', count: events.yellowCards, iconType: 'yellow-card' },
    second_yellow: { type: 'second_yellow', count: events.secondYellowCards, iconType: 'second_yellow' },
    'red-card': { type: 'red-card', count: events.redCards, iconType: 'red-card' },
    'own-goal': { type: 'own-goal', count: events.ownGoals, iconType: 'own-goal' },
  }

  const item = map[kind]
  return item && item.count > 0 ? item : null
}

function normalizeRole(role) {
  return String(role ?? '').trim().toUpperCase()
}

function getRatingBadgeClass(rating, isMvp = false) {
  if (isMvp) return 'rating-mvp'
  if (rating < 6) return 'rating-low'
  if (rating < 7.2) return 'rating-grey'
  if (rating < 7.8) return 'rating-green'
  if (rating < 8.5) return 'rating-blue'
  return 'rating-purple'
}

function formatEventLabel(type) {
  return type
    .replaceAll('_', '-')
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function buildShotZoneLayout(zones, team, summary) {
  const byId = new Map(zones.map((zone) => [zone.id, zone]))
  return SHOT_ZONE_TEMPLATE.map((template, index) => {
    const zone = byId.get(template.id) ?? zones[index] ?? null
    const percentage = zone?.percentage ?? 0
    const shots = zone?.shots ?? Math.max(0, Math.round((percentage / 100) * (summary.shots || 0)))
    const goals = zone?.goals ?? Math.min(summary.goals || 0, Math.round((percentage / 100) * Math.max(summary.goals || 0, 1)))
    return {
      ...template,
      id: zone?.id ?? template.id,
      percentage,
      shots,
      goals,
      occupant: zone?.occupant ?? team.captain,
    }
  })
}

function buildFallbackShotZoneMaps(match, homeTeam, awayTeam) {
  const homeShots = getComparisonValue(match.comparisonStats, 'Shots', 'home')
  const awayShots = getComparisonValue(match.comparisonStats, 'Shots', 'away')

  return {
    home: {
      teamId: homeTeam.id,
      shots: homeShots,
      goals: match.homeScore,
      conversion: toConversion(match.homeScore, homeShots),
      zones: [
        { id: 'zone-1', percentage: 8 },
        { id: 'zone-2', percentage: 5 },
        { id: 'zone-6', percentage: 7 },
        { id: 'zone-9', percentage: 18 },
        { id: 'zone-10', percentage: 12 },
        { id: 'zone-11', percentage: 9 },
        { id: 'zone-17', percentage: 16 },
        { id: 'zone-18', percentage: 10 },
        { id: 'zone-19', percentage: 7 },
      ],
    },
    away: {
      teamId: awayTeam.id,
      shots: awayShots,
      goals: match.awayScore,
      conversion: toConversion(match.awayScore, awayShots),
      zones: [
        { id: 'zone-3', percentage: 7 },
        { id: 'zone-4', percentage: 11 },
        { id: 'zone-5', percentage: 6 },
        { id: 'zone-10', percentage: 14 },
        { id: 'zone-11', percentage: 15 },
        { id: 'zone-12', percentage: 9 },
        { id: 'zone-18', percentage: 12 },
        { id: 'zone-19', percentage: 10 },
        { id: 'zone-20', percentage: 9 },
      ],
    },
  }
}

function toConversion(goals, shots) {
  if (!shots) return 0
  return Math.round((goals / shots) * 100)
}

function buildHeadToHeadModel(match) {
  const homeShots = getComparisonValue(match.comparisonStats, 'Shots', 'home')
  const awayShots = getComparisonValue(match.comparisonStats, 'Shots', 'away')
  const homeShotsOnGoal = getComparisonValue(match.comparisonStats, 'Shots on target', 'home')
  const awayShotsOnGoal = getComparisonValue(match.comparisonStats, 'Shots on target', 'away')
  const homePassCompleted = getComparisonValue(match.comparisonStats, 'Passes completed', 'home')
  const awayPassCompleted = getComparisonValue(match.comparisonStats, 'Passes completed', 'away')
  const homePassAccuracy = getComparisonValue(match.comparisonStats, 'Pass accuracy', 'home')
  const awayPassAccuracy = getComparisonValue(match.comparisonStats, 'Pass accuracy', 'away')
  const homePasses = getComparisonValue(match.comparisonStats, 'Passes', 'home') || inferAttempts(homePassCompleted, homePassAccuracy)
  const awayPasses = getComparisonValue(match.comparisonStats, 'Passes', 'away') || inferAttempts(awayPassCompleted, awayPassAccuracy)
  const homeSaves = Math.max(0, awayShotsOnGoal - match.awayScore)
  const awaySaves = Math.max(0, homeShotsOnGoal - match.homeScore)
  const homeYellowCards = countLineupEvent(match.lineups.home, 'yellow-card') + countLineupEvent(match.lineups.home, 'second_yellow')
  const awayYellowCards = countLineupEvent(match.lineups.away, 'yellow-card') + countLineupEvent(match.lineups.away, 'second_yellow')
  const homeRedCards = countLineupEvent(match.lineups.home, 'red-card')
  const awayRedCards = countLineupEvent(match.lineups.away, 'red-card')

  const rows = HEAD_TO_HEAD_LABELS.map((label) => {
    switch (label) {
      case 'Possession':
        return { label, homeValue: getComparisonValue(match.comparisonStats, 'Possession', 'home'), awayValue: getComparisonValue(match.comparisonStats, 'Possession', 'away'), type: 'percentage' }
      case 'Shots':
        return { label, homeValue: homeShots, awayValue: awayShots, type: 'count' }
      case 'Shots on Goal':
        return { label, homeValue: homeShotsOnGoal, awayValue: awayShotsOnGoal, type: 'count' }
      case 'Saves':
        return { label, homeValue: homeSaves, awayValue: awaySaves, type: 'count' }
      case 'Passes':
        return { label, homeValue: homePasses, awayValue: awayPasses, type: 'count' }
      case 'Passes Completed':
        return { label, homeValue: homePassCompleted, awayValue: awayPassCompleted, type: 'count' }
      case 'Interceptions':
        return { label, homeValue: getComparisonValue(match.comparisonStats, 'Interceptions', 'home'), awayValue: getComparisonValue(match.comparisonStats, 'Interceptions', 'away'), type: 'count' }
      case 'Corners':
        return { label, homeValue: getComparisonValue(match.comparisonStats, 'Corners', 'home'), awayValue: getComparisonValue(match.comparisonStats, 'Corners', 'away'), type: 'count' }
      case 'Fouls':
        return { label, homeValue: getComparisonValue(match.comparisonStats, 'Fouls', 'home'), awayValue: getComparisonValue(match.comparisonStats, 'Fouls', 'away'), type: 'count' }
      case 'Offsides':
        return { label, homeValue: getComparisonValue(match.comparisonStats, 'Offsides', 'home'), awayValue: getComparisonValue(match.comparisonStats, 'Offsides', 'away'), type: 'count' }
      case 'Yellow Cards':
        return { label, homeValue: homeYellowCards, awayValue: awayYellowCards, type: 'count' }
      case 'Red Cards':
        return { label, homeValue: homeRedCards, awayValue: awayRedCards, type: 'count' }
      default:
        return { label, homeValue: 0, awayValue: 0, type: 'count' }
    }
  })

  return {
    homeShotAccuracy: toAccuracy(homeShotsOnGoal, homeShots),
    homePassAccuracy,
    awayShotAccuracy: toAccuracy(awayShotsOnGoal, awayShots),
    awayPassAccuracy,
    rows,
  }
}

function buildMatchPlayerStatRows(match, side) {
  const isHome = side === 'home'
  const lineup = isHome ? match.lineups.home : match.lineups.away
  const goalsConceded = isHome ? match.awayScore : match.homeScore
  const performances = match.performances ?? []

  return lineup.map((entry, index) => {
    const player = entry.playerId ? getPlayerById(entry.playerId) : null
    const seasonStats = player?.stats ?? {}
    const performance = performances.find((item) => item.playerId && item.playerId === entry.playerId) ?? {}
    const badges = badgesToEvents(entry.badges ?? [])
    const position = normalizeRole(entry.role)
    const rating = Number(entry.rating ?? 7)
    const passes = derivePasses(position, rating, seasonStats)
    const completionPct = deriveCompletionPct(position, seasonStats)
    const completed = Math.min(passes, Math.round(passes * (completionPct / 100)))
    const goals = performance.goals ?? badges.goals
    const assists = performance.assists ?? badges.assists
    const saves = performance.saves ?? badges.saves
    const shots = deriveShots(position, rating, goals, assists)
    const onTarget = Math.min(shots, Math.max(goals, Math.round(shots * 0.6)))
    const secondAssists = goals === 0 && assists > 0 ? 1 : Math.min(1, Math.round((seasonStats.secondAssists ?? 0) / 12))
    const keyPasses = Math.max(assists, Math.round(passes * (position === 'GK' ? 0.03 : 0.08)))
    const chancesCreated = Math.max(assists, keyPasses - (position === 'GK' ? 0 : 1))
    const interceptions = performance.interceptions ?? deriveInterceptions(position, rating)
    const possessions = derivePossessions(position, rating)
    const offsides = position === 'CF' || position === 'LW' || position === 'RW' || position === 'LM' || position === 'RM' ? Math.max(0, Math.round((rating - 6.5) / 1.5)) : 0
    const distance = `${deriveDistance(position, rating).toFixed(2)}km`
    const fouls = deriveFouls(position)
    const foulsSuffered = Math.max(0, assists + Math.round(rating / 4) - 1)
    const ownGoals = badges.ownGoals
    const yellowCards = badges.yellowCards + badges.secondYellowCards
    const redCards = badges.redCards
    const corners = ['LW', 'RW', 'LM', 'RM', 'CM'].includes(position) ? assists + (goals > 0 ? 1 : 0) : 0
    const throwIns = ['LB', 'RB'].includes(position) ? 2 : 0
    const freeKicks = ['CM', 'CF', 'LW', 'RW'].includes(position) ? Math.max(0, assists) : 0
    const goalKicks = position === 'GK' ? Math.max(2, goalsConceded + 2) : 0
    const penalties = goals > 0 && position === 'CF' ? 1 : 0

    return {
      id: `${side}-${entry.playerId ?? entry.player ?? index}`,
      player: player?.name ?? entry.player ?? `Starter ${index + 1}`,
      position,
      goals,
      shots,
      onTarget,
      assists,
      secondAssists,
      keyPasses,
      chancesCreated,
      passes,
      completed,
      completionPct: `${completionPct}%`,
      interceptions,
      possessions,
      saves,
      offsides,
      distance,
      fouls,
      foulsSuffered,
      ownGoals,
      goalsConceded: position === 'GK' ? goalsConceded : 0,
      corners,
      throwIns,
      freeKicks,
      goalKicks,
      penalties,
      yellowCards,
      redCards,
    }
  })
}

function derivePasses(position, rating, seasonStats) {
  if (seasonStats.passesCompleted) {
    const baseline = seasonStats.passesCompleted / Math.max(1, seasonStats.appearances ?? 1)
    return Math.max(12, Math.round(baseline))
  }

  const byRole = {
    GK: 18,
    LB: 24,
    CB: 26,
    RB: 24,
    CM: 30,
    LM: 22,
    RM: 22,
    LW: 21,
    RW: 21,
    CF: 18,
  }

  return Math.max(12, Math.round((byRole[position] ?? 20) + (rating - 7) * 3))
}

function deriveCompletionPct(position, seasonStats) {
  if (seasonStats.passAccuracy) {
    return Math.round(seasonStats.passAccuracy)
  }

  const byRole = {
    GK: 82,
    LB: 80,
    CB: 83,
    RB: 80,
    CM: 86,
    LM: 79,
    RM: 79,
    LW: 76,
    RW: 76,
    CF: 74,
  }

  return byRole[position] ?? 78
}

function deriveShots(position, rating, goals, assists) {
  const base = ['CF', 'LW', 'RW', 'LM', 'RM'].includes(position) ? 3 : position === 'CM' ? 2 : 1
  return Math.max(goals, base + Math.max(0, Math.round(rating - 7)) + assists)
}

function deriveInterceptions(position, rating) {
  const base = {
    GK: 0,
    LB: 4,
    CB: 6,
    RB: 4,
    CM: 5,
    LM: 2,
    RM: 2,
    LW: 1,
    RW: 1,
    CF: 1,
  }

  return Math.max(0, (base[position] ?? 2) + Math.round((rating - 7) * 2))
}

function derivePossessions(position, rating) {
  const base = ['CF', 'LW', 'RW'].includes(position) ? 9 : ['CM', 'LM', 'RM'].includes(position) ? 7 : ['LB', 'CB', 'RB'].includes(position) ? 5 : 3
  return Math.max(1, base + Math.round((rating - 7) * 1.5))
}

function deriveDistance(position, rating) {
  const base = {
    GK: 1.9,
    LB: 6.9,
    CB: 6.4,
    RB: 6.9,
    CM: 7.8,
    LM: 7.3,
    RM: 7.3,
    LW: 7.1,
    RW: 7.1,
    CF: 6.7,
  }

  return Math.max(1.5, (base[position] ?? 6.2) + (rating - 7) * 0.32)
}

function deriveFouls(position) {
  return ['CB', 'LB', 'RB'].includes(position) ? 1 : 0
}

function getComparisonValue(rows, label, side) {
  const entry = rows.find(([rowLabel]) => rowLabel.toLowerCase() === label.toLowerCase())
  if (!entry) return 0
  return side === 'home' ? Number(entry[1]) || 0 : Number(entry[2]) || 0
}

function inferAttempts(completed, accuracy) {
  if (!completed || !accuracy) return 0
  return Math.round(completed / (accuracy / 100))
}

function countLineupEvent(lineup, type) {
  return lineup.reduce((total, entry) => (
    total + (entry.badges?.find((badge) => badge.type === type)?.count ?? 0)
  ), 0)
}

function toAccuracy(success, attempts) {
  if (!attempts) return 0
  return Math.round((success / attempts) * 100)
}

function getMirroredBarWidths(row) {
  if (row.type === 'percentage') {
    return {
      home: Math.max(0, Math.min(100, row.homeValue)),
      away: Math.max(0, Math.min(100, row.awayValue)),
    }
  }

  const total = row.homeValue + row.awayValue
  if (!total) {
    return { home: 0, away: 0 }
  }

  return {
    home: (row.homeValue / total) * 100,
    away: (row.awayValue / total) * 100,
  }
}

function formatStatValue(value, type) {
  return type === 'percentage' ? `${value}%` : value
}
