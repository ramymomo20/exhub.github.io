import { Link } from 'react-router-dom'
import { getTeamById, getTeamName } from '../data/repository'

export function PageIntro({ eyebrow, title, description, aside }) {
  return (
    <section className="page-intro card">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
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

export function StatChip({ label, value, tone = 'neutral' }) {
  return (
    <div className={`stat-chip tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

export function PlayerBadge({ player, compact = false }) {
  const tierClass =
    player.rating >= 90 ? 'tier-gold' :
      player.rating >= 85 ? 'tier-elite' :
        player.rating >= 80 ? 'tier-premium' :
          player.rating >= 75 ? 'tier-silver' : 'tier-bronze'

  return (
    <Link className={`player-card ${tierClass}${compact ? ' player-card-compact' : ''}`} to={`/players/${player.id}`}>
      <div className="player-card-top">
        <span className="rating-pill">{player.rating}</span>
        <span className="position-pill">{player.position}</span>
      </div>
      <div className="player-avatar">{player.portrait}</div>
      <div className="player-card-crest">
        <Crest teamId={player.teamId} />
      </div>
      <div className="player-card-body">
        <h3>{player.name}</h3>
        <p>{player.archetype}</p>
        <div className="mini-stat-row">
          <span>{player.nation}</span>
          <span>{player.stats.goals}G</span>
          <span>{player.stats.assists}A</span>
        </div>
      </div>
    </Link>
  )
}

export function TeamCard({ team }) {
  return (
    <Link className="team-card card" to={`/teams/${team.id}`}>
      <div className="team-card-top" style={{ '--team-a': team.colors[0], '--team-b': team.colors[1] }}>
        <Crest teamId={team.id} large />
      </div>
      <div className="team-card-body">
        <div>
          <h3>{team.name}</h3>
          <p>{team.identity}</p>
        </div>
        <div className="team-meta-grid">
          <span>Captain <strong>{team.captain}</strong></span>
          <span>Rank <strong>#{team.rank}</strong></span>
          <span>Form <strong>{team.form.join('')}</strong></span>
          <span>Players <strong>{team.players}</strong></span>
        </div>
      </div>
    </Link>
  )
}

export function MatchCard({ match }) {
  return (
    <Link className="match-card card" to={`/matches/${match.id}`}>
      <div className="match-card-head">
        <span className="match-tag">{match.tournament}</span>
        <span className={`status-pill ${match.status.toLowerCase().includes('live') ? 'is-live' : ''}`}>{match.status}</span>
      </div>
      <div className="scoreboard">
        <div className="score-team">
          <Crest teamId={match.homeTeamId} />
          <strong>{getTeamName(match.homeTeamId)}</strong>
        </div>
        <div className="score-center">
          <span className="scoreline">{match.homeScore} : {match.awayScore}</span>
          <small>{match.date}</small>
        </div>
        <div className="score-team">
          <Crest teamId={match.awayTeamId} />
          <strong>{getTeamName(match.awayTeamId)}</strong>
        </div>
      </div>
      <div className="match-card-foot">
        <span>{match.format}</span>
        <span>MVP {match.mvp}</span>
        <span>{match.duration}</span>
      </div>
    </Link>
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

export function Pitch({ title, playersOnPitch }) {
  return (
    <div className="pitch-shell">
      {title ? <h3>{title}</h3> : null}
      <div className="pitch">
        <div className="pitch-line pitch-line-center" />
        <div className="pitch-circle" />
        {playersOnPitch.map((entry) => (
          <div
            key={`${entry.player}-${entry.role}`}
            className="pitch-marker"
            style={{ left: `${entry.x}%`, top: `${entry.y}%` }}
          >
            <Crest teamId={entry.teamId} />
            <strong>{entry.player}</strong>
            <span>{entry.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccentLink({ to, label }) {
  return <Link className="accent-link" to={to}>{label}</Link>
}
