Python API and sync layer for the IOSCA Hub.

Postgres/Supabase stays the bot source database. MySQL is the hub read replica so public page traffic does not consume Supabase egress.

## Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply the MySQL schema:

```bash
python scripts/apply_mysql_schema.py
```

Run a full sync from Postgres to MySQL:

```bash
python scripts/sync_from_postgres.py
```

Run the API locally:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment

The backend reads the repo root `.env` by default. Required variables:

```env
SUPABASE_DB_URL=postgresql://...
MYSQL_CONNECTION_STRING=mysql://user:password@host:3306/database
```

You can also use `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MYSQL_ENDPOINT`, and `MYSQL_DATABASE`.

## Data Boundary

Keep these in Postgres only:

- Discord channel config and lineup state
- active match contexts
- server/RCON config
- import skip bookkeeping
- moderation/admin-only workflows

Mirror these into MySQL:

- public players and ratings
- public teams
- matches
- match lineups
- player match stats
- match events with coordinates
- rating history
- tournaments, fixtures, standings

Convention:

- Discord-facing IDs (`guild_id`, `discord_id`, captain/user/channel/role style IDs when mirrored) are stored as strings in the hub model.
- Internal record keys (`match_stats_id`, `tournament_id`, `fixture_id`) stay numeric.

Hub-only features like media metadata, profile overrides, public badges, and editorial content can live in MySQL because the bot does not need them.

## Reducing Supabase Egress

Public hub pages should only call this API/MySQL. The sync script is the only part that reads Supabase for hub data.

Recommended production flow:

```bash
python scripts/sync_from_postgres.py
```

Run that every 2-5 minutes from cron, a panel scheduler, or a small worker process. Do not query Supabase from frontend pages or public API request handlers.

## Frontend API Base URL

The hub frontend now reads from this API instead of local mock data.

- If the frontend and API are served on the same host behind the same origin, no extra frontend API setting is required.
- If the frontend is served separately, set:

```env
VITE_HUB_API_BASE_URL=https://your-api-host
```

The frontend will call endpoints like `/api/players`, `/api/teams`, `/api/matches`, `/api/tournaments`, and `/api/media` against that base URL.
