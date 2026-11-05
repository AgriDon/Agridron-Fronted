<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useWeatherStore } from '@/weatherIntegration/application/weather.store.js'

/**
 * Weather card. It shows the first loaded condition, or the one received
 * in the "condition" prop (used by the weather simulator).
 * The data is loaded by the view that hosts it (store.loadWeatherConditions()).
 */
const props = defineProps({
  /** Optional condition shown instead of the loaded one. */
  condition: { type: Object, default: null }
})

const { t } = useI18n()
const weatherStore = useWeatherStore()

const shownCondition = computed(() => props.condition ?? weatherStore.weatherConditions[0] ?? null)

// vue-i18n has no datetimeFormats configured, so the "dd/MM/yyyy · HH:mm"
// format of the original widget is built by hand.
const formatObservedAt = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  const pad = (number) => String(number).padStart(2, '0')

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<template>
  <div class="weather-widget">
    <!-- Loading state (only for the real data, the simulator always has a condition) -->
    <pv-skeleton v-if="!props.condition && weatherStore.loading" class="weather-skeleton" aria-busy="true" />

    <!-- Weather card -->
    <article v-else-if="shownCondition" class="weather-box">
      <h3 class="weather-title">{{ t('weather.title') }}</h3>

      <p class="weather-location">
        {{ shownCondition.location }}
        <small v-if="!props.condition && weatherStore.usingDefaultLocation">({{ t('weather.referenceLocation') }})</small>
      </p>
      <small class="weather-observed">{{ t('weather.observed') }}: {{ formatObservedAt(shownCondition.observedAt) }}</small>

      <div class="temp-row">
        <i class="pi pi-cloud weather-icon"></i>
        <span class="temp-value" :aria-label="t('weather.temperature')">{{ shownCondition.temperature }}° C</span>
      </div>

      <ul class="weather-specs">
        <li>{{ t('weather.humidity') }}: <b>{{ shownCondition.humidity }}%</b></li>
        <li>{{ t('weather.wind') }}: <b>{{ shownCondition.windSpeed }} km/h</b></li>
        <li>{{ t('weather.precipitation') }}: <b>{{ shownCondition.precipitation }} mm</b></li>
        <li>{{ t('weather.precipitationProbability') }}: <b>{{ shownCondition.precipitationProbability }}%</b></li>
      </ul>

      <div v-if="weatherStore.isSuitable(shownCondition)" class="weather-note favorable">
        {{ t('weather.favorable') }}
      </div>

      <div
        v-for="alert in shownCondition.alerts"
        :key="alert.id"
        class="weather-note"
        :class="alert.severity.toLowerCase()"
      >
        <b>{{ t('weather.severity.' + alert.severity) }}</b>: {{ t(alert.message) }}
      </div>

      <small class="weather-source">
        {{ t('weather.source') }}: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>
      </small>
    </article>

    <!-- Empty state (no data or the API failed) -->
    <div v-else class="weather-box weather-empty">
      <i class="pi pi-cloud"></i>
      <p>{{ t('weather.empty') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Same look as the weather box of the Home mockup. */
.weather-widget {
  width: 100%;
}

.weather-skeleton {
  height: 16rem;
}

.weather-box {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.25rem;
  border-radius: 8px;
  background: #19906d;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.weather-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.weather-location {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.weather-observed,
.weather-source,
.weather-location small {
  opacity: 0.85;
  font-weight: 400;
}

.weather-source a {
  color: #fef08a;
}

.temp-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
}

.weather-icon {
  font-size: 2.2rem;
  color: #fef08a;
}

.temp-value {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.weather-specs {
  margin: 0 0 0.5rem 0;
  padding: 0;
  list-style: none;
  line-height: 1.7;
  font-size: 0.9rem;
}

/* Favorable message and alerts: light boxes so the text stays readable on the green card. */
.weather-note {
  margin-bottom: 0.5rem;
  padding: 0.6rem;
  border-left: 4px solid;
  border-radius: 6px;
  font-size: 0.85rem;
}

.favorable { background: #E8F6F1; color: #1B463C; }
.low { background: #EFF4FF; color: #1E3A8A; }
.medium { background: #FFF7E6; color: #B45309; }
.high { background: #FEECEC; color: #B91C1C; }

.weather-empty {
  align-items: center;
  padding: 2rem 1rem;
}

.weather-empty i {
  font-size: 2.5rem;
}

.weather-empty p {
  margin: 0;
  font-weight: 600;
}
</style>
