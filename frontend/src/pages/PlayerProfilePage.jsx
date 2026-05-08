import { Navigate, useParams } from 'react-router-dom'
import { Crest, PageTrail, PlayerBadge, StatChip, Widget } from '../components/ui'
import { getPlayerById, getTeamById, listMatches } from '../data/repository'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const player = getPlayerById(playerId)

  if (!player) {
    return <Navigate to="/players" replace />
  }

  const team = getTeamById(player.teamId)
  const recentMatches = listMatches().slice(0, 3)

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Players', to: '/players' }, { label: player.name }]} />
      <section className="profile-hero card">
        <div className="profile-portrait-wrap">
          <div className="profile-portrait">{player.portrait}</div>
        </div>
        <div className="profile-center">
          <span className="eyebrow">Player Profile</span>
          <h1>{player.name}</h1>
          <div className="profile-badges">
            <span className="rating-display">{player.rating}</span>
            <span className="tag">{player.position}</span>
            <span className="tag">{team?.name}</span>
            <span className="tag">{player.nation}</span>
            <span className="tag">{player.archetype}</span>
          </div>
        </div>
        <div className="profile-summary">
          <StatChip label="Goals" value={player.stats.goals} tone="positive" />
          <StatChip label="Assists" value={player.stats.assists} tone="info" />
          <StatChip label="Avg Rating" value={player.stats.avgRating} tone="premium" />
          <StatChip label="Win Rate" value={player.stats.winRate} tone="success" />
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Attribute Radar" className="span-two">
          <div className="radar-grid">
            {Object.entries(player.attributes).map(([label, value]) => (
              <div key={label} className="meter-row">
                <span>{label}</span>
                <div className="meter"><i style={{ width: `${value}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Season Overview">
          <div className="stat-chip-grid">
            <StatChip label="Matches" value={player.stats.matches} />
            <StatChip label="MOTM" value={player.stats.motm} />
            <StatChip label="Team" value={<><Crest teamId={player.teamId} /> {team?.shortName}</>} />
          </div>
        </Widget>

        <Widget title="Form Graph" className="span-two">
          <div className="line-chart">
            {player.form.map((value, index) => (
              <div key={`${value}-${index}`} className="line-bar">
                <span style={{ height: `${value * 10}%` }} />
                <small>{index + 1}</small>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Trophy Cabinet">
          <div className="trophy-grid">
            <div><strong>{player.trophies.leagues}</strong><span>League wins</span></div>
            <div><strong>{player.trophies.cups}</strong><span>Cups</span></div>
            <div><strong>{player.trophies.mvps}</strong><span>MVPs</span></div>
            <div><strong>{player.trophies.totw}</strong><span>TOTW</span></div>
          </div>
        </Widget>

        <Widget title="Heat Streaks">
          <ul className="note-list">
            {player.heat.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Widget>

        <Widget title="Rival Victim">
          <p className="spotlight-copy">Most damage dealt against <strong>{player.rivalVictim}</strong> this cycle.</p>
        </Widget>

        <Widget title="Career Timeline" className="span-two">
          <div className="timeline">
            {player.timeline.map((item) => (
              <div key={item} className="timeline-item">{item}</div>
            ))}
          </div>
        </Widget>

        <Widget title="Match Logs" className="span-two">
          <div className="results-stack">
            {recentMatches.map((match) => (
              <article key={match.id} className="log-card">
                <div>
                  <strong>{team?.shortName}</strong>
                  <p>{match.tournament}</p>
                </div>
                <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                <div>
                  <strong>{player.stats.avgRating}</strong>
                  <p>{player.stats.goals}G / {player.stats.assists}A season</p>
                </div>
              </article>
            ))}
          </div>
        </Widget>

        <Widget title="Club Context">
          <PlayerBadge player={player} compact />
        </Widget>
      </section>
    </div>
  )
}
