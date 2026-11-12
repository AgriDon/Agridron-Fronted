<script setup>
import { useI18n } from 'vue-i18n'

const { locale, availableLocales } = useI18n()

const onLocaleChange = (newLocale) => {
  if (newLocale) {
    try {
      localStorage.setItem('agridron_locale', newLocale)
    } catch (e) {
      // ignore storage errors
    }
  }
}
</script>

<template>
  <div class="language-switcher-wrapper">
    <pv-select-button
      v-model="locale"
      :options="availableLocales"
      :allow-empty="false"
      aria-label="Selector de idioma / Language selector"
      class="lang-select-button"
      @change="onLocaleChange(locale)"
    >
      <template #option="slotProps">
        <span class="lang-code">{{ slotProps.option.toUpperCase() }}</span>
      </template>
    </pv-select-button>
  </div>
</template>

<style scoped>
.language-switcher-wrapper {
  display: inline-flex;
  align-items: center;
  margin: 0 0.5rem;
}

:deep(.lang-select-button) {
  display: inline-flex;
  gap: 2px;
  background-color: var(--p-content-background, #f1f5f9);
  padding: 2px;
  border-radius: 8px;
}

:deep(.lang-select-button .p-togglebutton) {
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--p-text-muted-color, #64748b);
  transition: all 0.2s ease;
}

:deep(.lang-select-button .p-togglebutton-checked) {
  background: var(--p-primary-color, #10b981) !important;
  color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.lang-code {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
