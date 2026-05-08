import { useEffect, useState } from 'react'
import { AccentLink, MatchCard, Pitch, PlayerBadge, SimpleTable, Widget } from '../components/ui'
import { listFixtures, listHomeFeatures, listMatches, listPlayers, listQuickStats, listStandings, listTeamOfWeek } from '../data/repository'

export function HomePage() {
  const homeFeatures = listHomeFeatures()
  const quickStats = listQuickStats()
  const players = listPlayers()
  const matches = listMatches()
  const standings = listStandings()
  const fixtures = listFixtures()
  const teamOfWeek = listTeamOfWeek()
  const featureCount = homeFeatures.length
  const [featureIndex, setFeatureIndex] = useState(0)
  const activeFeature = homeFeatures[featureIndex]

  useEffect(() => {
    const handle = window.setInterval(() => {
      setFeatureIndex((current) => (current + 1) % featureCount)
    }, 5000)

    return () => window.clearInterval(handle)
  }, [featureCount])

  return (
    <div className="page-stack">
      <section className={`hero hero-${activeFeature.accent}`}>
        <div className="hero-copy">
          <span className="eyebrow">IOSCA Hub</span>
          <h1>{activeFeature.title}</h1>
          <p className="lede">{activeFeature.description}</p>
          <div className="hero-actions">
            <AccentLink to={activeFeature.action} label="Open feature" />
            <button className="ghost-button" type="button">Watch broadcast intro</button>
          </div>
        </div>

        <div className="hero-meta card">
          <span className="feature-tag">{activeFeature.label}</span>
          <div className="hero-pager">
            {homeFeatures.map((feature, index) => (
              <button
                key={feature.title}
                className={`hero-dot${index === featureIndex ? ' is-active' : ''}`}
                type="button"
                onClick={() => setFeatureIndex(index)}
                aria-label={feature.title}
              />
            ))}
          </div>
          <div className="broadcast-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="quick-stats-grid">
        {quickStats.map((stat) => (
          <article key={stat.label} className="card quick-stat">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.delta}</small>
          </article>
        ))}
      </section>

      <section className="feature-panel-grid">
        <AccentLink to="/players" label="Players" />
        <AccentLink to="/teams" label="Teams" />
        <AccentLink to="/matches" label="Matches" />
        <AccentLink to="/rankings" label="Rankings" />
        <AccentLink to="/tournaments" label="Tournaments" />
      </section>

      <section className="dashboard-grid">
        <Widget title="Trending Players" className="span-two">
          <div className="horizontal-rail">
            {players.map((player) => (
              <PlayerBadge key={player.id} player={player} />
            ))}
          </div>
        </Widget>

        <Widget title="League Table Preview" action={<AccentLink to="/rankings" label="Full table" />}>
          <SimpleTable
            columns={[
              { key: 'team', label: 'Team' },
              { key: 'played', label: 'P' },
              { key: 'wins', label: 'W' },
              { key: 'draws', label: 'D' },
              { key: 'losses', label: 'L' },
              { key: 'points', label: 'Pts' },
            ]}
            rows={standings.slice(0, 5)}
          />
        </Widget>

        <Widget title="Latest Results Feed" className="span-two">
          <div className="results-stack">
            {matches.slice(0, 3).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </Widget>

        <Widget title="Upcoming Fixtures">
          <div className="fixture-stack">
            {fixtures.map((fixture) => (
              <article key={fixture.id} className="fixture-card">
                <div className="fixture-line">
                  <span>{fixture.date}</span>
                  <small>{fixture.stage}</small>
                </div>
                <strong>{fixture.homeTeamId.replace('-', ' ')} vs {fixture.awayTeamId.replace('-', ' ')}</strong>
              </article>
            ))}
          </div>
        </Widget>

        <Widget title="Team of the Week" className="span-two">
          <Pitch playersOnPitch={teamOfWeek} />
        </Widget>

        <Widget title="Broadcast Notes">
          <ul className="note-list">
            <li>Naru leads the MVP race entering the final month.</li>
            <li>Velora remain the most dangerous pressing side in the bracket.</li>
            <li>Atlas Borough are still the most chaotic upset threat in cup play.</li>
            <li>Premier standings are tight behind first place.</li>
          </ul>
        </Widget>
      </section>
    </div>
  )
}
