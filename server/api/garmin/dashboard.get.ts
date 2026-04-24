import { getGarminDashboardFromMcp } from '~/server/utils/garminMcp'
import { getMockGarminData } from '~/server/utils/mockGarmin'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (query.source === 'mock') {
    return getMockGarminData()
  }

  try {
    return await getGarminDashboardFromMcp()
  } catch (error) {
    console.error('[Garmin MCP] Failed to load Garmin data:', error)

    return {
      ...getMockGarminData(),
      source: 'mock',
      aiSummary: `Garmin MCP 尚未連上，暫時顯示 mock data。請確認 .env 的 GARMIN_MCP_COMMAND / GARMIN_MCP_ARGS。錯誤：${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})
