import { Navigate, useParams } from 'react-router-dom'
import { FormPills, PageTrail, TeamInlineLink, Widget } from '../components/ui'
import { getTournamentById, getTournamentFixtures } from '../data/repository'

export function TournamentDetailPage() {
  const { tournamentId } = useParams()
  const tournament = getTournamentById(tournamentId)

  if (!tournament) {
    return <Navigate to="/tournaments" replace />
  }

  const fixtures = getTournamentFixtures(tournament.id)

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Tournaments', to: '/tournaments' }, { label: tournament.name }]} />

      <section className="page-intro card">
        <div>
          <span className="eyebrow">{tournament.status}</span>
          <h1>{tournament.name}</h1>
          <p className="lede">{tournament.description}</p>
          {tournament.winnerTeamId ? (
            <div className="winner-banner">
              <span>Winner</span>
              <TeamInlineLink teamId={tournament.winnerTeamId} />
            </div>
          ) : null}
        </div>
        <div className="intro-aside tournament-mark">{tournament.logo}</div>
      </section>

      <section className="dashboard-grid">
        {tournament.standingsGroups.map((group) => (
          <Widget key={group.name} title={group.name} className="span-two">
            <div className="standings-list">
              {group.rows.map((row, index) => (
                <div key={`${group.name}-${row.teamId}`} className={`standings-row ${index === 0 ? 'is-first' : index === 1 ? 'is-second' : ''}`}>
                  <div className="standings-team">
                    <TeamInlineLink teamId={row.teamId} />
                    <FormPills values={row.form} />
                  </div>
                  <div className="standings-metrics">
                    <span>P {row.played}</span>
                    <span>W {row.wins}</span>
                    <span>D {row.draws}</span>
                    <span>L {row.losses}</span>
                    <span>GF {row.goalsFor}</span>
                    <span>GA {row.goalsAgainst}</span>
                    <span className={row.gd > 0 ? 'gd-positive' : row.gd < 0 ? 'gd-negative' : 'gd-neutral'}>GD {row.gd}</span>
                    <strong>{row.points} pts</strong>
                  </div>
                </div>
              ))}
            </div>
          </Widget>
        ))}

        <Widget title="Tournament Leaders">
          <div className="timeline">
            {Object.entries(tournament.leaders).map(([label, values]) => (
              <div key={label} className="timeline-item">
                <strong>{label}</strong>
                <p>{values.join(' | ')}</p>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Fixtures" className="span-two">
          <div className="results-stack">
            {fixtures.map((match) => (
              <div key={match.id} className="log-card">
                <div>
                  <strong>{match.competition}</strong>
                  <p>{match.date} | {match.time}</p>
                </div>
                <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                <div>
                  <strong>{match.status}</strong>
                  <p>{match.format}</p>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Bracket">
          <div className="bracket-card">
            {(tournament.bracket ?? ['League Table']).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Widget>
      </section>
    </div>
  )
}
