import { useState } from 'react'
import { PageIntro, PageTrail, TeamCard } from '../components/ui'
import { listTeams } from '../data/repository'

export function TeamsPage() {
  const teams = listTeams()
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  const filteredTeams = [...teams]
    .filter((team) => team.name.toLowerCase().includes(search.toLowerCase()))
    .filter((team) => {
      if (ratingFilter === '85+') return team.avgRating >= 85
      if (ratingFilter === '75-84') return team.avgRating >= 75 && team.avgRating < 85
      if (ratingFilter === 'below-75') return team.avgRating < 75
      return true
    })
    .sort((left, right) => right.avgRating - left.avgRating)

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Teams"
        title="CLUB DIRECTORY & TRANSFER MARKET"
        description=""
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Teams' }]} />}
      />

      <section className="card filter-bar filter-bar-teams">
        <label>
          Team
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team name" />
        </label>
        <label>
          Average rating
          <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
            <option value="all">All ratings</option>
            <option value="85+">85+</option>
            <option value="75-84">75-84</option>
            <option value="below-75">Below 75</option>
          </select>
        </label>
      </section>

      <section className="team-grid">
        {filteredTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </section>
    </div>
  )
}
