Python API and sync layer for the IOSCA Hub.

Postgres/Supabase stays the bot source database. The public hub read model now lives in a dedicated Postgres schema, so the API only reads from mirrored `hub` tables instead of operational bot tables.

## Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply the hub Postgres schema:

```bash
python scripts/apply_hub_schema.py
```

Run a full sync from source tables into the hub schema:

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
HUB_POSTGRES_SCHEMA=iosca_hub_production
```

## Data Boundary

Keep these in the source schema only:

- Discord channel config and lineup state
- active match contexts
- server/RCON config
- import skip bookkeeping
- moderation/admin-only workflows

Mirror these into the hub schema:

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

Hub-only features like media metadata, profile overrides, public badges, and editorial content can live in the hub schema because the bot does not need them.

## Read Model Strategy

Public hub pages should only call this API and only read `HUB_POSTGRES_SCHEMA`. The sync script is the only part that reads the source tables for hub data.

Recommended production flow:

```bash
python scripts/apply_hub_schema.py
python scripts/sync_from_postgres.py
```

Run the sync every 2-5 minutes from cron, a panel scheduler, or a small worker process. Do not query operational source tables from frontend pages or public API request handlers.

## Frontend API Base URL

The hub frontend now reads from this API instead of local mock data.

- If the frontend and API are served on the same host behind the same origin, no extra frontend API setting is required.
- If the frontend is served separately, set:

```env
VITE_HUB_API_BASE_URL=https://your-api-host
```

The frontend will call endpoints like `/api/players`, `/api/teams`, `/api/matches`, `/api/tournaments`, and `/api/media` against that base URL.
