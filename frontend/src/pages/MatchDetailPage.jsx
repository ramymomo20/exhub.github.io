import { Navigate, useParams } from 'react-router-dom'
import { MatchCard, PageTrail, Pitch, PlayerBadge, Widget } from '../components/ui'
import { getMatchById, getTeamById, listPlayersByIds } from '../data/repository'

export function MatchDetailPage() {
  const { matchId } = useParams()
  const match = getMatchById(matchId)

  if (!match) {
    return <Navigate to="/matches" replace />
  }

  const homeTeam = getTeamById(match.homeTeamId)
  const awayTeam = getTeamById(match.awayTeamId)
  const topPlayers = listPlayersByIds(match.topPerformers ?? [])

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Matches', to: '/matches' }, { label: `${homeTeam?.shortName} vs ${awayTeam?.shortName}` }]} />
      <section className="match-hero card">
        <div className="hero-team-side">
          <span className="big-crest" style={{ '--team-a': homeTeam?.colors[0], '--team-b': homeTeam?.colors[1] }}>{homeTeam?.crest}</span>
          <strong>{homeTeam?.name}</strong>
        </div>
        <div className="match-hero-center">
          <span className="eyebrow">{match.tournament}</span>
          <h1>{match.homeScore} : {match.awayScore}</h1>
          <p>{match.date} | {match.format} | {match.duration} | MVP {match.mvp}</p>
        </div>
        <div className="hero-team-side">
          <span className="big-crest" style={{ '--team-a': awayTeam?.colors[0], '--team-b': awayTeam?.colors[1] }}>{awayTeam?.crest}</span>
          <strong>{awayTeam?.name}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Match Stats Comparison" className="span-two">
          <div className="comparison-grid">
            {(match.stats ?? []).map(([label, homeValue, awayValue]) => (
              <div key={label} className="comparison-row">
                <strong>{homeValue}</strong>
                <span>{label}</span>
                <strong>{awayValue}</strong>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Turning Point">
          <p className="spotlight-copy">{match.turningPoint}</p>
        </Widget>

        <Widget title="Goal Timeline" className="span-two">
          <div className="timeline">
            {(match.timeline ?? []).map((event) => (
              <div key={`${event.minute}-${event.detail}`} className={`timeline-event side-${event.side}`}>
                <strong>{event.minute}&apos;</strong>
                <span>{event.label}</span>
                <p>{event.detail}</p>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Momentum Graph">
          <div className="line-chart momentum-chart">
            {(match.momentum ?? []).map((value, index) => (
              <div key={`${value}-${index}`} className="line-bar">
                <span style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Top Performers" className="span-two">
          <div className="horizontal-rail">
            {topPlayers.map((player) => (
              <PlayerBadge key={player.id} player={player} compact />
            ))}
          </div>
        </Widget>

        <Widget title="Tactical Pitch" className="span-two">
          <Pitch playersOnPitch={match.lineup ?? []} />
        </Widget>

        <Widget title="Community Vote">
          <div className="vote-stack">
            {(match.votes ?? []).map((vote) => (
              <div key={vote.label} className="vote-row">
                <span>{vote.label}</span>
                <div className="meter"><i style={{ width: `${vote.percent}%` }} /></div>
                <strong>{vote.percent}%</strong>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Related Match">
          <MatchCard match={match} />
        </Widget>
      </section>
    </div>
  )
}
