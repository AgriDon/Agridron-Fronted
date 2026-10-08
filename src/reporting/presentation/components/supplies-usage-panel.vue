<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  supplies: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const totalApplied = computed(() => {
  return props.supplies.reduce((acc, item) => acc + (item.appliedTotal || 0), 0).toFixed(1)
})

const lowStockCount = computed(() => {
  return props.supplies.filter(item => item.isLowStock()).length
})
</script>

<template>
  <div class="supplies-usage-container">
    <!-- Top KPI cards for chemical inventory -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon-box bg-emerald">
          <i class="pi pi-box"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">{{ t('reports.supplies.totalApplied') }}</span>
          <strong class="kpi-value">{{ totalApplied }} L</strong>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box bg-blue">
          <i class="pi pi-list"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">{{ t('reports.supplies.activeProducts') }}</span>
          <strong class="kpi-value">{{ supplies.length }}</strong>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box" :class="lowStockCount > 0 ? 'bg-amber' : 'bg-slate'">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">{{ t('reports.supplies.lowStockAlerts') }}</span>
          <strong class="kpi-value">{{ lowStockCount }}</strong>
        </div>
      </div>
    </div>

    <!-- Inventory / Balance Table -->
    <div class="table-card">
      <pv-datatable
        :value="supplies"
        :loading="loading"
        responsive-layout="scroll"
        class="custom-supplies-table"
      >
        <pv-column field="name" :header="t('reports.supplies.colProduct')" sortable>
          <template #body="{ data }">
            <strong>{{ data.name }}</strong>
          </template>
        </pv-column>

        <pv-column field="type" :header="t('reports.supplies.colType')">
          <template #body="{ data }">
            <span class="type-badge">{{ data.type }}</span>
          </template>
        </pv-column>

        <pv-column field="appliedTotal" :header="t('reports.supplies.colApplied')" sortable>
          <template #body="{ data }">
            <span>{{ data.appliedTotal }} L</span>
          </template>
        </pv-column>

        <pv-column field="stockLiters" :header="t('reports.supplies.colStock')" sortable>
          <template #body="{ data }">
            <div class="stock-progress-cell">
              <span>{{ data.stockLiters }} L</span>
              <pv-progressbar
                :value="Math.min(100, Math.round((data.stockLiters / (data.minimumStockLiters * 2.5 || 100)) * 100))"
                :show-value="false"
                style="height: 6px; width: 80px;"
              />
            </div>
          </template>
        </pv-column>

        <pv-column :header="t('reports.supplies.colStatus')">
          <template #body="{ data }">
            <pv-tag
              :value="data.isLowStock() ? t('reports.supplies.statusLow') : t('reports.supplies.statusOk')"
              :severity="data.isLowStock() ? 'warn' : 'success'"
            />
          </template>
        </pv-column>
      </pv-datatable>
    </div>
  </div>
</template>

<style scoped>
.supplies-usage-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.kpi-card {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpi-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.bg-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.bg-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.bg-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.bg-slate {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-title {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.kpi-value {
  font-size: 1.5rem;
  color: #111827;
}

.table-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.type-badge {
  text-transform: capitalize;
  font-weight: 500;
  color: #4b5563;
}

.stock-progress-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
