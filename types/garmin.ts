export type DailyMetric = {
  date: string
  steps: number
  calories: number
  restingHr: number
  stressAvg: number
  bodyBattery: number
  sleepScore: number
}

export type Activity = {
  id: string
  name: string
  type: string
  date: string
  distanceKm: number
  durationMin: number
  avgHr: number
  avgPace: string
}

export type DashboardData = {
  today: DailyMetric
  weekly: DailyMetric[]
  activities: Activity[]
  aiSummary: string
  source: 'mock' | 'mcp'
}
