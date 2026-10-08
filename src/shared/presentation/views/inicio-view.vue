<script setup>
import { useI18n } from 'vue-i18n'
import WeatherWidget from '@/weatherIntegration/presentation/components/weather-widget.vue'

const { t } = useI18n()
</script>

<template>
  <div class="view-container">
    <div class="welcome-section">
      <h1 class="welcome-title">{{ t('home.welcome') }}</h1>
      <p class="welcome-subtitle">{{ t('home.subtitle') }}</p>
    </div>

    <WeatherWidget />
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}

.welcome-section {
  margin-bottom: 2rem;
}

.view-title,
.welcome-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0 0 0.5rem 0;
}

.view-subtitle,
.welcome-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-text-color);
  opacity: 0.65;
  margin: 0;
}
</style>
