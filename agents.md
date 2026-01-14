# Ralph AFK Notes

- Never expose N-central tokens to the browser. Keep auth in the server-side proxy.
- Local env vars: `NC_BASE_URL`, `NC_USER_JWT`, `NC_PAGE_SIZE`, `PORT`.
- Rewst UI config uses `window.DASH_CONFIG = { dataMode, apiBaseUrl, rewstWebhookUrl, defaultOrgUnitId }`.
- Rewst import: copy `dist/rewst-embed.html` into a Rewst App Builder HTML Container.
- Inactive buckets: ≤30 days, ≤90 days, >90 days, or unknown when no valid timestamp.
- Per-device detail fallback should use concurrency limits and caching to avoid N-central rate limits.
