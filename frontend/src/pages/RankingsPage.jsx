import { useMemo, useState } from 'react'
import { FormPills, PageIntro, PageTrail, PlayerInlineLink, TeamInlineLink, Widget } from '../components/ui'
import { listPlayers, listTeams } from '../data/repository'

export function RankingsPage() {
  const players = listPlayers()
  const teams = listTeams()
  const [category, setCategory] = useState('overall')
  const [homeTeamId, setHomeTeamId] = useState('aether-fc')
  const [awayTeamId, setAwayTeamId] = useState('velora-athletic')
  const [leftPlayerId, setLeftPlayerId] = useState('naru')
  const [rightPlayerId, setRightPlayerId] = useState('lyo')

  const playerRows = useMemo(() => {
    const sorted = [...players]

    if (category === 'attackers') return sorted.filter((player) => ['LW', 'RW', 'CF'].includes(player.position)).sort((a, b) => b.rating - a.rating)
    if (category === 'midfielders') return sorted.filter((player) => ['CM', 'LM', 'RM'].includes(player.position)).sort((a, b) => b.rating - a.rating)
    if (category === 'defenders') return sorted.filter((player) => ['LB', 'CB', 'RB'].includes(player.position)).sort((a, b) => b.stats.interceptions - a.stats.interceptions)
    if (category === 'goalkeepers') return sorted.filter((player) => player.position === 'GK').sort((a, b) => b.stats.saves - a.stats.saves)
    if (category === 'passers') return sorted.sort((a, b) => b.stats.passAccuracy - a.stats.passAccuracy)
    if (category === 'goals') return sorted.sort((a, b) => b.stats.goals - a.stats.goals)
    if (category === 'interceptions') return sorted.sort((a, b) => b.stats.interceptions - a.stats.interceptions)
    if (category === 'worst') return sorted.sort((a, b) => a.rating - b.rating)
    return sorted.sort((a, b) => b.rating - a.rating)
  }, [category, players])

  const teamHome = teams.find((team) => team.id === homeTeamId)
  const teamAway = teams.find((team) => team.id === awayTeamId)
  const playerLeft = players.find((player) => player.id === leftPlayerId)
  const playerRight = players.find((player) => player.id === rightPlayerId)

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Rankings"
        title="PLAYER, TEAM, AND HEAD TO HEAD HUB"
        description=""
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Rankings' }]} />}
      />

      <section className="dashboard-grid">
        <Widget title="Player Rankings" className="span-two">
          <div className="category-pill-row">
            {[
              ['overall', 'Best overall'],
              ['attackers', 'Best attackers'],
              ['midfielders', 'Best midfielders'],
              ['defenders', 'Best defenders'],
              ['goalkeepers', 'Best goalkeepers'],
              ['passers', 'Best passers'],
              ['goals', 'Most goals'],
              ['interceptions', 'Most interceptions'],
              ['worst', 'Worst overall'],
            ].map(([value, label]) => (
              <button key={value} className={`category-pill ${category === value ? 'is-active' : ''}`} type="button" onClick={() => setCategory(value)}>
                {label}
              </button>
            ))}
          </div>

          <div className="ranking-stack">
            {playerRows.slice(0, 8).map((player, index) => (
              <article key={player.id} className="ranking-item ranking-item-rich">
                <strong>#{index + 1}</strong>
                <PlayerInlineLink playerId={player.id} />
                <span>{player.position}</span>
                <b>{category === 'goals' ? player.stats.goals : category === 'interceptions' ? player.stats.interceptions : player.rating}</b>
              </article>
            ))}
          </div>
        </Widget>

        <Widget title="Team Rankings">
          <div className="ranking-stack">
            {[...teams].sort((a, b) => b.avgRating - a.avgRating).map((team, index) => (
              <article key={team.id} className="ranking-item ranking-item-rich">
                <strong>#{index + 1}</strong>
                <TeamInlineLink teamId={team.id} />
                <FormPills values={team.form} />
                <b>{team.avgRating.toFixed(1)}</b>
              </article>
            ))}
          </div>
        </Widget>

        <Widget title="Team Head to Head" className="span-two">
          <div className="compare-controls">
            <select value={homeTeamId} onChange={(event) => setHomeTeamId(event.target.value)}>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select value={awayTeamId} onChange={(event) => setAwayTeamId(event.target.value)}>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
          <div className="comparison-row comparison-row-standalone comparison-card">
            <div><TeamInlineLink teamId={teamHome?.id} compact /></div>
            <span>Last 5 meetings | 2 wins each | 1 draw</span>
            <div><TeamInlineLink teamId={teamAway?.id} compact /></div>
          </div>
        </Widget>

        <Widget title="Player Head to Head">
          <div className="compare-controls">
            <select value={leftPlayerId} onChange={(event) => setLeftPlayerId(event.target.value)}>
              {players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
            </select>
            <select value={rightPlayerId} onChange={(event) => setRightPlayerId(event.target.value)}>
              {players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
            </select>
          </div>
          <div className="comparison-grid">
            <div className="comparison-row comparison-row-standalone"><strong>{playerLeft?.stats.goals}</strong><span>Goals</span><strong>{playerRight?.stats.goals}</strong></div>
            <div className="comparison-row comparison-row-standalone"><strong>{playerLeft?.stats.assists}</strong><span>Assists</span><strong>{playerRight?.stats.assists}</strong></div>
            <div className="comparison-row comparison-row-standalone"><strong>{playerLeft?.stats.interceptions}</strong><span>Interceptions</span><strong>{playerRight?.stats.interceptions}</strong></div>
            <div className="comparison-row comparison-row-standalone"><strong>{playerLeft?.stats.yellowCards}</strong><span>Discipline</span><strong>{playerRight?.stats.yellowCards}</strong></div>
          </div>
        </Widget>
      </section>
    </div>
  )
}
