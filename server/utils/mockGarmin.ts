import type { DashboardData } from '~/types/garmin'

export function getMockGarminData(): DashboardData {
  const weekly = [
    { date: '2026-04-18', steps: 8210, calories: 2310, restingHr: 58, stressAvg: 31, bodyBattery: 72, sleepScore: 83 },
    { date: '2026-04-19', steps: 10420, calories: 2520, restingHr: 57, stressAvg: 28, bodyBattery: 78, sleepScore: 88 },
    { date: '2026-04-20', steps: 6900, calories: 2180, restingHr: 60, stressAvg: 42, bodyBattery: 61, sleepScore: 75 },
    { date: '2026-04-21', steps: 11950, calories: 2680, restingHr: 56, stressAvg: 35, bodyBattery: 69, sleepScore: 80 },
    { date: '2026-04-22', steps: 7650, calories: 2240, restingHr: 59, stressAvg: 39, bodyBattery: 66, sleepScore: 78 },
    { date: '2026-04-23', steps: 13320, calories: 2810, restingHr: 55, stressAvg: 26, bodyBattery: 84, sleepScore: 91 },
    { date: '2026-04-24', steps: 5420, calories: 1960, restingHr: 58, stressAvg: 33, bodyBattery: 74, sleepScore: 86 }
  ]

  return {
    today: weekly[weekly.length - 1],
    weekly,
    activities: [
      { id: 'a1', name: 'Morning Run', type: 'Running', date: '2026-04-23', distanceKm: 5.2, durationMin: 32, avgHr: 148, avgPace: '6:09/km' },
      { id: 'a2', name: 'Evening Walk', type: 'Walking', date: '2026-04-21', distanceKm: 3.4, durationMin: 45, avgHr: 96, avgPace: '13:14/km' },
      { id: 'a3', name: 'Zone 2 Run', type: 'Running', date: '2026-04-19', distanceKm: 7.8, durationMin: 52, avgHr: 139, avgPace: '6:40/km' }
    ],
    aiSummary: '本週睡眠與恢復狀態不錯，Body Battery 平均偏高。4/20 壓力較高且步數較低，可觀察是否與工作壓力或睡眠品質有關。',
    source: 'mock'
  }
}
