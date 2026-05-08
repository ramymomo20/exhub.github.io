# IOSCA Hub Research

Research date: 2026-05-08

## Goal

Understand what the reference sites are doing well, what patterns they share, and what that means for building an IOSoccer community hub for IOSCA without copying either site directly.

## Reference Sites Reviewed

### 1. `https://ioshubv2.com/`

Observed homepage sections and navigation:

- Players
- Teams
- Matches
- Live
- Fixtures
- Tournaments
- Transfers
- Ratings
- Leaderboards
- Support

Observed homepage feature blocks:

- Top Teams
- Rating Distribution
- Player Head 2 Head
- Team Head 2 Head
- Leaderboards

What this tells us:

- The site is positioned as a complete IOSoccer ecosystem, not just a stats page.
- The homepage is content-driven and editorial. It tries to direct users into key parts of the product.
- Comparison tools are treated as flagship features, not side utilities.
- The product framing emphasizes prestige, rankings, and discoverability.

Implementation note:

- The site is currently behind Cloudflare protection, so its raw delivery stack was not directly inspectable from normal CLI requests during this research pass.

### 2. `https://hub.amirvv.org/`

Observed delivery pattern:

- HTML shell served from Vercel.
- Single-page app shell with a React-style root mount (`<div id="root"></div>`).
- Vite-style bundled assets and module preloads.
- Tailwind-style compiled CSS with dark-theme tokens.

Observed route and feature patterns from the client bundle:

- `/players`
- `/teams`
- `/matches`
- `/match/:id` style detail routing
- `/leaderboards`
- `/compare`
- `/h2h`
- `/live-scores`
- `/fixtures`
- `/tournaments`
- `/transfers`
- `/statistics`
- `/top-performers`
- `/search`
- `/favorites`
- `/news`

Observed design/implementation signals:

- Dark-mode-first interface.
- Utility-heavy SPA structure.
- Inter-based typography.
- Card-driven layout.
- Gradient buttons, glow, hover elevation, and glassy dark surfaces.
- Responsive grid classes for 2, 3, 4, 5, 6, and 12-column layouts.

What this tells us:

- This site leans more toward an application shell than a curated landing page.
- It values breadth of navigation and search/discovery.
- It is built to support deeper feature growth over time.

## Shared Product Patterns

These two sites are not identical, but they clearly share a product model:

1. They organize the community around entities.
   Players, teams, matches, tournaments, and rankings are the core information model.

2. They make navigation immediate.
   The main sections are visible at the top level instead of hidden behind nested menus.

3. They present stats as competition, not bookkeeping.
   Ratings, leaderboards, top performers, and comparisons are framed as status markers.

4. They use a dark sports/gaming visual language.
   High contrast, elevated cards, accent glows, scoreboard compositions, and strong badge treatment are common.

5. They balance overview pages with detail pages.
   Users can scan top-level hubs, then drill into specific players, teams, or matches.

6. They treat comparisons as core UX.
   Head-to-head and ranking views are central because they create repeat visits and arguments, which is valuable for a competitive Discord community.

## Shared Design Ideas Worth Reusing

- Large, obvious top navigation for core entities.
- Strong home landing section instead of a blank data wall.
- Dark background with layered surface cards.
- Scoreboards and ratings as the most visually dominant numbers on the page.
- Team crests, player portraits, badges, and status colors to break up text-heavy layouts.
- Featured modules that span multiple columns to create hierarchy.
- Hover elevation and subtle lighting instead of flat cards.
- Search and filters placed high in the page, not buried.

## Functional Ideas Worth Reusing

- Player profiles with career stats and recent form.
- Team pages with squad, form, and recent results.
- Match list plus match detail pages.
- Leaderboards for different stat categories.
- Player vs player and team vs team comparison tools.
- Tournament browsing and standings.
- Live or near-live match area if data becomes available.
- Ratings distribution or seasonal rating views.

## Important Differences Between The References

### `ioshubv2.com`

- More editorial homepage framing.
- Cleaner emphasis on marquee features.
- Stronger "hub" feeling from the front page.

### `hub.amirvv.org`

- Broader route surface.
- More app-like internal structure.
- Better signal for long-term extensibility.

## Direction For IOSCA Hub

The right move is not to split the difference mechanically. The better move is:

- Borrow the cinematic homepage mindset from `ioshubv2.com`.
- Borrow the route depth and application structure from `hub.amirvv.org`.
- Push harder on football broadcast identity than either reference.
- Make league/tournament storytelling more central than generic stats tables.

In practice, IOSCA Hub should feel like:

- a football broadcast package on the homepage,
- a competitive analytics product in profile/detail views,
- and a clean gaming hub in navigation and interaction design.

## What We Should Not Copy

- Exact page structure.
- Exact branding, spacing, or component layouts.
- Exact color palette.
- Exact wording for sections or features.

We should take the product logic, not the skin.

## Architecture Reality Check

GitHub Pages is a static hosting platform. That matters immediately.

What GitHub Pages is good for:

- HTML/CSS/JS frontend
- prebuilt assets
- statically generated JSON
- build output from a framework

What GitHub Pages is not good for by itself:

- running a Python backend
- direct server-side APIs
- live database queries from the same host

This means IOSCA Hub should start in one of these two architectures:

### Option A: Static-first hub

Recommended for phase 1.

- Frontend deployed to GitHub Pages.
- Python scripts collect or transform data.
- GitHub Actions runs scheduled jobs.
- Generated JSON files are committed or published as static assets.
- Frontend reads those JSON files client-side.

Why this is strong:

- Cheap and simple.
- Good fit for GitHub Pages.
- Enough for player pages, team pages, match history, standings, leaderboards, and even rich homepage widgets if data updates on a schedule.

### Option B: Split frontend + API

Recommended only when the product outgrows static data.

- Frontend on GitHub Pages or Vercel.
- Python backend elsewhere, likely FastAPI.
- Database on Supabase/Postgres or similar.
- Frontend fetches live API data.

Why this exists:

- Better for authenticated features, admin tooling, live match ingestion, Discord-linked accounts, favorites, or write-heavy workflows.

## Recommended Build Direction

Start with Option A.

Reason:

- Your target experience is data-rich, but it does not require real-time writes on day one.
- Most of the value is in presentation, browseability, and consistency of stats.
- You can still design and build the full UX while keeping deployment simple.

Then introduce Option B later if you need:

- account systems,
- protected admin updates,
- live event ingestion,
- or deeper database-driven workflows.

## Proposed Repo Structure

This is the structure I would use in this repo once implementation starts:

```text
exhub.github-io/
  docs/
    research/
  frontend/
    src/
    public/
    assets/
      images/
      video/
      icons/
  data/
    raw/
    processed/
    public/
  scripts/
    ingest/
    transform/
    export/
  backend/
    api/
    models/
    services/
  .github/
    workflows/
```

How to interpret that:

- `frontend/` is the real app source.
- `data/` stores source data and generated JSON payloads.
- `scripts/` is where Python jobs should live.
- `backend/` stays dormant until a real API is needed.
- `.github/workflows/` becomes the automation layer for scheduled builds and deploys.

## Recommended Phase 1 Information Architecture

- Home
- Players
- Player Profile
- Teams
- Team Profile
- Matches
- Match Detail
- Rankings
- Tournaments

Phase 2:

- Compare Players
- Compare Teams
- Fixtures
- Seasonal Awards
- Transfer History
- News / Announcements

Phase 3:

- Live Match Center
- Admin ingestion tools
- Discord-linked user identity
- Favorites / watchlists

## Visual Direction Summary

The references confirm that the product category works best when it avoids plain admin-dashboard aesthetics.

IOSCA Hub should therefore prioritize:

- dark layered surfaces,
- strong sports hierarchy,
- big ratings and scorelines,
- team/player identity assets,
- multi-column widget composition,
- and a homepage that feels curated instead of generic.

Your longer prompt already points in the right direction. The strongest parts of it are:

- broadcast-style hierarchy,
- dark navy-black surfaces,
- meaningful accent colors,
- entity-first navigation,
- and premium player/team/match presentation.

## Practical Conclusion

Yes, we can build our own version for the IOSCA community.

The references already prove the product model:

- stats hub,
- entity pages,
- comparisons,
- rankings,
- and tournament discovery.

The main decision is not whether this is possible. It is whether we want to begin as:

- a static-first GitHub Pages product with Python-generated data, or
- a split app with an external API from the start.

The recommended answer is static-first.

## Sources

- `https://ioshubv2.com/`
- `https://hub.amirvv.org/`
- `https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages`
- `https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/github-pages-limits`
