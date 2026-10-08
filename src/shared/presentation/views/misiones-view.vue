<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t('missions.title') }}</h1>
      <p class="view-subtitle">{{ t('missions.subtitle') }}</p>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}

.header-section {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0 0 0.5rem 0;
}

.view-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-text-color);
  opacity: 0.65;
  margin: 0;
}
</style>
