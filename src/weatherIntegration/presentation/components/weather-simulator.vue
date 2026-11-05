<script setup>
import { computed, markRaw, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useWeatherStore } from '@/weatherIntegration/application/weather.store.js'
import { WeatherCondition } from '@/weatherIntegration/domain/model/weather-condition.entity.js'
import WeatherWidget from './weather-widget.vue'

/**
 * Debug panel (VITE_DEBUG_MODE) that simulates weather values to test the alert rules.
 * It works on a copy, so the data loaded from the weather API never changes.
 */
const { t } = useI18n()
const weatherStore = useWeatherStore()

/** Values used when the real weather could not be loaded. */
const BASELINE = {
  id: 0, location: 'Simulación', temperature: 20, humidity: 60, windSpeed: 5,
  precipitation: 0, precipitationProbability: 0, observedAt: new Date().toISOString()
}

const sliders = [
  { key: 'windSpeed', label: 'weather.wind', unit: 'km/h', max: 40, step: 0.5 },
  { key: 'temperature', label: 'weather.temperature', unit: '°C', max: 45, step: 0.5 },
  { key: 'precipitationProbability', label: 'weather.precipitationProbability', unit: '%', max: 100, step: 1 },
  { key: 'precipitation', label: 'weather.precipitation', unit: 'mm', max: 20, step: 0.1 },
  { key: 'humidity', label: 'weather.humidity', unit: '%', max: 100, step: 1 }
]

/** Plain copy of a condition (the entity uses private fields, so it is copied field by field). */
const copyOf = (condition) => ({
  id: condition.id,
  location: condition.location,
  temperature: condition.temperature,
  humidity: condition.humidity,
  windSpeed: condition.windSpeed,
  precipitation: condition.precipitation,
  precipitationProbability: condition.precipitationProbability,
  observedAt: condition.observedAt
})

const realCondition = () => weatherStore.weatherConditions[0] ?? BASELINE

/** Simulated copy that starts with the real values and restarts when they change. */
const simulated = ref(copyOf(BASELINE))
watch(realCondition, condition => { simulated.value = copyOf(condition) }, { immediate: true })

/** Simulated condition with its alerts evaluated by the same rules the app uses. */
const condition = computed(() => {
  const s = simulated.value
  const entity = new WeatherCondition(
    s.id, s.location, s.temperature, s.humidity, s.windSpeed,
    s.precipitation, s.precipitationProbability, s.observedAt, []
  )
  entity.alerts = weatherStore.evaluateConditions(entity)
  return markRaw(entity)
})

const update = (key, value) => {
  simulated.value = { ...simulated.value, [key]: value }
}

const reset = () => {
  simulated.value = copyOf(realCondition())
}
</script>

<template>
  <div class="weather-simulator">
    <WeatherWidget :condition="condition" />

    <details class="simulator-panel">
      <summary>{{ t('weather.simulator.title') }}</summary>
      <small>{{ t('weather.simulator.hint') }}</small>

      <label v-for="slider in sliders" :key="slider.key">
        {{ t(slider.label) }}: <b>{{ simulated[slider.key] }} {{ slider.unit }}</b>
        <input
          type="range"
          min="0"
          :max="slider.max"
          :step="slider.step"
          :value="simulated[slider.key]"
          @input="update(slider.key, $event.target.valueAsNumber)"
        >
      </label>

      <pv-button type="button" size="small" outlined :label="t('weather.simulator.reset')" @click="reset" />
    </details>
  </div>
</template>

<style scoped>
.weather-simulator {
  display: grid;
  gap: 8px;
}

.simulator-panel {
  display: grid;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748B;
}

.simulator-panel summary {
  cursor: pointer;
}

.simulator-panel label {
  display: grid;
}
</style>
