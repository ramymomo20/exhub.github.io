import { PageIntro, PageTrail, TeamCard } from '../components/ui'
import { listTeams } from '../data/repository'

export function TeamsPage() {
  const teams = listTeams()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Club Directory"
        title="Prestige, chemistry, and rivalry identity."
        description="Every team card is positioned as a living club identity instead of a plain row in a table."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Teams' }]} />}
      />

      <section className="team-grid">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </section>
    </div>
  )
}
