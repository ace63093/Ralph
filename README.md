# N-central Device Inactivity Dashboard

Local-first dashboard for N-able N-central devices, built with plain HTML/CSS/JS and a lightweight Express proxy. It can export a single HTML file for Rewst App Builder (HTML Container).

## Local setup
1. Copy `.env.example` to `.env` and set your N-central values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Environment variables (local proxy)
- `NC_BASE_URL`: Base URL for N-central, e.g. `https://YOUR_NCENTRAL_SERVER`.
- `NC_USER_JWT`: User API JWT (server-side only).
- `NC_PAGE_SIZE`: Page size for device paging (default 100).
- `PORT`: Express port (default 3000).

## Running tests
```bash
npm test
```

## Rewst export workflow
Generate a single-file HTML bundle with inline CSS/JS:
```bash
npm run export:rewst
```
Copy the contents of `dist/rewst-embed.html` into a Rewst App Builder **HTML Container** component.

### Rewst data expectations
Set `window.DASH_CONFIG` inside Rewst to configure the data provider:
```html
<script>
  window.DASH_CONFIG = {
    dataMode: "rewst",
    apiBaseUrl: "",
    rewstWebhookUrl: "https://your-webhook-url",
    defaultOrgUnitId: ""
  };
</script>
```
The Rewst webhook should return a JSON list of devices:
```json
[
  {
    "deviceId": "123",
    "longName": "Example Device",
    "deviceClass": "Server",
    "uri": "/api/devices/123",
    "orgUnitId": "456",
    "customerId": "789",
    "lastCheckinTime": "2024-06-01T12:34:56.000Z"
  }
]
```

## N-central API assumptions
- `POST /api/auth/authenticate` with `Authorization: Bearer <USER_API_JWT>` returns access + refresh tokens.
- `POST /api/auth/refresh` refreshes the access token using refresh token.
- `GET /api/devices` supports paging (`pageNumber`, `pageSize`) and optional `orgUnitId` filtering.
- `lastApplianceCheckinTime` is preferred for last check-in; fall back to detail per device when missing.

## Scripts
- `npm run dev`: Start local proxy + static UI.
- `npm test`: Run test suite.
- `npm run export:rewst`: Generate `dist/rewst-embed.html`.
