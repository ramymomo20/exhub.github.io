import {
  fixtures,
  homeFeatures,
  matches,
  media,
  players,
  quickStats,
  rankingGroups,
  records,
  standings,
  teamOfWeek,
  teams,
  tournaments,
} from './mockData'

const teamIndex = new Map(teams.map((team) => [team.id, team]))
const playerIndex = new Map(players.map((player) => [player.id, player]))
const matchIndex = new Map(matches.map((match) => [match.id, match]))
const tournamentIndex = new Map(tournaments.map((tournament) => [tournament.id, tournament]))

export const listTeams = () => teams
export const getTeamById = (teamId) => teamIndex.get(teamId) ?? null
export const getTeamName = (teamId) => getTeamById(teamId)?.name ?? teamId
export const listPlayers = () => players
export const getPlayerById = (playerId) => playerIndex.get(playerId) ?? null
export const listPlayersByTeamId = (teamId) => players.filter((player) => player.teamId === teamId)
export const listMatches = () => matches
export const getMatchById = (matchId) => matchIndex.get(matchId) ?? null
export const listMatchesByTeamId = (teamId) => matches.filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId)
export const listPlayersByIds = (playerIds) => playerIds.map((playerId) => getPlayerById(playerId)).filter(Boolean)
export const listStandings = () => standings
export const listFixtures = () => fixtures
export const listTournaments = () => tournaments
export const getTournamentById = (tournamentId) => tournamentIndex.get(tournamentId) ?? null
export const listRecords = () => records
export const listMedia = () => media
export const listRankingGroups = () => rankingGroups
export const listHomeFeatures = () => homeFeatures
export const listQuickStats = () => quickStats
export const listTeamOfWeek = () => teamOfWeek
