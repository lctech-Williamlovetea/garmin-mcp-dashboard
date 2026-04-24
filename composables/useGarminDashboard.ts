import type { DashboardData } from '~/types/garmin'

export function useGarminDashboard() {
  return useFetch<DashboardData>('/api/garmin/dashboard', {
    key: 'garmin-dashboard'
  })
}
