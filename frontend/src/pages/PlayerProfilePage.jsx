import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageTrail, StatChip, TeamInlineLink, Widget } from '../components/ui'
import { getPlayerById, getPlayerPerformance, listPlayerMatchLogs } from '../data/repository'
import { getRatingToneClass } from '../lib/rating'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const player = getPlayerById(playerId)
  const [page, setPage] = useState(0)

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
            <span className={`profile-big-badge ${getRatingToneClass(player.rating)}`}>{player.rating}</span>
            <span className="profile-big-badge profile-position-badge">{player.position}</span>
          </div>
          <div className="profile-portrait">{player.portrait}</div>
        </div>

        <div className="profile-center">
          <span className="eyebrow">Player Profile</span>
          <h1>{player.name}</h1>
          <div className="profile-badges">
            <TeamInlineLink teamId={player.teamId} />
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
          <div className="record-link-list">
            {player.records.map((record) => (
              <Link key={record.label} className="record-link-card" to={`/matches/${record.matchId}`}>
                <strong>{record.label}</strong>
                <span>{record.value}</span>
                <small>{record.summary}</small>
              </Link>
            ))}
          </div>
        </Widget>

        <Widget title="Activity Map">
          <div className="activity-map">
            {player.activity.map((value, index) => (
              <span key={`${value}-${index}`} className={`activity-cell level-${Math.min(value, 5)}`} />
            ))}
          </div>
        </Widget>

        <Widget title="Statistics" className="span-two">
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
              ['APasses', player.stats.apasses],
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
          <div className="tournament-summary-card">
            <strong>{player.tournamentSummary.current.tournamentId.replaceAll('-', ' ')}</strong>
            <p>Team place: {player.tournamentSummary.current.teamPlace}</p>
            <small>{player.tournamentSummary.current.stats}</small>
          </div>
        </Widget>

        <Widget title="Previous Tournaments">
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
        </Widget>
      </section>
    </div>
  )
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
