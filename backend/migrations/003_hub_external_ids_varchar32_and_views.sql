ALTER TABLE hub_players
    MODIFY steam_id VARCHAR(32) NOT NULL,
    MODIFY discord_id VARCHAR(32) NULL;

ALTER TABLE hub_teams
    MODIFY guild_id VARCHAR(32) NOT NULL,
    MODIFY captain_discord_id VARCHAR(32) NULL;

ALTER TABLE hub_matches
    MODIFY home_guild_id VARCHAR(32) NULL,
    MODIFY away_guild_id VARCHAR(32) NULL,
    MODIFY mvp_steam_id VARCHAR(32) NULL;

ALTER TABLE hub_match_lineups
    MODIFY steam_id VARCHAR(32) NOT NULL,
    MODIFY team_guild_id VARCHAR(32) NULL;

ALTER TABLE hub_match_player_stats
    MODIFY steam_id VARCHAR(32) NOT NULL,
    MODIFY team_guild_id VARCHAR(32) NULL;

ALTER TABLE hub_match_events
    MODIFY source_event_id VARCHAR(255) NOT NULL,
    MODIFY team_guild_id VARCHAR(32) NULL,
    MODIFY player1_steam_id VARCHAR(32) NULL,
    MODIFY player2_steam_id VARCHAR(32) NULL,
    MODIFY player3_steam_id VARCHAR(32) NULL;

ALTER TABLE hub_player_rating_history
    MODIFY steam_id VARCHAR(32) NOT NULL;

ALTER TABLE hub_tournament_teams
    MODIFY guild_id VARCHAR(32) NULL;

ALTER TABLE hub_tournament_standings
    MODIFY guild_id VARCHAR(32) NULL;

ALTER TABLE hub_tournament_fixtures
    MODIFY home_guild_id VARCHAR(32) NULL,
    MODIFY away_guild_id VARCHAR(32) NULL;

ALTER TABLE hub_media_assets
    MODIFY team_guild_id VARCHAR(32) NULL,
    MODIFY player_steam_id VARCHAR(32) NULL;

CREATE OR REPLACE VIEW v_hub_player_totals AS
SELECT
    p.*,
    COALESCE(s.goals, 0) AS goals,
    COALESCE(s.assists, 0) AS assists,
    COALESCE(s.second_assists, 0) AS second_assists,
    COALESCE(s.keeper_saves, 0) AS keeper_saves,
    COALESCE(s.interceptions, 0) AS interceptions,
    COALESCE(s.tackles, 0) AS tackles,
    COALESCE(s.avg_match_rating, 0) AS avg_match_rating,
    COALESCE(s.mvp_awards, 0) AS mvp_awards
FROM hub_players p
LEFT JOIN (
    SELECT
        steam_id,
        SUM(goals) AS goals,
        SUM(assists) AS assists,
        SUM(second_assists) AS second_assists,
        SUM(keeper_saves) AS keeper_saves,
        SUM(interceptions) AS interceptions,
        SUM(tackles) AS tackles,
        AVG(match_rating) AS avg_match_rating,
        SUM(CASE WHEN is_match_mvp THEN 1 ELSE 0 END) AS mvp_awards
    FROM hub_match_player_stats
    GROUP BY steam_id
) s ON s.steam_id = p.steam_id;

CREATE OR REPLACE VIEW v_hub_match_overview AS
SELECT
    m.match_stats_id,
    m.match_id,
    m.match_datetime,
    m.home_guild_id,
    m.away_guild_id,
    COALESCE(ht.name, m.home_team_name) AS home_team_name,
    ht.short_name AS home_short_name,
    ht.crest_url AS home_crest_url,
    COALESCE(at.name, m.away_team_name) AS away_team_name,
    at.short_name AS away_short_name,
    at.crest_url AS away_crest_url,
    m.home_score,
    m.away_score,
    m.game_type,
    m.extratime,
    m.penalties,
    m.comeback_flag,
    m.source_filename,
    m.mvp_steam_id,
    m.mvp_player_name,
    m.mvp_match_rating,
    m.source_updated_at,
    m.synced_at
FROM hub_matches m
LEFT JOIN hub_teams ht ON ht.guild_id = m.home_guild_id
LEFT JOIN hub_teams at ON at.guild_id = m.away_guild_id;

CREATE OR REPLACE VIEW v_hub_team_profile_summary AS
SELECT
    t.guild_id,
    t.name,
    t.short_name,
    t.crest_url,
    t.captain_discord_id,
    t.captain_name,
    t.average_rating,
    t.is_national_team,
    t.is_mix_team,
    t.created_at,
    t.source_updated_at,
    t.synced_at,
    COALESCE(player_agg.player_count, 0) AS player_count,
    COALESCE(player_agg.total_goals, 0) AS total_goals,
    COALESCE(player_agg.total_assists, 0) AS total_assists,
    COALESCE(match_agg.matches_played, 0) AS matches_played,
    COALESCE(match_agg.wins, 0) AS wins,
    COALESCE(match_agg.draws, 0) AS draws,
    COALESCE(match_agg.losses, 0) AS losses,
    COALESCE(match_agg.goals_for, 0) AS goals_for,
    COALESCE(match_agg.goals_against, 0) AS goals_against
FROM hub_teams t
LEFT JOIN (
    SELECT
        team_guild_id,
        COUNT(DISTINCT steam_id) AS player_count,
        SUM(goals) AS total_goals,
        SUM(assists) AS total_assists
    FROM hub_match_player_stats
    WHERE team_guild_id IS NOT NULL
    GROUP BY team_guild_id
) player_agg ON player_agg.team_guild_id = t.guild_id
LEFT JOIN (
    SELECT
        team_guild_id,
        COUNT(*) AS matches_played,
        SUM(CASE WHEN goals_for > goals_against THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN goals_for = goals_against THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN goals_for < goals_against THEN 1 ELSE 0 END) AS losses,
        SUM(goals_for) AS goals_for,
        SUM(goals_against) AS goals_against
    FROM (
        SELECT
            home_guild_id AS team_guild_id,
            home_score AS goals_for,
            away_score AS goals_against
        FROM hub_matches
        WHERE home_guild_id IS NOT NULL
        UNION ALL
        SELECT
            away_guild_id AS team_guild_id,
            away_score AS goals_for,
            home_score AS goals_against
        FROM hub_matches
        WHERE away_guild_id IS NOT NULL
    ) match_rows
    GROUP BY team_guild_id
) match_agg ON match_agg.team_guild_id = t.guild_id;

CREATE OR REPLACE VIEW v_hub_tournament_standings_enriched AS
SELECT
    s.tournament_id,
    s.guild_id,
    COALESCE(tt.team_name, t.name) AS team_name,
    COALESCE(tt.team_icon, t.crest_url) AS team_icon,
    t.short_name,
    t.average_rating,
    s.wins,
    s.draws,
    s.losses,
    s.goals_for,
    s.goals_against,
    s.goal_diff,
    s.points,
    s.matches_played,
    s.source_updated_at,
    s.synced_at
FROM hub_tournament_standings s
LEFT JOIN hub_tournament_teams tt
    ON tt.tournament_id = s.tournament_id
   AND tt.guild_id <=> s.guild_id
LEFT JOIN hub_teams t ON t.guild_id = s.guild_id;
