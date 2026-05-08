import { Link } from 'react-router-dom'
import { getPlayerById, getTeamById, getTeamName } from '../data/repository'
import { getRatingToneClass } from '../utils/rating'

export function PageIntro({ eyebrow, title, description, aside }) {
  return (
    <section className="page-intro card">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description ? <p className="lede">{description}</p> : null}
      </div>
      {aside ? <div className="intro-aside">{aside}</div> : null}
    </section>
  )
}

export function PageTrail({ items }) {
  return (
    <nav className="page-trail" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="trail-item">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <strong>{item.label}</strong>}
          {index < items.length - 1 ? <i>/</i> : null}
        </span>
      ))}
    </nav>
  )
}

export function Widget({ title, action, className = '', children }) {
  return (
    <section className={`card widget ${className}`}>
      <div className="widget-head">
        <h2>{title}</h2>
        {action ? <div className="widget-action">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function StatChip({ label, value, tone = 'neutral' }) {
  return (
    <div className={`stat-chip tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function Crest({ teamId, large = false }) {
  const team = getTeamById(teamId)

  if (!team) {
    return <span className="crest">?</span>
  }

  return (
    <span
      className={`crest${large ? ' crest-large' : ''}`}
      style={{ '--crest-start': team.colors[0], '--crest-end': team.colors[1] }}
    >
      {team.crest}
    </span>
  )
}

export function TeamInlineLink({ teamId, compact = false }) {
  const team = getTeamById(teamId)

  if (!team) {
    return null
  }

  return (
    <Link className={`team-inline-link${compact ? ' is-compact' : ''}`} to={`/teams/${team.id}`}>
      <Crest teamId={team.id} />
      <span>{team.name}</span>
    </Link>
  )
}

export function PlayerInlineLink({ playerId, compact = false }) {
  const player = getPlayerById(playerId)

  if (!player) {
    return null
  }

  return (
    <Link className={`player-inline-link${compact ? ' is-compact' : ''}`} to={`/players/${player.id}`}>
      <span className="avatar-circle">{player.portrait}</span>
      <span>{player.name}</span>
    </Link>
  )
}

export function PlayerBadge({ player, compact = false }) {
  return (
    <article className={`player-card ${getRatingTierClass(player.rating)}${compact ? ' player-card-compact' : ''}`}>
      <div className="player-card-top">
        <span className={`rating-pill ${getRatingToneClass(player.rating)}`}>{player.rating}</span>
        <span className="position-pill">{player.position}</span>
      </div>

      <Link className="player-avatar-link" to={`/players/${player.id}`}>
        <div className="player-avatar player-avatar-small">{player.portrait}</div>
      </Link>

      <Link className="player-name-link" to={`/players/${player.id}`}>
        <h3>{player.name}</h3>
      </Link>

      <Link className="player-team-ribbon" to={`/teams/${player.teamId}`}>
        <Crest teamId={player.teamId} />
        <span>{getTeamName(player.teamId)}</span>
      </Link>

      <div className="player-card-stats">
        <span>Apps {player.appearances}</span>
        <span>MVPs {player.mvps}</span>
      </div>
    </article>
  )
}

export function TeamCard({ team }) {
  return (
    <article className="team-card card">
      <div className="team-card-top" style={{ '--team-a': team.colors[0], '--team-b': team.colors[1] }}>
        <Link className="team-crest-link" to={`/teams/${team.id}`}>
          <Crest teamId={team.id} large />
        </Link>
      </div>

      <div className="team-card-body">
        <div className="team-card-title-row">
          <span className={`team-rating-badge ${getRatingToneClass(team.avgRating)}`}>{team.avgRating.toFixed(1)}</span>
          <Link className="team-name-link" to={`/teams/${team.id}`}>
            <h3>{team.name}</h3>
          </Link>
        </div>

        <div className="team-meta-grid team-meta-grid-expanded">
          <span>Captain <strong>{team.captain}</strong></span>
          <span>Rank <strong>#{team.rank}</strong></span>
          <span>Played <strong>{team.appearances}</strong></span>
          <span>Record <strong>{team.wins} | {team.draws} | {team.losses}</strong></span>
          <span>Players <strong>{team.playerCount}</strong></span>
          <span>Competition <strong>{team.competition}</strong></span>
        </div>
      </div>
    </article>
  )
}

export function MatchCard({ match }) {
  const homeTeam = getTeamById(match.homeTeamId)
  const awayTeam = getTeamById(match.awayTeamId)
  const mvp = getPlayerById(match.mvpId)
  const homeWon = match.homeScore > match.awayScore
  const awayWon = match.awayScore > match.homeScore

  return (
    <article className="match-card card">
      <div className="match-card-head">
        <span className="match-tag">{match.competition}</span>
        <div className="match-card-flags">
          {match.flags.map((flag) => (
            <span key={flag} className="flag-pill">{flag}</span>
          ))}
          <span className={`status-pill ${match.status.toLowerCase().includes('live') ? 'is-live' : ''}`}>{match.status}</span>
        </div>
      </div>

      <div className="scoreboard scoreboard-expanded">
        <div className={`score-team ${homeWon ? 'is-winner' : ''}`}>
          <Link className="team-score-link" to={`/teams/${match.homeTeamId}`}>
            <Crest teamId={match.homeTeamId} large />
            <strong>{homeTeam?.name}</strong>
          </Link>
        </div>

        <Link className="score-center score-center-link" to={`/matches/${match.id}`}>
          <span className="scoreline">{match.homeScore} : {match.awayScore}</span>
          <small>{match.date} | {match.time}</small>
        </Link>

        <div className={`score-team ${awayWon ? 'is-winner' : ''}`}>
          <Link className="team-score-link team-score-link-right" to={`/teams/${match.awayTeamId}`}>
            <Crest teamId={match.awayTeamId} large />
            <strong>{awayTeam?.name}</strong>
          </Link>
        </div>
      </div>

      <div className="match-card-foot">
        <span>{match.format}</span>
        <PlayerInlineLink playerId={mvp?.id} compact />
        <Link className="match-open-link" to={`/matches/${match.id}`}>Open match</Link>
      </div>
    </article>
  )
}

export function SimpleTable({ rows, columns }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.teamId || row.label}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pitch({ playersOnPitch, mode = 'summary', lineups = null, tooltips = {} }) {
  const items = lineups ?? playersOnPitch

  return (
    <div className={`pitch-shell ${mode === 'match' ? 'pitch-shell-match' : ''}`}>
      <div className="pitch">
        <div className="pitch-line pitch-line-center" />
        <div className="pitch-circle" />
        {items.map((entry, index) => {
          const player = entry.playerId ? getPlayerById(entry.playerId) : null
          const tooltipLines = entry.playerId ? (tooltips[entry.playerId] ?? []) : []

          return (
            <div
              key={`${entry.playerId ?? entry.player ?? index}-${entry.role}`}
              className={`pitch-marker ${entry.badges?.some((badge) => badge.type === 'mvp') ? 'is-mvp' : ''}`}
              style={{ left: `${entry.x}%`, top: `${entry.y}%` }}
            >
              {entry.rating ? <span className="pitch-rating">{entry.rating}</span> : null}
              <div className="pitch-shirt">
                <strong>{entry.role}</strong>
              </div>
              <span className="pitch-player-name">{player?.name ?? entry.player ?? entry.playerId}</span>
              {entry.badges?.length ? (
                <div className="pitch-badges">
                  {entry.badges.map((badge) => (
                    <span key={`${badge.type}-${badge.count}`} className={`event-badge event-${badge.type}`}>
                      <EventIcon type={badge.type} />
                      {badge.count > 0 ? <small>{badge.count}</small> : null}
                    </span>
                  ))}
                </div>
              ) : null}
              {tooltipLines.length ? (
                <div className="pitch-tooltip">
                  {tooltipLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function EventIcon({ type }) {
  if (type === 'goal') return <span className="icon-ball" />
  if (type === 'own-goal') return <span className="icon-own-goal" />
  if (type === 'yellow-card') return <span className="icon-card icon-card-yellow" />
  if (type === 'red-card') return <span className="icon-card icon-card-red" />
  if (type === 'assist') return <span className="icon-assist" />
  if (type === 'save') return <span className="icon-save" />
  if (type === 'miss') return <span className="icon-miss" />
  if (type === 'mvp') return <span className="icon-crown" />
  return <span className="icon-dot" />
}

export function AccentLink({ to, label }) {
  return <Link className="accent-link" to={to}>{label}</Link>
}

export function FormPills({ values }) {
  return (
    <div className="form-pills">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className={`form-pill result-${value.toLowerCase()}`}>{value}</span>
      ))}
    </div>
  )
}

function getRatingTierClass(rating) {
  if (rating >= 85) return 'tier-light-gold'
  if (rating >= 75) return 'tier-dark-gold'
  if (rating >= 65) return 'tier-silver'
  return 'tier-bronze'
}
