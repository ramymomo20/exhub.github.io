import { useState } from 'react'
import { MatchCard, PageIntro, PageTrail } from '../components/ui'
import { listMatches, listPlayers, listTeams } from '../data/repository'

export function MatchesPage() {
  const matches = listMatches()
  const teams = listTeams()
  const players = listPlayers()
  const [homeFilter, setHomeFilter] = useState('all')
  const [awayFilter, setAwayFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [mvpFilter, setMvpFilter] = useState('all')
  const [flagFilter, setFlagFilter] = useState('all')
  const [competitionFilter, setCompetitionFilter] = useState('all')

  const filteredMatches = matches.filter((match) => {
    if (homeFilter !== 'all' && match.homeTeamId !== homeFilter) return false
    if (awayFilter !== 'all' && match.awayTeamId !== awayFilter) return false
    if (formatFilter !== 'all' && match.format !== formatFilter) return false
    if (mvpFilter !== 'all' && match.mvpId !== mvpFilter) return false
    if (flagFilter !== 'all' && !match.flags.includes(flagFilter)) return false
    if (competitionFilter !== 'all' && match.competitionType !== competitionFilter) return false
    return true
  })

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Matches"
        title="MATCH DIRECTORY & STATISTICS"
        description=""
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Matches' }]} />}
      />

      <section className="card filter-bar filter-bar-matches">
        <label>
          Home team
          <select value={homeFilter} onChange={(event) => setHomeFilter(event.target.value)}>
            <option value="all">All home teams</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
        <label>
          Away team
          <select value={awayFilter} onChange={(event) => setAwayFilter(event.target.value)}>
            <option value="all">All away teams</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
        <label>
          Format
          <select value={formatFilter} onChange={(event) => setFormatFilter(event.target.value)}>
            <option value="all">All formats</option>
            <option value="5v5">5v5</option>
            <option value="6v6">6v6</option>
          </select>
        </label>
        <label>
          MVP
          <select value={mvpFilter} onChange={(event) => setMvpFilter(event.target.value)}>
            <option value="all">All MVPs</option>
            {players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
          </select>
        </label>
        <label>
          Flag
          <select value={flagFilter} onChange={(event) => setFlagFilter(event.target.value)}>
            <option value="all">All flags</option>
            <option value="ET">ET</option>
            <option value="PEN">PEN</option>
            <option value="COMEBACK">COMEBACK</option>
          </select>
        </label>
        <label>
          Competition
          <select value={competitionFilter} onChange={(event) => setCompetitionFilter(event.target.value)}>
            <option value="all">All competition types</option>
            <option value="League">League</option>
            <option value="Cup">Cup</option>
          </select>
        </label>
      </section>

      <section className="results-stack">
        {filteredMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </section>
    </div>
  )
}
