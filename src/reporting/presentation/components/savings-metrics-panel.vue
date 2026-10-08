<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  metrics: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="savings-container">
    <div v-if="loading" class="savings-loading">
      <pv-skeleton height="260px" border-radius="12px" />
    </div>

    <div v-else-if="metrics" class="savings-content">
      <!-- Top Big KPI Cards -->
      <div class="metrics-grid">
        <div class="metric-card bg-water">
          <div class="metric-header">
            <span class="metric-label">{{ t('reports.savings.waterSaved') }}</span>
            <i class="pi pi-tint metric-icon"></i>
          </div>
          <div class="metric-number">
            {{ metrics.waterSavedLiters.toLocaleString() }} L
          </div>
          <div class="metric-foot">
            <span class="highlight-tag">
              <i class="pi pi-arrow-down"></i> {{ metrics.waterSavingsPercent }}%
            </span>
            <span class="foot-text">{{ t('reports.savings.vsTraditional') }}</span>
          </div>
        </div>

        <div class="metric-card bg-chemical">
          <div class="metric-header">
            <span class="metric-label">{{ t('reports.savings.chemicalOptimized') }}</span>
            <i class="pi pi-shield metric-icon"></i>
          </div>
          <div class="metric-number">
            {{ metrics.chemicalSavedLiters }} L
          </div>
          <div class="metric-foot">
            <span class="highlight-tag">
              <i class="pi pi-arrow-down"></i> {{ metrics.chemicalSavingsPercent }}%
            </span>
            <span class="foot-text">{{ t('reports.savings.lessDrift') }}</span>
          </div>
        </div>

        <div class="metric-card bg-economic">
          <div class="metric-header">
            <span class="metric-label">{{ t('reports.savings.economicSaved') }}</span>
            <i class="pi pi-dollar metric-icon"></i>
          </div>
          <div class="metric-number">
            ${{ metrics.costSavedUsd.toLocaleString() }} USD
          </div>
          <div class="metric-foot">
            <span class="foot-text">{{ t('reports.savings.laborCostSaved') }}</span>
          </div>
        </div>

        <div class="metric-card bg-time">
          <div class="metric-header">
            <span class="metric-label">{{ t('reports.savings.efficiencyTime') }}</span>
            <i class="pi pi-clock metric-icon"></i>
          </div>
          <div class="metric-number">
            {{ metrics.averageTimePerHectareMin }} min/ha
          </div>
          <div class="metric-foot">
            <span class="foot-text">{{ t('reports.savings.vsManualTime') }}</span>
          </div>
        </div>
      </div>

      <!-- Comparative efficiency section (HU RP-006) -->
      <div class="efficiency-comparison-card">
        <h3 class="comparison-title">
          <i class="pi pi-chart-bar"></i>
          {{ t('reports.savings.comparisonTitle') }}
        </h3>
        <p class="comparison-desc">
          {{ t('reports.savings.comparisonSubtitle') }}
        </p>

        <div class="comparison-bars">
          <!-- Water usage comparison -->
          <div class="comparison-row">
            <div class="row-meta">
              <strong>{{ t('reports.savings.waterPerHa') }}</strong>
              <span>AgriDron (15 L/ha) vs {{ t('reports.savings.traditionalTractor') }} (200 L/ha)</span>
            </div>
            <div class="bar-dual">
              <div class="bar-drone" style="width: 12%;">
                <span>15 L</span>
              </div>
              <div class="bar-trad" style="width: 88%;">
                <span>200 L</span>
              </div>
            </div>
          </div>

          <!-- Time per ha comparison -->
          <div class="comparison-row">
            <div class="row-meta">
              <strong>{{ t('reports.savings.timePerHa') }}</strong>
              <span>AgriDron (14 min/ha) vs {{ t('reports.savings.traditionalManual') }} (180 min/ha)</span>
            </div>
            <div class="bar-dual">
              <div class="bar-drone" style="width: 10%;">
                <span>14 min</span>
              </div>
              <div class="bar-trad" style="width: 90%;">
                <span>180 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.savings-container {
  width: 100%;
}

.savings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background: #ffffff;
  padding: 1.4rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #4b5563;
}

.metric-icon {
  font-size: 1.2rem;
  color: #10b981;
}

.metric-number {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
}

.metric-foot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
}

.highlight-tag {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.foot-text {
  color: #6b7280;
}

.efficiency-comparison-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.comparison-title {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparison-desc {
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.comparison-bars {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.comparison-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.row-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  color: #374151;
}

.bar-dual {
  display: flex;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffffff;
}

.bar-drone {
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  white-space: nowrap;
}

.bar-trad {
  background: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  white-space: nowrap;
}
</style>
