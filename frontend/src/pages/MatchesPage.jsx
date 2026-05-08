import { MatchCard, PageIntro, PageTrail } from '../components/ui'
import { listMatches } from '../data/repository'

export function MatchesPage() {
  const matches = listMatches()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Match Center"
        title="Broadcast-first scoreboards with competition context."
        description="Every result and live fixture should feel like an event, not a row in a spreadsheet."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Matches' }]} />}
      />

      <section className="results-stack">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </section>
    </div>
  )
}
