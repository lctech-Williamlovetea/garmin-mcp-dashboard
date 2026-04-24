<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  suffix?: string
}>()
</script>

<template>
  <div class="card p-5">
    <div class="metric-label">{{ label }}</div>
    <div class="mt-2 flex items-end gap-1">
      <span class="metric-value">{{ value }}</span>
      <span v-if="suffix" class="mb-1 text-sm text-slate-400">{{ suffix }}</span>
    </div>
  </div>
</template>
