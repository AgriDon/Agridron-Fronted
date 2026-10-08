<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { WeatherUseCases } from '@/weatherIntegration/application/weather-use-cases.js'

const { t } = useI18n()

const conditions = ref([])
const loading = ref(true)
const errorMessage = ref('')

const useCases = new WeatherUseCases()

// Only the first location is shown, same as the original widget.
const condition = computed(() => conditions.value[0] ?? null)

// Alert severity -> PrimeVue Message severity.
const messageSeverity = {
  LOW: 'info',
  MEDIUM: 'warn',
  HIGH: 'error'
}

const severityFor = (alert) => messageSeverity[alert.severity] ?? 'secondary'

// vue-i18n has no datetimeFormats configured, so the "dd/MM/yyyy · HH:mm"
// format of the original widget is built by hand.
const formatObservedAt = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  const pad = (number) => String(number).padStart(2, '0')

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// load() is fired during setup and its promise can resolve after the user
// has already navigated away. Writing to the refs then would re-render an
// unmounted component, which throws "node is null" on the next patch.
let disposed = false

onUnmounted(() => {
  disposed = true
})

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const conditionList = await useCases.listWeatherConditions()

    if (disposed) return

    conditions.value = conditionList
  } catch (error) {
    if (disposed) return

    errorMessage.value = error.message
  } finally {
    if (!disposed) {
      loading.value = false
    }
  }
}

load()
</script>

<template>
  <div class="weather-widget">
    <!-- Loading state -->
    <pv-skeleton v-if="loading" class="weather-skeleton" aria-busy="true" />

    <!-- Error state -->
    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <!-- Empty state -->
    <div v-else-if="!condition" class="weather-empty">
      <i class="pi pi-cloud"></i>
      <p>{{ t('weather.empty') }}</p>
    </div>

    <!-- Weather card -->
    <pv-card v-else class="weather-card">
      <template #title>
        <span class="weather-title">{{ t('weather.title') }}</span>
      </template>

      <template #subtitle>
        <span class="weather-location">{{ condition.location }}</span>
        <small class="weather-observed">
          {{ t('weather.observed') }}: {{ formatObservedAt(condition.observedAt) }}
        </small>
      </template>

      <template #content>
        <p class="weather-temperature" :aria-label="t('weather.temperature')">
          {{ condition.temperature }}°C
        </p>

        <ul class="weather-details">
          <li>{{ t('weather.humidity') }}: <b>{{ condition.humidity }}%</b></li>
          <li>{{ t('weather.wind') }}: <b>{{ condition.windSpeed }} km/h</b></li>
          <li>{{ t('weather.precipitation') }}: <b>{{ condition.precipitation }} mm</b></li>
        </ul>

        <div v-if="condition.alerts.length > 0" class="weather-alerts">
          <pv-message
            v-for="alert in condition.alerts"
            :key="alert.id"
            :severity="severityFor(alert)"
            :closable="false"
          >
            <b>{{ t('weather.severity.' + alert.severity) }}</b>: {{ alert.message }}
          </pv-message>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.weather-widget {
  width: 100%;
  max-width: 360px;
}

.weather-skeleton {
  height: 16rem;
}

/* Colors come from PrimeVue tokens so the card stays readable in both light
   and dark mode. */
.weather-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-primary-color);
}

.weather-location {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.weather-observed {
  display: block;
  margin-top: 0.25rem;
  /* PrimeVue 5 has no --p-text-color-secondary token; dim the themed text
     color instead of hardcoding a grey that breaks on dark surfaces. */
  color: var(--p-text-color);
  opacity: 0.62;
}

.weather-temperature {
  margin: 0 0 0.75rem 0;
  font-size: 3rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.weather-details {
  margin: 0;
  padding: 0;
  list-style: none;
  line-height: 1.8;
  color: var(--p-text-color);
}

.weather-alerts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* :deep() is required: .p-message-text is rendered by PrimeVue, so the
   scoped data attribute of this component never lands on it. */
.weather-alerts :deep(.p-message-text) {
  font-size: 0.875rem;
}

/* Empty state */
.weather-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  color: var(--p-text-color);
  opacity: 0.6;
}

.weather-empty i {
  font-size: 2.5rem;
}

.weather-empty p {
  margin: 0;
  font-weight: 600;
}

@media (max-width: 480px) {
  .weather-widget {
    max-width: none;
  }

  .weather-temperature {
    font-size: 2.5rem;
  }
}
</style>
