# N-central Device Inactivity Dashboard (30/90-day filters)

## Overview
Build a local-first dashboard for N-able N-central devices that shows device activity in a sortable/filterable table. The UI groups devices by last check-in age (≤30 days, ≤90 days, >90 days, unknown), and it can be exported as a single HTML blob for Rewst App Builder (HTML Container) usage.

## Non-goals
- No direct browser access to N-central tokens.
- No React/Vue or build-step dependent tooling for local UI.
- No long-term persistence layer beyond in-memory caching.

## Local-first workflow (proxy server)
- Local Express server proxies N-central API calls.
- UI fetches `/api/devices` from the local server.
- Server handles authentication, refresh, paging, and normalization.

## Rewst import workflow
- Export a single-file HTML bundle (`dist/rewst-embed.html`) with inlined CSS and JS.
- UI reads runtime config from `window.DASH_CONFIG` so Rewst can override the data provider.
- Data provider abstraction supports `local` (proxy) and `rewst` (webhook) modes.

## User stories
1. As an operator, I can run a local dev server that proxies N-central data.
2. As an operator, I can see devices grouped by inactivity buckets.
3. As an operator, I can sort devices by name, class, customer ID, or last check-in.
4. As an operator, I can filter devices by inactivity bucket.
5. As an operator, I can switch data providers between local proxy and Rewst webhook.
6. As a Rewst admin, I can export a single HTML file for App Builder import.
7. As a developer, I can run tests validating bucketing, sorting, normalization, and export output.
8. As a developer, I can configure required env vars for local mode.
9. As a Rewst admin, I can read clear docs for webhook payload expectations.
10. As a developer, I can rely on safe timestamp parsing and normalization.

## Acceptance criteria and verification commands
- Story: Scaffold dev server
  - Dev server serves static UI and `/api/devices` endpoint.
  - Verify: `npm run dev`
- Story: Bucketization logic
  - Devices map to ≤30, ≤90, >90, or unknown buckets.
  - Verify: `npm test -- -t "bucketization"`
- Story: Sorting logic
  - Sorting works for name, customer ID, and last check-in.
  - Verify: `npm test -- -t "sorting"`
- Story: Server normalization
  - Device payloads normalize to expected shape and ISO timestamps.
  - Verify: `npm test -- -t "normalize"`
- Story: Data provider abstraction
  - UI uses local proxy or Rewst webhook based on config.
  - Verify: `npm test -- -t "provider"`
- Story: Export for Rewst
  - `dist/rewst-embed.html` has inline CSS/JS and `window.DASH_CONFIG`.
  - Verify: `npm test -- -t "export"`
- Story: Documentation
  - README includes local setup, env vars, tests, and Rewst export steps.
  - Verify: `rg "Rewst" README.md`

## Completion signal
<promise>NCENTRAL_DASHBOARD_COMPLETE</promise>
