import { Navigate, useParams } from 'react-router-dom'
import { PageTrail, SimpleTable, Widget } from '../components/ui'
import { getTournamentById, listFixtures, listStandings } from '../data/repository'

export function TournamentDetailPage() {
  const { tournamentId } = useParams()
  const tournament = getTournamentById(tournamentId)

  if (!tournament) {
    return <Navigate to="/tournaments" replace />
  }

  const standings = listStandings()
  const fixtures = listFixtures()

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Tournaments', to: '/tournaments' }, { label: tournament.name }]} />
      <section className="page-intro card">
        <div>
          <span className="eyebrow">{tournament.status}</span>
          <h1>{tournament.name}</h1>
          <p className="lede">{tournament.description}</p>
        </div>
        <div className="intro-aside tournament-mark">{tournament.logo}</div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Standings" className="span-two">
          <SimpleTable
            columns={[
              { key: 'team', label: 'Team' },
              { key: 'played', label: 'P' },
              { key: 'wins', label: 'W' },
              { key: 'goalsFor', label: 'GF' },
              { key: 'points', label: 'Pts' },
            ]}
            rows={standings.slice(0, 4)}
          />
        </Widget>

        <Widget title="Top Scorers">
          <ul className="note-list">
            {tournament.topScorers.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Widget>

        <Widget title="Fixtures" className="span-two">
          <div className="fixture-stack">
            {fixtures.map((fixture) => (
              <article key={fixture.id} className="fixture-card">
                <div className="fixture-line">
                  <span>{fixture.date}</span>
                  <small>{fixture.stage}</small>
                </div>
                <strong>{fixture.homeTeamId.replaceAll('-', ' ')} vs {fixture.awayTeamId.replaceAll('-', ' ')}</strong>
              </article>
            ))}
          </div>
        </Widget>

        <Widget title="Playoff Bracket">
          <div className="bracket-card">
            <span>Quarterfinals</span>
            <span>Semifinals</span>
            <span>Final</span>
          </div>
        </Widget>

        <Widget title="Top Assists">
          <ul className="note-list">
            {tournament.topAssists.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Widget>

        <Widget title="MVP Race">
          <ul className="note-list">
            {tournament.mvpRace.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Widget>
      </section>
    </div>
  )
}
