<script setup lang="ts">
import * as echarts from 'echarts'
import { useElementSize } from '@vueuse/core'

const props = defineProps<{
  title: string
  labels: string[]
  values: number[]
}>()

const el = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const { width, height } = useElementSize(el)

function render() {
  if (!el.value) return
  chart ||= echarts.init(el.value)
  chart.setOption({
    backgroundColor: 'transparent',
    title: { text: props.title, textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 16, top: 48, bottom: 28 },
    xAxis: { type: 'category', data: props.labels, axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.15)' } } },
    series: [{ type: 'line', smooth: true, data: props.values, areaStyle: {} }]
  })
}

onMounted(render)
watch([() => props.values, width, height], () => nextTick(() => { render(); chart?.resize() }), { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div ref="el" class="card h-72 p-4" />
</template>
