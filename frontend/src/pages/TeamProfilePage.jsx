import { Navigate, useParams } from 'react-router-dom'
import { Crest, FormPills, PageTrail, PlayerBadge, StatChip, Widget } from '../components/ui'
import { getTeamById, listMatchesByTeamId, listPlayersByTeamId, listTournaments } from '../data/repository'
import { getRatingToneClass } from '../lib/rating'

export function TeamProfilePage() {
  const { teamId } = useParams()
  const team = getTeamById(teamId)

  if (!team) {
    return <Navigate to="/teams" replace />
  }

  const squad = listPlayersByTeamId(team.id)
  const recent = listMatchesByTeamId(team.id).slice(0, 5)
  const latestTournament = listTournaments().find((tournament) => tournament.id === 'iosca-premier-season')

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Teams', to: '/teams' }, { label: team.name }]} />

      <section className="team-hero card team-hero-reworked">
        <div className="team-hero-crest team-hero-crest-large">
          <Crest teamId={team.id} large />
        </div>
        <div className="team-hero-copy">
          <span className="eyebrow">Team Profile</span>
          <div className="team-profile-title-row">
            <span className={`team-rating-badge team-rating-badge-large ${getRatingToneClass(team.avgRating)}`}>{team.avgRating.toFixed(1)}</span>
            <h1>{team.name}</h1>
          </div>
          <div className="profile-badges">
            <span className="captain-highlight">{team.captain}</span>
            <span className="tag">Created {team.createdOn}</span>
            <span className="tag">{team.competition}</span>
          </div>
        </div>
        <div className="profile-summary">
          <StatChip label="Appearances" value={team.appearances} tone="neutral" />
          <StatChip label="Players" value={team.playerCount} tone="info" />
          <StatChip label="Win Rate" value={`${Math.round((team.wins / team.appearances) * 100)}%`} tone="success" />
          <StatChip label="Rank" value={`#${team.rank}`} tone="positive" />
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Squad Preview" className="span-two">
          <div className="horizontal-rail">
            {squad.map((player) => (
              <PlayerBadge key={player.id} player={player} compact />
            ))}
          </div>
        </Widget>

        <Widget title="Recent Form">
          <FormPills values={team.form} />
        </Widget>

        <Widget title="Aggregated Team Statistics" className="span-two">
          <div className="stats-section-grid">
            <TeamStatSection title="General" items={[
              ['Appearances', team.appearances],
              ['Wins', team.wins],
              ['Draws', team.draws],
              ['Losses', team.losses],
              ['Average rating', team.avgRating.toFixed(1)],
            ]} />
            <TeamStatSection title="Attacking" items={[
              ['Goals', squad.reduce((sum, player) => sum + player.stats.goals, 0)],
              ['Assists', squad.reduce((sum, player) => sum + player.stats.assists, 0)],
              ['Shots', squad.reduce((sum, player) => sum + player.stats.shots, 0)],
              ['Shots on target', squad.reduce((sum, player) => sum + player.stats.shotsOnTarget, 0)],
              ['Goalkeepers saved against', 0],
            ]} />
            <TeamStatSection title="Defending" items={[
              ['Interceptions', squad.reduce((sum, player) => sum + player.stats.interceptions, 0)],
              ['Tackles', squad.reduce((sum, player) => sum + player.stats.tackles, 0)],
              ['Yellow cards', squad.reduce((sum, player) => sum + player.stats.yellowCards, 0)],
              ['Red cards', squad.reduce((sum, player) => sum + player.stats.redCards, 0)],
              ['Own goals', squad.reduce((sum, player) => sum + player.stats.ownGoals, 0)],
            ]} />
          </div>
        </Widget>

        <Widget title="Current Tournament">
          <div className="tournament-summary-card">
            <strong>{latestTournament?.name}</strong>
            <p>Current place #{team.rank}</p>
            <small>{team.wins} wins | {team.draws} draws | {team.losses} losses</small>
          </div>
        </Widget>

        <Widget title="Recent Matches" className="span-two">
          <div className="results-stack">
            {recent.map((match) => (
              <div key={match.id} className="log-card">
                <div>
                  <strong>{match.competition}</strong>
                  <p>{match.date} | {match.time}</p>
                </div>
                <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                <div>
                  <strong>MVP</strong>
                  <p>{match.mvpId}</p>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Tournament History">
          <div className="timeline">
            <div className="timeline-item">
              <strong>IOSCA Champions Cup</strong>
              <p>Reached semi finals</p>
              <small>Knockout record 3W 1L</small>
            </div>
            <div className="timeline-item">
              <strong>Founder&apos;s Shield</strong>
              <p>Runners up</p>
              <small>Finished with the silver medal.</small>
            </div>
          </div>
        </Widget>
      </section>
    </div>
  )
}

function TeamStatSection({ title, items }) {
  return (
    <div className="stats-section-card">
      <h3>{title}</h3>
      <div className="stats-pair-list">
        {items.map(([label, value]) => (
          <div key={label} className="stats-pair-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
