import { Navigate, useParams } from 'react-router-dom'
import { FormPills, PageTrail, TeamInlineLink, Widget } from '../components/ui'
import { getTournamentById, getTournamentFixtures, useHubTournamentDetail } from '../data/repository'

export function TournamentDetailPage() {
  const { tournamentId } = useParams()
  const { loading } = useHubTournamentDetail(tournamentId)
  const tournament = getTournamentById(tournamentId)

  if (!tournament && loading) {
    return null
  }

  if (!tournament) {
    return <Navigate to="/tournaments" replace />
  }

  const fixtures = getTournamentFixtures(tournament.id)
  const fixturesByLeague = groupFixturesByLeague(fixtures)

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
            <div className="table-shell standings-table-shell">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>MP</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row, index) => (
                    <tr key={`${group.name}-${row.teamId}`} className={index === 0 ? 'standing-first' : index === 1 ? 'standing-second' : ''}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="standings-team-cell">
                          {row.teamId ? <TeamInlineLink teamId={row.teamId} compact /> : <span>{row.teamName}</span>}
                          <FormPills values={row.form} />
                        </div>
                      </td>
                      <td>{row.played}</td>
                      <td>{row.wins}</td>
                      <td>{row.draws}</td>
                      <td>{row.losses}</td>
                      <td>{row.goalsFor}</td>
                      <td>{row.goalsAgainst}</td>
                      <td className={row.gd > 0 ? 'gd-positive' : row.gd < 0 ? 'gd-negative' : 'gd-neutral'}>{row.gd}</td>
                      <td><strong>{row.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Widget>
        ))}

        <Widget title="Tournament Leaders">
          {Object.keys(tournament.leaders).length ? (
            <div className="timeline">
              {Object.entries(tournament.leaders).map(([label, values]) => (
                <div key={label} className="timeline-item">
                  <strong>{label}</strong>
                  <p>{values.length ? values.join(' | ') : 'No synced leaders yet'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No tournament leader summaries have been synced yet.</p>
          )}
        </Widget>

        <Widget title="Fixtures" className="span-two">
          <div className="results-stack">
            {fixturesByLeague.map((group) => (
              <div key={group.leagueKey} className="fixture-league-group">
                <strong>{group.label}</strong>
                {group.fixtures.map((match) => (
                  <div key={`${group.leagueKey}-${match.id}-${match.fixtureId}`} className="log-card">
                    <div>
                      <strong>{match.homeTeamName} vs {match.awayTeamName}</strong>
                      <p>{match.date} | {match.time}</p>
                    </div>
                    <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                    <div>
                      <strong>{match.status}</strong>
                      <p>{[match.format, ...match.flags].filter(Boolean).join(' | ')}</p>
                    </div>
                  </div>
                ))}
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

function groupFixturesByLeague(fixtures) {
  const groups = new Map()

  fixtures.forEach((fixture) => {
    const leagueKey = fixture.leagueKey || 'Table'
    const current = groups.get(leagueKey) ?? {
      leagueKey,
      label: leagueKey === 'Table' ? 'Main Schedule' : `League ${leagueKey}`,
      fixtures: [],
    }
    current.fixtures.push(fixture)
    groups.set(leagueKey, current)
  })

  return Array.from(groups.values()).sort((left, right) => left.leagueKey.localeCompare(right.leagueKey, undefined, { numeric: true, sensitivity: 'base' }))
}
