import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FormPills, PageTrail, StatChip, TeamInlineLink, Widget } from '../components/ui'
import { getPlayerById, getPlayerPerformance, listPlayerMatchLogs, useHubPlayerDetail } from '../data/repository'
import { getRatingToneClass } from '../utils/rating'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const { loading } = useHubPlayerDetail(playerId)
  const player = getPlayerById(playerId)
  const [page, setPage] = useState(0)
  const steamIcon = `${import.meta.env.BASE_URL}icons/steam-icon.png`

  if (!player && loading) {
    return null
  }

  if (!player) {
    return <Navigate to="/players" replace />
  }

  const matchLogs = listPlayerMatchLogs(player.id)
  const pagedLogs = matchLogs.slice(page * 3, page * 3 + 3)

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Players', to: '/players' }, { label: player.name }]} />

      <section className="profile-hero card profile-hero-reworked">
        <div className="profile-portrait-column">
          <div className="profile-top-badges">
            <div className="profile-badge-stack">
              <small>OVR</small>
              <span className={`profile-big-badge ${getRatingToneClass(player.rating)}`}>{player.rating}</span>
            </div>
            <div className="profile-badge-stack">
              <small>POS</small>
              <span className="profile-big-badge profile-position-badge">{player.position}</span>
            </div>
          </div>
          <div className={`profile-portrait profile-portrait-rated ${getRatingToneClass(player.rating)}`}>{player.portrait}</div>
        </div>

        <div className="profile-center">
          <span className="eyebrow">Player Profile</span>
          <h1>{player.name}</h1>
          <div className="profile-badges">
            <TeamInlineLink teamId={player.teamId} />
            <FormPills values={getPlayerForm(matchLogs, player.id)} />
            <a
              className="steam-redirect-badge steam-redirect-badge-wide"
              href={`https://steamcommunity.com/id/${player.id}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Steam profile"
            >
              <img src={steamIcon} alt="" />
              <span>Steam Profile</span>
            </a>
          </div>
          <div className="profile-focus-grid">
            <div className="profile-focus-card">
              <span>Goals</span>
              <strong>{player.stats.goals}</strong>
            </div>
            <div className="profile-focus-card">
              <span>Assists</span>
              <strong>{player.stats.assists}</strong>
            </div>
            <div className="profile-focus-card">
              <span>Passes</span>
              <strong>{player.stats.apasses}</strong>
            </div>
            <div className="profile-focus-card">
              <span>Interceptions</span>
              <strong>{player.stats.interceptions}</strong>
            </div>
          </div>
        </div>

        <div className="profile-summary">
          <StatChip label="Matches" value={player.stats.appearances} tone="neutral" />
          <StatChip label="Win Rate" value={`${player.stats.winRate}%`} tone="success" />
          <StatChip label="MOTM" value={player.stats.motm} tone="positive" />
          <StatChip label="Avg Rating" value={player.stats.avgRating} tone="premium" />
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Records" className="span-two">
          {player.records.length ? (
            <div className="record-link-list">
              {player.records.map((record) => (
                <Link key={record.label} className="record-link-card" to={`/matches/${record.matchId}`}>
                  <strong>{record.label}</strong>
                  <span>{record.value}</span>
                  <small>{record.summary}</small>
                </Link>
              ))}
            </div>
          ) : (
            <p>No per-match record log has been synced for this player yet.</p>
          )}
        </Widget>

        <Widget title="Activity Map">
          <ActivityMap values={player.activity} />
        </Widget>

        <Widget title="Rating Change">
          <RatingTrendChart values={buildRatingHistory(player)} />
        </Widget>

        <Widget title="Statistics" className="span-full">
          <div className="stats-section-grid">
            <StatSection title="General" items={[
              ['Appearances', player.stats.appearances],
              ['As subs', player.stats.subAppearances],
              ['Wins', player.stats.wins],
              ['Draws', player.stats.draws],
              ['Losses', player.stats.losses],
              ['Win rate', `${player.stats.winRate}%`],
            ]} />
            <StatSection title="Teamplay" items={[
              ['Assists', player.stats.assists],
              ['Passes', player.stats.apasses],
              ['Passes completed', player.stats.passesCompleted],
              ['Pass accuracy', `${player.stats.passAccuracy}%`],
              ['Key passes', player.stats.keyPasses],
              ['Chances created', player.stats.chancesCreated],
              ['Second assists', player.stats.secondAssists],
            ]} />
            <StatSection title="Discipline" items={[
              ['Fouls', player.stats.fouls],
              ['Fouls suffered', player.stats.foulsSuffered],
              ['Yellow cards', player.stats.yellowCards],
              ['Red cards', player.stats.redCards],
              ['Offsides', player.stats.offsides],
            ]} />
            <StatSection title="Goalkeeping" items={[
              ['Saves', player.stats.saves],
              ['Saves caught', player.stats.savesCaught],
              ['Save percentage', player.stats.savePercentage ? `${player.stats.savePercentage}%` : '0%'],
              ['Goals conceded', player.stats.goalsConceded],
              ['Own goals', player.stats.ownGoals],
            ]} />
            <StatSection title="Defending" items={[
              ['Interceptions', player.stats.interceptions],
              ['Tackles', player.stats.tackles],
              ['Tackles completed', player.stats.tacklesCompleted],
              ['Tackle accuracy', `${player.stats.tackleAccuracy}%`],
              ['Average distance ran', `${player.stats.distanceRan} km`],
            ]} />
            <StatSection title="Attacking" items={[
              ['Goals', player.stats.goals],
              ['Shots', player.stats.shots],
              ['Shots on target', player.stats.shotsOnTarget],
              ['Shot accuracy', `${player.stats.shotAccuracy}%`],
              ['Goals per game', player.stats.goalsPerGame],
            ]} />
          </div>
        </Widget>

        <Widget title="Match Directory" className="span-two">
          <div className="results-stack">
            {pagedLogs.map((match) => {
              const performance = getPlayerPerformance(match.id, player.id)
              return (
                <Link key={match.id} className="log-card log-card-link" to={`/matches/${match.id}`}>
                  <div>
                    <strong>{match.competition}</strong>
                    <p>{match.date} | {match.time}</p>
                  </div>
                  <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                  <div>
                    <strong>{performance?.rating ?? '-'}</strong>
                    <p>{performance?.goals ?? 0}G | {performance?.assists ?? 0}A | {performance?.yellowCards ?? 0}YC</p>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="pager-row">
            <button className="ghost-button" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Prev</button>
            <button className="ghost-button" type="button" disabled={(page + 1) * 3 >= matchLogs.length} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </Widget>

        <Widget title="Tournament Form">
          {player.tournamentSummary?.current ? (
            <div className="tournament-summary-card">
              <strong>{player.tournamentSummary.current.tournamentId.replaceAll('-', ' ')}</strong>
              <p>Team place: {player.tournamentSummary.current.teamPlace}</p>
              <small>{player.tournamentSummary.current.stats}</small>
            </div>
          ) : (
            <p>No synced tournament placement data for this player yet.</p>
          )}
        </Widget>

        <Widget title="Previous Tournaments">
          {player.tournamentSummary?.history?.length ? (
            <div className="timeline">
              {player.tournamentSummary.history.map((item) => (
                <div key={`${item.tournamentId}-${item.teamPlace}`} className="timeline-item">
                  <strong>{item.tournamentId.replaceAll('-', ' ')}</strong>
                  <p>Team place {item.teamPlace}</p>
                  <small>{item.stats}</small>
                  {item.won ? <span className="crown-marker">Crown</span> : null}
                </div>
              ))}
            </div>
          ) : (
            <p>No historical tournament archive has been synced for this player yet.</p>
          )}
        </Widget>
      </section>
    </div>
  )
}

function ActivityMap({ values }) {
  const cells = buildActivityCells(values)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="activity-map-shell">
      <div className="activity-map-axis-top">
        {months.map((month) => <span key={month}>{month}</span>)}
      </div>
      <div className="activity-map-legend">
        <span>Low</span>
        <div className="activity-map-legend-scale">
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <span key={value} className={`activity-cell level-${value}`} />
          ))}
        </div>
        <span>High</span>
      </div>

      <div className="activity-map-scroll">
        <div className="activity-map-wrap">
          <div className="activity-map-axis-side">
            {days.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="activity-map-year">
            {cells.map((cell) => (
              <span
                key={cell.date}
                className={`activity-cell level-${cell.level}`}
                title={`${cell.label}: ${cell.value} matches`}
                aria-label={`${cell.label}: ${cell.value} matches`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function buildActivityCells(values) {
  const base = Array.isArray(values) && values.length ? values : [0]
  const start = new Date('2026-01-01T00:00:00')

  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const value = base[index % base.length]

    return {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      value,
      level: Math.min(Math.max(value, 0), 5),
    }
  })
}

function RatingTrendChart({ values }) {
  const width = 420
  const height = 180
  const minRating = 5.8
  const maxRating = 10
  const stepX = width / Math.max(1, values.length - 1)
  const points = values.map((entry, index) => {
    const x = index * stepX
    const y = height - ((entry.rating - minRating) / (maxRating - minRating)) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="rating-trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="rating-trend-svg" aria-hidden="true">
        {[6, 7, 8, 9, 10].map((tick) => {
          const y = height - ((tick - minRating) / (maxRating - minRating)) * height
          return <line key={tick} x1="0" y1={y} x2={width} y2={y} className="rating-grid-line" />
        })}
        <polyline points={points} className="rating-trend-line" />
        {values.map((entry, index) => {
          const x = index * stepX
          const y = height - ((entry.rating - minRating) / (maxRating - minRating)) * height
          return <circle key={entry.date} cx={x} cy={y} r="4" className="rating-trend-point" />
        })}
      </svg>
      <div className="rating-trend-axis">
        {values.map((entry) => <span key={entry.date}>{entry.label}</span>)}
      </div>
    </div>
  )
}

function buildRatingHistory(player) {
  const values = player.activity?.slice(0, 6) ?? [2, 3, 4, 3, 5, 4]
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return labels.map((label, index) => ({
    label,
    date: label,
    rating: Math.max(6, Math.min(9.9, Number((player.stats.avgRating - 0.7 + (values[index] ?? 0) * 0.18).toFixed(1)))),
  }))
}

function getPlayerForm(matchLogs, playerId) {
  return matchLogs.slice(0, 5).map((match) => {
    const isHome = match.homeTeamId === getPlayerById(playerId)?.teamId
    const scoredFor = isHome ? match.homeScore : match.awayScore
    const scoredAgainst = isHome ? match.awayScore : match.homeScore
    if (scoredFor > scoredAgainst) return 'W'
    if (scoredFor < scoredAgainst) return 'L'
    return 'D'
  })
}

function StatSection({ title, items }) {
  return (
    <div className="stats-section-card">
      <h3>{title}</h3>
      <div className="stats-pair-list">
        {items.map(([label, value]) => (
          <div key={label} className="stats-pair-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
