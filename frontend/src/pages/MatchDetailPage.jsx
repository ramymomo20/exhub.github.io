import { Link, Navigate, useParams } from 'react-router-dom'
import { Crest, EventIcon, PageTrail, Pitch, PlayerInlineLink, TeamInlineLink, Widget } from '../components/ui'
import { getMatchById, getPlayerById, getTeamById } from '../data/repository'

export function MatchDetailPage() {
  const { matchId } = useParams()
  const match = getMatchById(matchId)

  if (!match) {
    return <Navigate to="/matches" replace />
  }

  const homeTeam = getTeamById(match.homeTeamId)
  const awayTeam = getTeamById(match.awayTeamId)
  const mvp = getPlayerById(match.mvpId)

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Matches', to: '/matches' }, { label: `${homeTeam?.shortName} vs ${awayTeam?.shortName}` }]} />

      <section className="match-hero card match-hero-expanded">
        <div className="match-hero-topbar">
          <div className="match-hero-topbar-spacer" />
          <span className="eyebrow match-hero-competition">{match.competition}</span>
          <div className="match-hero-topbar-spacer" />
        </div>

        <div className="match-hero-grid">
          <div className="match-hero-team-column match-hero-team-column-left">
            <MatchHeroTeam team={homeTeam} isWinner={match.homeScore > match.awayScore} />
            <EventStack entries={match.homeEventStack} align="left" />
          </div>

          <div className="match-hero-center match-hero-center-expanded">
            <div className="match-mvp-link">
              <span>Player of the Match</span>
              <PlayerInlineLink playerId={mvp?.id} compact />
            </div>
            <h1>{match.homeScore} : {match.awayScore}</h1>
            <div className="match-hero-meta-row">
              <span>{match.date}</span>
              <span>{match.time}</span>
              <span>{match.format}</span>
            </div>
            <div className="match-hero-flags-bottom">
              {match.flags.map((flag) => (
                <span key={flag} className="flag-pill">{flag}</span>
              ))}
              <span className={`status-pill ${match.status.toLowerCase().includes('live') ? 'is-live' : ''}`}>{match.status}</span>
            </div>
          </div>

          <div className="match-hero-team-column match-hero-team-column-right">
            <EventStack entries={match.awayEventStack} align="right" />
            <MatchHeroTeam team={awayTeam} isWinner={match.awayScore > match.homeScore} />
          </div>
        </div>
      </section>

      <section className="dashboard-grid match-detail-layout">
        <Widget title="Lineups" className="span-two lineups-main-widget">
          <div className="lineups-grid">
            <div className="lineup-team-card">
              <div className="lineup-team-header">
                <TeamInlineLink teamId={homeTeam.id} />
              </div>
              <Pitch mode="match" format={match.format} lineups={match.lineups.home} tooltips={match.lineupTooltips} shirtColors={homeTeam?.colors} />
            </div>
            <div className="lineup-team-card">
              <div className="lineup-team-header">
                <TeamInlineLink teamId={awayTeam.id} />
              </div>
              <Pitch mode="match" format={match.format} lineups={match.lineups.away} tooltips={match.lineupTooltips} shirtColors={awayTeam?.colors} />
            </div>
          </div>
        </Widget>

        <div className="match-detail-rail">
          <Widget title="Player of the Match" className="match-detail-sidecard">
            <div className="mvp-panel">
              <PlayerInlineLink playerId={mvp?.id} />
              <div className="mvp-summary-grid">
                {match.mvpSummary.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Widget>

          <Widget title="Game Highlights" className="match-detail-sidecard">
            <div className="highlights-list">
              {match.gameHighlights.map((item) => (
                <div key={`${item.minute}-${item.text}`} className="highlight-row">
                  <strong>{item.minute}&apos;</strong>
                  <EventIcon type={item.type} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </Widget>
        </div>

        <Widget title="Shot Map and Zones" className="span-full">
          <div className="shot-zones-grid">
            {match.shotZones.map((zone) => (
              <div key={zone.zone} className="shot-zone-card">
                <span>{zone.zone}</span>
                <div className="shot-zone-score">
                  <strong>{zone.home}</strong>
                  <small>vs</small>
                  <strong>{zone.away}</strong>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Match Stats Comparison" className="span-full comparison-widget-standalone">
          <div className="comparison-grid">
            {match.comparisonStats.map(([label, homeValue, awayValue]) => (
              <div key={label} className="comparison-row comparison-row-standalone">
                <strong>{homeValue}</strong>
                <span>{label}</span>
                <strong>{awayValue}</strong>
              </div>
            ))}
          </div>
        </Widget>
      </section>
    </div>
  )
}

function MatchHeroTeam({ team, isWinner = false }) {
  if (!team) {
    return null
  }

  return (
    <Link className={`match-hero-team-link${isWinner ? ' is-winner' : ''}`} to={`/teams/${team.id}`}>
      <div className="match-hero-crest-shell">
        <Crest teamId={team.id} large />
      </div>
      <strong className="match-hero-team-name">{team.name}</strong>
    </Link>
  )
}

function EventStack({ entries, align = 'left' }) {
  const filteredEntries = entries
    .map((entry) => {
      const grouped = groupKeyEvents(entry.events)
      return grouped.length ? { ...entry, grouped } : null
    })
    .filter(Boolean)

  return (
    <div className={`event-stack event-stack-${align}`}>
      {filteredEntries.map((entry) => (
        <div key={`${entry.playerName}-${entry.grouped[0]?.type}-${entry.grouped[0]?.minutes}`} className="event-stack-row">
          {align === 'right' ? (
            <>
              <div className="event-stack-events">
                {entry.grouped.map((group) => (
                  <span key={`${entry.playerName}-${group.type}-${group.minutes}`} className="event-stack-badge">
                    <EventIcon type={group.type} />
                    <small>{group.minutes}&apos;</small>
                  </span>
                ))}
              </div>
              <div className="event-stack-player">
                <strong>{entry.playerName}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="event-stack-player">
                <strong>{entry.playerName}</strong>
              </div>
              <div className="event-stack-events">
                {entry.grouped.map((group) => (
                  <span key={`${entry.playerName}-${group.type}-${group.minutes}`} className="event-stack-badge">
                    <EventIcon type={group.type} />
                    <small>{group.minutes}&apos;</small>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function groupKeyEvents(events = []) {
  const allowed = ['goal', 'own-goal', 'yellow-card', 'red-card']
  const groups = new Map()

  events
    .filter((event) => allowed.includes(event.type))
    .forEach((event) => {
      const current = groups.get(event.type) ?? []
      current.push(event.minute)
      groups.set(event.type, current)
    })

  return Array.from(groups.entries()).map(([type, minutes]) => ({
    type,
    minutes: minutes.join(', '),
  }))
}
