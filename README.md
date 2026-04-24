# Garmin MCP Dashboard

Nuxt 3 dashboard for Garmin data through a Garmin Connect MCP server.

## Features

- Garmin MCP server integration on Nuxt server side
- Steps / sleep score charts
- Recent activities table
- AI summary panel
- Mock fallback when MCP is not configured yet

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Configure Garmin MCP

Edit `.env`:

```bash
GARMIN_MCP_COMMAND=npx
GARMIN_MCP_ARGS=-y garmin-connect-mcp
```

If your MCP server uses different tool names, set them explicitly:

```bash
GARMIN_MCP_DAILY_TOOL=get_daily_summary
GARMIN_MCP_ACTIVITIES_TOOL=get_activities
```

## Important files

```text
server/api/garmin/dashboard.get.ts     Nuxt API endpoint
server/utils/garminMcp.ts              MCP client + Garmin data normalizer
types/garmin.ts                        Dashboard data contract
pages/index.vue                        Dashboard UI
```

## Data flow

```text
Garmin Connect MCP Server
   -> server-side MCP client
Nuxt API /api/garmin/dashboard
   ->
Nuxt Dashboard UI
```

Garmin credentials stay server-side. The frontend never talks to Garmin or MCP directly.
