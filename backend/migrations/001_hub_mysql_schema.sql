-- IOSCA Hub MySQL read-model schema.
-- Postgres remains the bot/source database; these tables are public hub mirrors.
-- External identifiers (Discord/Steam/match IDs) are stored as strings.

CREATE TABLE IF NOT EXISTS hub_sync_state (
    sync_key VARCHAR(64) PRIMARY KEY,
    last_synced_at DATETIME(6) NULL,
    last_source_updated_at DATETIME(6) NULL,
    rows_synced INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'idle',
    error_message TEXT NULL,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_players (
    steam_id VARCHAR(32) PRIMARY KEY,
    discord_id VARCHAR(32) NULL,
    display_name VARCHAR(255) NOT NULL,
    primary_position VARCHAR(16) NULL,
    rating DECIMAL(5,2) NULL,
    atk_rating DECIMAL(5,2) NULL,
    mid_rating DECIMAL(5,2) NULL,
    def_rating DECIMAL(5,2) NULL,
    gk_rating DECIMAL(5,2) NULL,
    appearances INT NOT NULL DEFAULT 0,
    total_minutes INT NOT NULL DEFAULT 0,
    last_match_at DATETIME NULL,
    registered_at DATETIME NULL,
    source_updated_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_hub_players_rating (rating DESC),
    INDEX idx_hub_players_name (display_name),
    INDEX idx_hub_players_discord (discord_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_teams (
    guild_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(32) NULL,
    crest_url TEXT NULL,
    captain_discord_id VARCHAR(32) NULL,
    captain_name VARCHAR(255) NULL,
    average_rating DECIMAL(5,2) NULL,
    is_national_team BOOLEAN NOT NULL DEFAULT FALSE,
    is_mix_team BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NULL,
    source_updated_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_hub_teams_rating (average_rating DESC),
    INDEX idx_hub_teams_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_matches (
    match_stats_id INT PRIMARY KEY,
    match_id VARCHAR(255) NOT NULL UNIQUE,
    match_datetime DATETIME NOT NULL,
    home_guild_id VARCHAR(32) NULL,
    away_guild_id VARCHAR(32) NULL,
    home_team_name VARCHAR(255) NOT NULL,
    away_team_name VARCHAR(255) NOT NULL,
    home_score INT NOT NULL DEFAULT 0,
    away_score INT NOT NULL DEFAULT 0,
    game_type VARCHAR(10) NOT NULL,
    extratime BOOLEAN NOT NULL DEFAULT FALSE,
    penalties BOOLEAN NOT NULL DEFAULT FALSE,
    comeback_flag BOOLEAN NOT NULL DEFAULT FALSE,
    source_filename TEXT NULL,
    mvp_steam_id VARCHAR(32) NULL,
    mvp_player_name VARCHAR(255) NULL,
    mvp_match_rating DECIMAL(5,2) NULL,
    source_updated_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_hub_matches_datetime (match_datetime DESC),
    INDEX idx_hub_matches_home (home_guild_id),
    INDEX idx_hub_matches_away (away_guild_id),
    INDEX idx_hub_matches_type (game_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_match_lineups (
    match_stats_id INT NOT NULL,
    side VARCHAR(8) NOT NULL,
    steam_id VARCHAR(32) NOT NULL,
    team_guild_id VARCHAR(32) NULL,
    player_name VARCHAR(255) NOT NULL,
    position_code VARCHAR(16) NULL,
    started BOOLEAN NOT NULL DEFAULT FALSE,
    slot_order INT NOT NULL DEFAULT 0,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (match_stats_id, side, steam_id),
    INDEX idx_hub_lineups_player (steam_id),
    INDEX idx_hub_lineups_team (team_guild_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_match_player_stats (
    source_player_match_data_id INT PRIMARY KEY,
    match_stats_id INT NOT NULL,
    match_id VARCHAR(255) NOT NULL,
    steam_id VARCHAR(32) NOT NULL,
    team_guild_id VARCHAR(32) NULL,
    team_side VARCHAR(8) NULL,
    guild_team_name VARCHAR(255) NULL,
    player_name VARCHAR(255) NULL,
    position_code VARCHAR(16) NULL,
    status VARCHAR(32) NULL,
    match_rating DECIMAL(5,2) NULL,
    is_match_mvp BOOLEAN NOT NULL DEFAULT FALSE,
    goals INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    second_assists INT NOT NULL DEFAULT 0,
    shots INT NOT NULL DEFAULT 0,
    shots_on_goal INT NOT NULL DEFAULT 0,
    passes_completed INT NOT NULL DEFAULT 0,
    passes_attempted INT NOT NULL DEFAULT 0,
    pass_accuracy DECIMAL(6,2) NOT NULL DEFAULT 0,
    chances_created INT NOT NULL DEFAULT 0,
    key_passes INT NOT NULL DEFAULT 0,
    interceptions INT NOT NULL DEFAULT 0,
    tackles INT NOT NULL DEFAULT 0,
    sliding_tackles_completed INT NOT NULL DEFAULT 0,
    fouls INT NOT NULL DEFAULT 0,
    fouls_suffered INT NOT NULL DEFAULT 0,
    yellow_cards INT NOT NULL DEFAULT 0,
    red_cards INT NOT NULL DEFAULT 0,
    own_goals INT NOT NULL DEFAULT 0,
    keeper_saves INT NOT NULL DEFAULT 0,
    keeper_saves_caught INT NOT NULL DEFAULT 0,
    goals_conceded INT NOT NULL DEFAULT 0,
    offsides INT NOT NULL DEFAULT 0,
    possession DECIMAL(6,2) NOT NULL DEFAULT 0,
    time_played INT NOT NULL DEFAULT 0,
    distance_covered DECIMAL(10,2) NOT NULL DEFAULT 0,
    source_updated_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uniq_hub_pmd_match_player (match_stats_id, steam_id),
    INDEX idx_hub_pmd_match (match_stats_id),
    INDEX idx_hub_pmd_player (steam_id),
    INDEX idx_hub_pmd_team (team_guild_id),
    INDEX idx_hub_pmd_rating (match_rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_match_events (
    source_event_id VARCHAR(255) PRIMARY KEY,
    match_stats_id INT NOT NULL,
    match_id VARCHAR(255) NOT NULL,
    event_index INT NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    raw_event VARCHAR(64) NULL,
    team_side VARCHAR(16) NULL,
    team_guild_id VARCHAR(32) NULL,
    period VARCHAR(64) NULL,
    raw_second INT NULL,
    match_second INT NULL,
    minute INT NULL,
    clock VARCHAR(16) NULL,
    player1_steam_id VARCHAR(32) NULL,
    player2_steam_id VARCHAR(32) NULL,
    player3_steam_id VARCHAR(32) NULL,
    body_part INT NULL,
    x DOUBLE NULL,
    y DOUBLE NULL,
    norm_x DOUBLE NULL,
    norm_y DOUBLE NULL,
    raw_event_payload JSON NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uniq_hub_event_match_index (match_stats_id, event_index),
    INDEX idx_hub_events_match_type (match_stats_id, event_type),
    INDEX idx_hub_events_player_type (player1_steam_id, event_type),
    INDEX idx_hub_events_team_type (team_guild_id, event_type),
    INDEX idx_hub_events_location (event_type, norm_x, norm_y)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_player_rating_history (
    source_rating_history_id BIGINT PRIMARY KEY,
    steam_id VARCHAR(32) NOT NULL,
    player_name VARCHAR(255) NULL,
    rating DECIMAL(5,2) NULL,
    atk_rating DECIMAL(5,2) NULL,
    mid_rating DECIMAL(5,2) NULL,
    def_rating DECIMAL(5,2) NULL,
    gk_rating DECIMAL(5,2) NULL,
    main_role VARCHAR(16) NULL,
    main_role_rating DECIMAL(5,2) NULL,
    display_main_role_rating DECIMAL(5,2) NULL,
    total_appearances INT NULL,
    total_minutes INT NULL,
    last_match_at DATETIME NULL,
    formula_version VARCHAR(64) NOT NULL,
    source VARCHAR(64) NOT NULL,
    rating_run_at DATETIME NOT NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_hub_rating_history_player_time (steam_id, rating_run_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_tournaments (
    tournament_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(10) NOT NULL,
    status VARCHAR(32) NOT NULL,
    num_teams INT NOT NULL DEFAULT 0,
    league_count INT NOT NULL DEFAULT 1,
    points_win INT NOT NULL DEFAULT 3,
    points_draw INT NOT NULL DEFAULT 1,
    points_loss INT NOT NULL DEFAULT 0,
    created_at DATETIME NULL,
    source_updated_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_hub_tournaments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_tournament_teams (
    source_id INT PRIMARY KEY,
    tournament_id INT NOT NULL,
    guild_id VARCHAR(32) NULL,
    team_name VARCHAR(255) NOT NULL,
    team_icon TEXT NULL,
    league_key VARCHAR(8) NOT NULL,
    seed INT NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uniq_hub_tournament_team (tournament_id, guild_id),
    INDEX idx_hub_tournament_teams_tournament (tournament_id, league_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_tournament_standings (
    tournament_id INT NOT NULL,
    guild_id VARCHAR(32) NULL,
    wins INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_diff INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    matches_played INT NOT NULL DEFAULT 0,
    source_updated_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (tournament_id, guild_id),
    INDEX idx_hub_standings_points (tournament_id, points DESC, goal_diff DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_tournament_fixtures (
    fixture_id INT PRIMARY KEY,
    tournament_id INT NOT NULL,
    league_key VARCHAR(8) NOT NULL,
    week_number INT NULL,
    week_label TEXT NULL,
    home_guild_id VARCHAR(32) NULL,
    away_guild_id VARCHAR(32) NULL,
    home_name VARCHAR(255) NULL,
    away_name VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_played BOOLEAN NOT NULL DEFAULT FALSE,
    is_draw_home BOOLEAN NOT NULL DEFAULT FALSE,
    is_draw_away BOOLEAN NOT NULL DEFAULT FALSE,
    is_forfeit_home BOOLEAN NOT NULL DEFAULT FALSE,
    is_forfeit_away BOOLEAN NOT NULL DEFAULT FALSE,
    played_match_stats_id INT NULL,
    played_at DATETIME NULL,
    created_at DATETIME NULL,
    synced_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_hub_fixtures_tournament (tournament_id, league_key, week_number),
    INDEX idx_hub_fixtures_played_match (played_match_stats_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_media_assets (
    media_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_type VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    public_url TEXT NOT NULL,
    thumbnail_url TEXT NULL,
    storage_key VARCHAR(512) NULL,
    match_stats_id INT NULL,
    team_guild_id VARCHAR(32) NULL,
    player_steam_id VARCHAR(32) NULL,
    tournament_id INT NULL,
    duration_seconds INT NULL,
    file_size_bytes BIGINT NULL,
    mime_type VARCHAR(128) NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_hub_media_match (match_stats_id),
    INDEX idx_hub_media_player (player_steam_id),
    INDEX idx_hub_media_team (team_guild_id),
    INDEX idx_hub_media_type (media_type, is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_media_tags (
    media_id BIGINT NOT NULL,
    tag VARCHAR(64) NOT NULL,
    PRIMARY KEY (media_id, tag),
    INDEX idx_hub_media_tags_tag (tag),
    CONSTRAINT fk_hub_media_tags_asset
        FOREIGN KEY (media_id) REFERENCES hub_media_assets(media_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hub_profile_overrides (
    owner_type VARCHAR(16) NOT NULL,
    owner_key VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NULL,
    avatar_url TEXT NULL,
    banner_url TEXT NULL,
    bio TEXT NULL,
    metadata JSON NULL,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (owner_type, owner_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
