<script setup lang="ts">
const { data, pending, error } = await useGarminDashboard()

const labels = computed(() => data.value?.weekly.map(d => d.date.slice(5)) ?? [])
const steps = computed(() => data.value?.weekly.map(d => d.steps) ?? [])
const sleep = computed(() => data.value?.weekly.map(d => d.sleepScore) ?? [])
</script>

<template>
  <main class="min-h-screen px-5 py-6 md:px-10">
    <section class="mx-auto max-w-7xl">
      <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Garmin MCP Dashboard</h1>
          <p class="mt-2 text-slate-400">Health, activity, sleep and recovery overview.</p>
        </div>
        <div v-if="data" class="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
          Source: {{ data.source }}
        </div>
      </div>

      <div v-if="pending">Loading...</div>
      <div v-else-if="error" class="card p-5 text-red-300">Failed to load dashboard.</div>
      <template v-else-if="data">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetricCard label="Steps" :value="data.today.steps.toLocaleString()" />
          <MetricCard label="Sleep Score" :value="data.today.sleepScore" />
          <MetricCard label="Resting HR" :value="data.today.restingHr" suffix="bpm" />
          <MetricCard label="Stress Avg" :value="data.today.stressAvg" />
          <MetricCard label="Body Battery" :value="data.today.bodyBattery" />
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-2">
          <LineChart title="Weekly Steps" :labels="labels" :values="steps" />
          <LineChart title="Sleep Score" :labels="labels" :values="sleep" />
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-3">
          <section class="card p-5 lg:col-span-2">
            <h2 class="mb-4 text-lg font-semibold">Recent Activities</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="text-slate-400">
                  <tr>
                    <th class="pb-3">Date</th><th class="pb-3">Activity</th><th class="pb-3">Distance</th><th class="pb-3">Duration</th><th class="pb-3">Avg HR</th><th class="pb-3">Pace</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="activity in data.activities" :key="activity.id" class="border-t border-slate-800">
                    <td class="py-3 text-slate-400">{{ activity.date }}</td>
                    <td class="py-3">{{ activity.name }} <span class="text-slate-500">/ {{ activity.type }}</span></td>
                    <td class="py-3">{{ activity.distanceKm }} km</td>
                    <td class="py-3">{{ activity.durationMin }} min</td>
                    <td class="py-3">{{ activity.avgHr }}</td>
                    <td class="py-3">{{ activity.avgPace }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="card p-5">
            <h2 class="mb-3 text-lg font-semibold">AI Summary</h2>
            <p class="leading-7 text-slate-300">{{ data.aiSummary }}</p>
          </section>
        </div>
      </template>
    </section>
  </main>
</template>
