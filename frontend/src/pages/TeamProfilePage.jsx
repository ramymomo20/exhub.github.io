import { Navigate, useParams } from 'react-router-dom'
import { Crest, PageTrail, PlayerBadge, StatChip, Widget } from '../components/ui'
import { getTeamById, listMatchesByTeamId, listPlayersByTeamId } from '../data/repository'

export function TeamProfilePage() {
  const { teamId } = useParams()
  const team = getTeamById(teamId)

  if (!team) {
    return <Navigate to="/teams" replace />
  }

  const squad = listPlayersByTeamId(team.id)
  const recent = listMatchesByTeamId(team.id).slice(0, 3)

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Teams', to: '/teams' }, { label: team.name }]} />
      <section className="team-hero card">
        <div className="team-hero-crest">
          <Crest teamId={team.id} large />
        </div>
        <div className="team-hero-copy">
          <span className="eyebrow">Club Headquarters</span>
          <h1>{team.name}</h1>
          <p className="lede">{team.identity}</p>
          <div className="profile-badges">
            <span className="tag">Captain {team.captain}</span>
            <span className="tag">Founded {team.founded}</span>
            <span className="tag">Rank #{team.rank}</span>
          </div>
        </div>
        <div className="profile-summary">
          <StatChip label="Win Rate" value={team.winRate} tone="success" />
          <StatChip label="Avg Rating" value={team.avgRating} tone="info" />
          <StatChip label="Trophies" value={team.trophies} tone="premium" />
          <StatChip label="Chemistry" value={`${team.chemistry}%`} tone="positive" />
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Squad Preview" className="span-two">
          <div className="horizontal-rail">
            {squad.map((player) => (
              <PlayerBadge key={player.id} player={player} compact />
            ))}
          </div>
        </Widget>

        <Widget title="Team Identity">
          <ul className="note-list">
            <li>{team.identity}</li>
            <li>Best phase: mid-block regain to vertical release.</li>
            <li>Biggest edge: clean shape under pressure.</li>
          </ul>
        </Widget>

        <Widget title="Chemistry Meter">
          <div className="chemistry-meter">
            <div className="meter"><i style={{ width: `${team.chemistry}%` }} /></div>
            <strong>{team.chemistry}% stable core</strong>
          </div>
        </Widget>

        <Widget title="Recent Form Timeline" className="span-two">
          <div className="timeline">
            {team.form.map((result, index) => (
              <div key={`${result}-${index}`} className={`timeline-pill result-${result.toLowerCase()}`}>
                Match {index + 1} | {result}
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Trophy Cabinet">
          <div className="trophy-grid">
            <div><strong>{team.trophies}</strong><span>Total honors</span></div>
            <div><strong>{team.rank}</strong><span>Current rank</span></div>
            <div><strong>{team.players}</strong><span>Players registered</span></div>
            <div><strong>{team.avgRating}</strong><span>Team average</span></div>
          </div>
        </Widget>

        <Widget title="Rivalries">
          <p className="spotlight-copy">Current heat map points toward <strong>Velora Athletic</strong> and <strong>Solstice United</strong> as the defining rivalry fixtures.</p>
        </Widget>

        <Widget title="Recent Matches" className="span-two">
          <div className="results-stack">
            {recent.map((match) => (
              <article key={match.id} className="log-card">
                <div>
                  <strong>{match.tournament}</strong>
                  <p>{match.date} | {match.format}</p>
                </div>
                <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                <div>
                  <strong>MVP</strong>
                  <p>{match.mvp}</p>
                </div>
              </article>
            ))}
          </div>
        </Widget>
      </section>
    </div>
  )
}
