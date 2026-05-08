import { Link } from 'react-router-dom'
import { PageIntro, PageTrail } from '../components/ui'
import { listTournaments } from '../data/repository'

export function TournamentsPage() {
  const tournaments = listTournaments()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Tournaments"
        title="Elite event cards with league-wide narrative weight."
        description="The goal is to make every competition feel like something players want attached to their identity."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Tournaments' }]} />}
      />

      <section className="tournament-grid">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} className="card tournament-card" to={`/tournaments/${tournament.id}`}>
            <div className="tournament-badge">{tournament.logo}</div>
            <div>
              <span className="eyebrow">{tournament.status}</span>
              <h3>{tournament.name}</h3>
              <p>{tournament.description}</p>
            </div>
            <div className="tournament-meta">
              <span>{tournament.teams} teams</span>
              <span>{tournament.prestige}</span>
              <span>{tournament.schedule}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
