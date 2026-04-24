export default defineNuxtConfig({
  compatibilityDate: '2025-08-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    garminMcpCommand: process.env.GARMIN_MCP_COMMAND || '',
    garminMcpArgs: process.env.GARMIN_MCP_ARGS || '',
    public: {
      appName: 'Garmin MCP Dashboard'
    }
  }
})
