import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import type { Activity, DailyMetric, DashboardData } from '~/types/garmin'
import { getMockGarminData } from '~/server/utils/mockGarmin'

type McpTool = { name: string; description?: string }

type McpToolResult = {
  content?: Array<{ type: string; text?: string; [key: string]: unknown }>
  [key: string]: unknown
}

let clientPromise: Promise<Client> | null = null

function splitArgs(args: string) {
  return args
    .split(' ')
    .map(v => v.trim())
    .filter(Boolean)
}

function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

async function getMcpClient() {
  const config = useRuntimeConfig()
  const command = String(config.garminMcpCommand || '')
  const args = splitArgs(String(config.garminMcpArgs || ''))

  if (!command) {
    throw new Error('Missing GARMIN_MCP_COMMAND. See .env.example.')
  }

  clientPromise ||= (async () => {
    const client = new Client({ name: 'garmin-mcp-dashboard', version: '0.1.0' })
    const transport = new StdioClientTransport({ command, args })
    await client.connect(transport)
    return client
  })()

  return clientPromise
}

async function listTools(client: Client): Promise<McpTool[]> {
  const result = await client.listTools()
  return (result.tools || []) as McpTool[]
}

function findTool(tools: McpTool[], envName: string | undefined, keywords: string[]) {
  if (envName) return envName
  const lowered = tools.map(t => ({ ...t, key: `${t.name} ${t.description || ''}`.toLowerCase() }))
  return lowered.find(t => keywords.every(k => t.key.includes(k)))?.name
    || lowered.find(t => keywords.some(k => t.key.includes(k)))?.name
}

function parseToolResult(result: McpToolResult) {
  const text = result.content?.find(c => c.type === 'text' && c.text)?.text
  if (!text) return result
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function callToolWithFallbackArgs(client: Client, name: string, dateRange: { startDate: string; endDate: string }) {
  const attempts = [
    { startDate: dateRange.startDate, endDate: dateRange.endDate },
    { start_date: dateRange.startDate, end_date: dateRange.endDate },
    { from: dateRange.startDate, to: dateRange.endDate },
    { date: dateRange.endDate },
    {}
  ]

  let lastError: unknown
  for (const args of attempts) {
    try {
      const result = await client.callTool({ name, arguments: args })
      return parseToolResult(result as McpToolResult)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

function num(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function first<T = unknown>(obj: Record<string, unknown>, keys: string[], fallback?: T): T {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key] as T
  }
  return fallback as T
}

function flattenArray(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) return input as Record<string, unknown>[]
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>
    const arrayValue = Object.values(obj).find(Array.isArray)
    if (Array.isArray(arrayValue)) return arrayValue as Record<string, unknown>[]
  }
  return []
}

function normalizeDaily(input: unknown): DailyMetric[] {
  const rows = flattenArray(input)
  return rows.map((row) => ({
    date: String(first(row, ['date', 'calendarDate', 'summaryDate', 'day'], isoDate())),
    steps: num(first(row, ['steps', 'totalSteps'])),
    calories: num(first(row, ['calories', 'activeKilocalories', 'totalKilocalories'])),
    restingHr: num(first(row, ['restingHr', 'restingHeartRate', 'minHeartRate'])),
    stressAvg: num(first(row, ['stressAvg', 'averageStressLevel', 'avgStressLevel'])),
    bodyBattery: num(first(row, ['bodyBattery', 'bodyBatteryMostRecentValue', 'bodyBatteryChargedValue'])),
    sleepScore: num(first(row, ['sleepScore', 'overallSleepScore', 'sleep_score']))
  })).filter(row => row.date)
}

function normalizeActivities(input: unknown): Activity[] {
  return flattenArray(input).slice(0, 10).map((row, index) => {
    const distanceMeters = num(first(row, ['distance', 'distanceMeters']), 0)
    const distanceKm = num(first(row, ['distanceKm']), distanceMeters ? distanceMeters / 1000 : 0)
    const durationSeconds = num(first(row, ['duration', 'elapsedDuration', 'movingDuration']), 0)
    const durationMin = num(first(row, ['durationMin']), durationSeconds ? Math.round(durationSeconds / 60) : 0)
    return {
      id: String(first(row, ['id', 'activityId', 'uuid'], `activity-${index}`)),
      name: String(first(row, ['name', 'activityName', 'title'], 'Garmin Activity')),
      type: String(first(row, ['type', 'activityType', 'activityTypeDTO'], 'Activity')),
      date: String(first(row, ['date', 'startTimeLocal', 'startTimeGMT'], isoDate())).slice(0, 10),
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMin,
      avgHr: num(first(row, ['avgHr', 'averageHR', 'averageHeartRate'])),
      avgPace: String(first(row, ['avgPace', 'averagePace', 'pace'], '-'))
    }
  })
}

export async function getGarminDashboardFromMcp(): Promise<DashboardData> {
  const config = useRuntimeConfig()
  const client = await getMcpClient()
  const tools = await listTools(client)
  const startDate = isoDate(-6)
  const endDate = isoDate()

  const dailyTool = findTool(tools, String(config.garminMcpDailyTool || ''), ['daily'])
    || findTool(tools, undefined, ['health'])
  const activitiesTool = findTool(tools, String(config.garminMcpActivitiesTool || ''), ['activities'])
    || findTool(tools, undefined, ['activity'])

  if (!dailyTool || !activitiesTool) {
    throw new Error(`Could not find required MCP tools. Available tools: ${tools.map(t => t.name).join(', ')}`)
  }

  const [dailyRaw, activitiesRaw] = await Promise.all([
    callToolWithFallbackArgs(client, dailyTool, { startDate, endDate }),
    callToolWithFallbackArgs(client, activitiesTool, { startDate, endDate })
  ])

  const weekly = normalizeDaily(dailyRaw)
  const activities = normalizeActivities(activitiesRaw)
  const fallback = getMockGarminData()
  const safeWeekly = weekly.length ? weekly : fallback.weekly

  return {
    today: safeWeekly[safeWeekly.length - 1],
    weekly: safeWeekly,
    activities: activities.length ? activities : fallback.activities,
    aiSummary: '已改由 Garmin MCP 取得資料。若部分欄位為 0 或空值，請確認 MCP tool 回傳欄位名稱，並在 server/utils/garminMcp.ts 補上對應 mapping。',
    source: 'mcp'
  }
}
