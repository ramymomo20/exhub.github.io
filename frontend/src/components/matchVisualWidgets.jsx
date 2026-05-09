import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crest, EventIcon, Widget } from './ui'
import { getPlayerById } from '../data/repository'

const JERSEY_ICON = `${import.meta.env.BASE_URL}icons/jersey-icon.png`

const SHOT_FILTERS = ['goal', 'save', 'miss', 'yellow-card', 'red-card', 'own-goal']

const FORMATION_COORDS = {
  '4v4': [
    { position: 'GK', x: 50, y: 82 },
    { position: 'CB', x: 50, y: 60 },
    { position: 'LM', x: 24, y: 27 },
    { position: 'RM', x: 76, y: 27 },
  ],
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

export function LineupsWidget({ match, homeTeam, awayTeam }) {
  const [viewMode, setViewMode] = useState('stats')
  const homePlayers = useMemo(() => buildLineupPlayers(match.lineups.home, match.format, match.lineupTooltips), [match])
  const awayPlayers = useMemo(() => buildLineupPlayers(match.lineups.away, match.format, match.lineupTooltips), [match])

  return (
    <Widget
      title="Lineups"
      className="span-full lineups-visual-widget"
      action={
        <div className="widget-toggle-row">
          {['stats', 'titles'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`widget-toggle-pill${viewMode === mode ? ' is-active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'stats' ? 'Stats' : 'Titles'}
            </button>
          ))}
        </div>
      }
    >
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
  return (
    <div className={`player-marker${mode === 'titles' ? ' is-title-view' : ''}`} style={{ left: `${player.x}%`, top: `${player.y}%` }}>
      <div className="player-marker-visual">
        {mode === 'stats' ? <span className={`rating-badge ${getRatingBadgeClass(player.rating)}`}>{player.rating.toFixed(1)}</span> : null}
        <div className="event-stack-vertical event-stack-left">
          {mode === 'stats' ? renderEventStack(player.events, ['goal', 'assist', 'save']) : null}
        </div>
        <JerseyMarker teamColors={teamColors} position={player.position} />
        <div className="event-stack-vertical event-stack-right">
          {mode === 'stats' ? renderEventStack(player.events, ['yellow-card', 'red-card', 'own-goal']) : null}
        </div>
      </div>

      {player.playerId ? (
        <Link className="player-nameplate" to={`/players/${player.playerId}`}>
          {player.name}
        </Link>
      ) : (
        <span className="player-nameplate">{player.name}</span>
      )}

      {player.tooltipLines.length ? (
        <div className="player-marker-tooltip">
          <strong>{player.name}</strong>
          <span>{player.position}</span>
          {player.tooltipLines.map((line) => (
            <small key={line}>{line}</small>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function JerseyMarker({ teamColors, position }) {
  const maskStyle = {
    WebkitMaskImage: `url(${JERSEY_ICON})`,
    maskImage: `url(${JERSEY_ICON})`,
    '--jersey-start': teamColors?.[0] ?? '#41b7ff',
    '--jersey-end': teamColors?.[1] ?? teamColors?.[0] ?? '#2a8fd4',
  }

  return (
    <div className="jersey-marker">
      <span className="jersey-marker-body" style={maskStyle} />
      <span className="jersey-position-label">{position}</span>
    </div>
  )
}

export function ShotMapWidget({ match, homeTeam, awayTeam }) {
  const [visibleTypes, setVisibleTypes] = useState(SHOT_FILTERS)
  const shots = match.shotMap ?? []
  const filteredShots = shots.filter((shot) => visibleTypes.includes(shot.type))

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
          <ShotMapIcon key={shot.id} shot={shot} />
        ))}
      </div>

      <ShotMapLegend visibleTypes={visibleTypes} onToggle={toggleType} />
    </Widget>
  )
}

export function ShotMapIcon({ shot }) {
  return (
    <div
      className={`shot-map-icon shot-type-${shot.type}`}
      style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
      title={`${shot.playerName} · ${shot.minute}' · ${shot.type}`}
    >
      <EventIcon type={shot.type} />
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
  return (
    <article className="shot-zone-mini card">
      <header className="shot-zone-summary">
        <strong>{team.name}</strong>
        <span>{zoneMap.shots} shots</span>
        <span>{zoneMap.goals} goals</span>
        <span>{zoneMap.conversion}% conv.</span>
      </header>

      <div className="analytics-pitch analytics-pitch-horizontal analytics-pitch-mini">
        <PitchLines orientation="horizontal" mini />
        {zoneMap.zones.map((zone) => (
          <div
            key={zone.id}
            className="shot-zone-overlay"
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              '--zone-opacity': Math.max(0.14, zone.percentage / 100),
            }}
          >
            <strong>{zone.percentage}%</strong>
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
        <div className="analytics-pitch-spot analytics-pitch-spot-left" />
        <div className="analytics-pitch-spot analytics-pitch-spot-right" />
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
      <div className="analytics-pitch-spot analytics-pitch-spot-top" />
      <div className="analytics-pitch-spot analytics-pitch-spot-bottom" />
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

    return {
      id,
      playerId: source?.playerId ?? null,
      name,
      position: slot.position,
      rating: typeof source?.rating === 'number' ? source.rating : 0,
      x: slot.x,
      y: slot.y,
      events: badgesToEvents(source?.badges ?? []),
      tooltipLines: source?.playerId ? (tooltipLookup[source.playerId] ?? []) : [],
    }
  })
}

function badgesToEvents(badges = []) {
  const byType = Object.fromEntries(badges.map((badge) => [badge.type, badge.count]))

  return {
    goals: byType.goal ?? 0,
    assists: byType.assist ?? 0,
    yellowCards: byType['yellow-card'] ?? 0,
    redCards: byType['red-card'] ?? 0,
    saves: byType.save ?? 0,
    ownGoals: byType['own-goal'] ?? 0,
  }
}

function renderEventStack(events, kinds) {
  const items = kinds
    .map((kind) => toEventBadgeData(kind, events))
    .filter(Boolean)

  return items.map((item) => (
    <span key={item.type} className={`marker-event-badge marker-event-${item.type}`}>
      <EventIcon type={item.iconType} />
      <small>{item.count}</small>
    </span>
  ))
}

function toEventBadgeData(kind, events) {
  const map = {
    goal: { type: 'goal', count: events.goals, iconType: 'goal' },
    assist: { type: 'assist', count: events.assists, iconType: 'assist' },
    save: { type: 'save', count: events.saves, iconType: 'save' },
    'yellow-card': { type: 'yellow-card', count: events.yellowCards, iconType: 'yellow-card' },
    'red-card': { type: 'red-card', count: events.redCards, iconType: 'red-card' },
    'own-goal': { type: 'own-goal', count: events.ownGoals, iconType: 'own-goal' },
  }

  const item = map[kind]
  return item && item.count > 0 ? item : null
}

function normalizeRole(role) {
  return String(role ?? '').trim().toUpperCase()
}

function getRatingBadgeClass(rating) {
  if (rating >= 8) return 'rating-elite'
  if (rating < 6.5) return 'rating-low'
  return 'rating-regular'
}

function formatEventLabel(type) {
  return type
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
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
        { id: 'left-box', x: 16, y: 46, width: 16, height: 20, percentage: 24 },
        { id: 'center-box', x: 37, y: 38, width: 22, height: 28, percentage: 32 },
        { id: 'right-box', x: 63, y: 46, width: 16, height: 20, percentage: 19 },
      ],
    },
    away: {
      teamId: awayTeam.id,
      shots: awayShots,
      goals: match.awayScore,
      conversion: toConversion(match.awayScore, awayShots),
      zones: [
        { id: 'left-box', x: 16, y: 46, width: 16, height: 20, percentage: 18 },
        { id: 'center-box', x: 37, y: 38, width: 22, height: 28, percentage: 28 },
        { id: 'right-box', x: 63, y: 46, width: 16, height: 20, percentage: 21 },
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
  const homeYellowCards = countLineupEvent(match.lineups.home, 'yellow-card')
  const awayYellowCards = countLineupEvent(match.lineups.away, 'yellow-card')
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
