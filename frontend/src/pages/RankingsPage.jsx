import { PageIntro, PageTrail, SimpleTable, Widget } from '../components/ui'
import { listPlayers, listRankingGroups, listStandings, listTeams } from '../data/repository'

export function RankingsPage() {
  const standings = listStandings()
  const teams = listTeams()
  const rankingGroups = listRankingGroups()
  const players = listPlayers()
  const topRows = standings.map((row) => ({
    ...row,
    id: row.teamId,
    fullName: teams.find((team) => team.id === row.teamId)?.name,
  }))

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Rankings"
        title="The page that should keep everyone checking back."
        description="Status, progression, and bragging rights all in one place."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Rankings' }]} />}
      />

      <section className="dashboard-grid">
        <Widget title="League Table" className="span-two">
          <SimpleTable
            columns={[
              { key: 'fullName', label: 'Club' },
              { key: 'played', label: 'P' },
              { key: 'wins', label: 'W' },
              { key: 'draws', label: 'D' },
              { key: 'losses', label: 'L' },
              { key: 'goalsFor', label: 'GF' },
              { key: 'goalsAgainst', label: 'GA' },
              { key: 'points', label: 'Pts' },
            ]}
            rows={topRows}
          />
        </Widget>

        {rankingGroups.map((group) => (
          <Widget key={group.title} title={group.title}>
            <div className="ranking-stack">
              {group.items.map((item, index) => (
                <article key={item.label} className="ranking-item">
                  <strong>#{index + 1}</strong>
                  <div>
                    <span>{item.label}</span>
                    <small>{item.meta}</small>
                  </div>
                  <b>{item.value}</b>
                </article>
              ))}
            </div>
          </Widget>
        ))}

        <Widget title="Current MVP Ladder" className="span-two">
          <div className="horizontal-rail">
            {players.slice(0, 4).map((player) => (
              <article key={player.id} className="mvp-card">
                <span className="rating-display">{player.rating}</span>
                <h3>{player.name}</h3>
                <p>{player.archetype}</p>
                <small>{player.stats.avgRating} avg | {player.stats.motm} MOTM</small>
              </article>
            ))}
          </div>
        </Widget>
      </section>
    </div>
  )
}
