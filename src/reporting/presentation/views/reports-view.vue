<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { ReportingUseCases } from '@/reporting/application/reporting-use-cases.js'
import MissionHistoryTable from '../components/mission-history-table.vue'
import SuppliesUsagePanel from '../components/supplies-usage-panel.vue'
import SavingsMetricsPanel from '../components/savings-metrics-panel.vue'
import ReportDetailDialog from '../components/report-detail-dialog.vue'

const { t } = useI18n()
const useCases = new ReportingUseCases()

// Active tab state: 'missions' | 'supplies' | 'savings'
const activeTab = ref('missions')

// Data states
const missions = ref([])
const supplies = ref([])
const savingsMetrics = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// Date filter states
// Pre-populate with typical range or allow range selection
const dateRange = ref('01/04/2025 - 30/04/2025')
const startDate = ref(null)
const endDate = ref(null)

// Modal state
const reportModalVisible = ref(false)
const selectedReport = ref(null)

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [missionList, supplyList] = await Promise.all([
      useCases.getMissionHistory(),
      useCases.getSupplyUsage()
    ])

    missions.value = missionList
    supplies.value = supplyList
    savingsMetrics.value = await useCases.getSavingsMetrics(missionList)
  } catch (error) {
    errorMessage.value = error.message || 'Error cargando datos de reportes.'
  } finally {
    loading.value = false
  }
}

// Filtered missions based on date range if applied
const filteredMissions = computed(() => {
  if (!startDate.value && !endDate.value) {
    return missions.value
  }
  return useCases.filterByDateRange(missions.value, startDate.value, endDate.value)
})

const applyDateFilter = () => {
  // If user entered dates in "DD/MM/YYYY - DD/MM/YYYY" format
  if (dateRange.value && dateRange.value.includes('-')) {
    const parts = dateRange.value.split('-').map(p => p.trim())
    if (parts[0] && parts[1]) {
      const parseDate = (str) => {
        const segs = str.split('/')
        if (segs.length === 3) {
          // DD/MM/YYYY -> YYYY-MM-DD
          return new Date(`${segs[2]}-${segs[1]}-${segs[0]}`)
        }
        return new Date(str)
      }

      const s = parseDate(parts[0])
      const e = parseDate(parts[1])
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        startDate.value = s
        endDate.value = e
        return
      }
    }
  }

  // If reset or empty
  if (!dateRange.value) {
    startDate.value = null
    endDate.value = null
  }
}

const onSelectReport = (report) => {
  selectedReport.value = report
  reportModalVisible.value = true
}

onMounted(loadData)
</script>

<template>
  <div class="reports-page-wrapper">
    <div class="reports-container">
      <!-- Title matching mockup: Reportes e Historial -->
      <header class="reports-header">
        <h1 class="page-title">{{ t('reports.title') }}</h1>
      </header>

      <!-- Subnav / Tab switcher buttons matching mockup -->
      <nav class="tabs-nav" aria-label="Tabs de reportes">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'missions' }"
          @click="activeTab = 'missions'"
        >
          {{ t('reports.tabs.missions') }}
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'supplies' }"
          @click="activeTab = 'supplies'"
        >
          {{ t('reports.tabs.supplies') }}
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'savings' }"
          @click="activeTab = 'savings'"
        >
          {{ t('reports.tabs.savings') }}
        </button>
      </nav>

      <!-- Date Filter Bar (Active in Missions & Supplies) -->
      <div v-if="activeTab === 'missions'" class="filter-bar">
        <div class="filter-input-wrapper">
          <input
            v-model="dateRange"
            type="text"
            class="filter-date-input"
            placeholder="01/04/2025 - 30/04/2025"
            @keyup.enter="applyDateFilter"
          />
        </div>

        <button
          type="button"
          class="filter-submit-btn"
          @click="applyDateFilter"
        >
          {{ t('reports.filter.button') }}
        </button>
      </div>

      <!-- Error alert -->
      <pv-message v-if="errorMessage" severity="error" :closable="false" class="mb-4">
        {{ errorMessage }}
      </pv-message>

      <!-- Main Panels according to active tab -->
      <main class="tab-panel-container">
        <!-- Tab 1: Misiones -->
        <section v-if="activeTab === 'missions'" aria-label="Historial de Misiones">
          <mission-history-table
            :missions="filteredMissions"
            :loading="loading"
            @select-report="onSelectReport"
          />
        </section>

        <!-- Tab 2: Uso de insumos -->
        <section v-else-if="activeTab === 'supplies'" aria-label="Uso de Insumos">
          <supplies-usage-panel
            :supplies="supplies"
            :loading="loading"
          />
        </section>

        <!-- Tab 3: Ahorros -->
        <section v-else-if="activeTab === 'savings'" aria-label="Métricas de Ahorros">
          <savings-metrics-panel
            :metrics="savingsMetrics"
            :loading="loading"
          />
        </section>
      </main>

      <!-- Technical Phytosanitary Report Dialog (HU RP-001 & RP-002) -->
      <report-detail-dialog
        v-model:visible="reportModalVisible"
        :report="selectedReport"
      />
    </div>
  </div>
</template>

<style scoped>
.reports-page-wrapper {
  width: 100%;
  padding: 1.5rem 2rem 3rem 2rem;
  background-color: #ffffff;
  min-height: calc(100vh - 76px);
}

.reports-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.reports-header {
  margin-top: 0.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

/* Tabs switcher matching the exact button pills in the image */
.tabs-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  min-width: 150px;
  height: 44px;
  padding: 0 1.5rem;
  border-radius: 8px;
  border: 1.5px solid #1f2937;
  background-color: #ffffff;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tab-btn:hover {
  background-color: #f3f4f6;
}

.tab-btn.active {
  background-color: #169372;
  color: #ffffff;
  border-color: #169372;
}

/* Filter Bar: Input & Pill Filter Button */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.filter-input-wrapper {
  width: 100%;
  max-width: 440px;
}

.filter-date-input {
  width: 100%;
  height: 52px;
  padding: 0 1.25rem;
  border-radius: 9999px;
  border: 1.5px solid #4b5563;
  background-color: #ffffff;
  font-size: 1.2rem;
  font-weight: 500;
  color: #111827;
  outline: none;
  transition: border-color 0.15s ease;
}

.filter-date-input:focus {
  border-color: #169372;
  box-shadow: 0 0 0 3px rgba(22, 147, 114, 0.15);
}

.filter-submit-btn {
  height: 52px;
  padding: 0 2.2rem;
  border-radius: 9999px;
  background-color: #169372;
  color: #ffffff;
  border: none;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.filter-submit-btn:hover {
  background-color: #0f765b;
}

.filter-submit-btn:active {
  transform: scale(0.98);
}

.tab-panel-container {
  width: 100%;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .reports-page-wrapper {
    padding: 1rem 0.75rem 2rem 0.75rem;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.45rem;
  }

  .tabs-nav {
    gap: 0.5rem;
  }

  .tab-btn {
    min-width: 90px;
    flex: 1 1 auto;
    padding: 0 0.75rem;
    font-size: 0.9rem;
    height: 40px;
  }

  .filter-bar {
    gap: 0.65rem;
  }

  .filter-input-wrapper {
    max-width: 100%;
  }

  .filter-date-input {
    height: 44px;
    font-size: 0.95rem;
  }

  .filter-submit-btn {
    height: 44px;
    width: 100%;
    font-size: 1rem;
  }
}
</style>
