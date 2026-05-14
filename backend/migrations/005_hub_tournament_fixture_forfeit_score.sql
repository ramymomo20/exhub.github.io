ALTER TABLE hub_tournament_fixtures
    ADD COLUMN IF NOT EXISTS forfeit_score INT NOT NULL DEFAULT 10 AFTER is_forfeit_away;
