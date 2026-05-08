import { useState } from 'react'
import { PageIntro, PageTrail, PlayerBadge } from '../components/ui'
import { listPlayers, listTeams } from '../data/repository'

export function PlayersPage() {
  const players = listPlayers()
  const teams = listTeams()
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  const filteredPlayers = [...players]
    .filter((player) => player.name.toLowerCase().includes(search.toLowerCase()))
    .filter((player) => teamFilter === 'all' || player.teamId === teamFilter)
    .filter((player) => positionFilter === 'all' || player.position === positionFilter)
    .sort((left, right) => {
      if (sortBy === 'goals') return right.stats.goals - left.stats.goals
      if (sortBy === 'assists') return right.stats.assists - left.stats.assists
      if (sortBy === 'form') return right.form.at(-1) - left.form.at(-1)
      if (sortBy === 'winRate') return parseInt(right.stats.winRate, 10) - parseInt(left.stats.winRate, 10)
      return right.rating - left.rating
    })

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Player Index"
        title="Scouting board, form board, reputation board."
        description="A premium player directory for the IOSCA ecosystem, built around identity, tiering, and recent performance."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Players' }]} />}
      />

      <section className="card filter-bar">
        <label>
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a player" />
        </label>
        <label>
          Team
          <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
            <option value="all">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </label>
        <label>
          Position
          <select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}>
            <option value="all">All positions</option>
            {['ST', 'CAM', 'RW', 'CDM', 'CB', 'LB'].map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="rating">Rating</option>
            <option value="goals">Goals</option>
            <option value="assists">Assists</option>
            <option value="form">Form</option>
            <option value="winRate">Win Rate</option>
          </select>
        </label>
      </section>

      <section className="player-grid">
        {filteredPlayers.map((player) => (
          <PlayerBadge key={player.id} player={player} />
        ))}
      </section>
    </div>
  )
}
