<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  missions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-report'])

const { t } = useI18n()

// Selected row for highlighting (as seen in the mockup with M2-002)
const selectedMissionId = ref(null)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => Math.ceil(props.missions.length / pageSize.value) || 1)

const paginatedMissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.missions.slice(start, start + pageSize.value)
})

const selectRow = (mission) => {
  selectedMissionId.value = mission.id
}

const openReport = (mission) => {
  selectedMissionId.value = mission.id
  emit('select-report', mission)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}
</script>

<template>
  <div class="mission-history-wrapper">
    <!-- Loading skeleton -->
    <div v-if="loading" class="table-loading">
      <pv-skeleton height="320px" border-radius="12px" />
    </div>

    <!-- Empty state -->
    <div v-else-if="missions.length === 0" class="table-empty">
      <i class="pi pi-inbox empty-icon"></i>
      <p>{{ t('reports.empty') }}</p>
    </div>

    <!-- Data Table directly styled to match the mockup -->
    <div v-else class="table-container">
      <table class="custom-table" role="table">
        <thead>
          <tr>
            <th class="col-id">{{ t('reports.table.id') }}</th>
            <th class="col-parcel">{{ t('reports.table.parcel') }}</th>
            <th class="col-date">{{ t('reports.table.date') }}</th>
            <th class="col-status">{{ t('reports.table.status') }}</th>
            <th class="col-area">{{ t('reports.table.area') }}</th>
            <th class="col-actions">{{ t('reports.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(mission, index) in paginatedMissions"
            :key="mission.id"
            :class="{
              'row-highlighted': selectedMissionId === mission.id || (!selectedMissionId && index === 1)
            }"
            @click="selectRow(mission)"
          >
            <td class="col-id font-mono">{{ mission.code }}</td>
            <td class="col-parcel font-medium">{{ mission.parcelName }}</td>
            <td class="col-date">{{ formatDate(mission.date) }}</td>
            <td class="col-status">
              <span
                class="status-pill"
                :class="{
                  'status-completed': mission.status === 'Completado' || mission.status === 'COMPLETED',
                  'status-active': mission.status === 'En curso' || mission.status === 'IN_PROGRESS',
                  'status-scheduled': mission.status === 'Programado' || mission.status === 'Programada' || mission.status === 'PLANNED'
                }"
              >
                {{ mission.status }}
              </span>
            </td>
            <td class="col-area">{{ mission.area }}</td>
            <td class="col-actions">
              <pv-button
                icon="pi pi-file-pdf"
                text
                rounded
                severity="success"
                :title="t('reports.table.viewReport')"
                aria-label="Ver reporte"
                @click.stop="openReport(mission)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom-right Paginator matching mockup: [ 1 ] [ 2 ] [ Next > ] -->
      <div class="custom-pagination">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          v-if="currentPage < totalPages"
          type="button"
          class="page-btn next-btn"
          @click="goToPage(currentPage + 1)"
        >
          {{ t('reports.pagination.next') }} &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mission-history-wrapper {
  width: 100%;
}

.table-container {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.96rem;
  color: #1f2937;
}

.custom-table thead tr {
  background-color: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
}

.custom-table th {
  padding: 1.1rem 1.4rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.01em;
}

.custom-table td {
  padding: 1rem 1.4rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.15s ease;
}

.custom-table tbody tr {
  cursor: pointer;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

/* Mockup Highlight: row 2 / selected row */
.custom-table tbody tr.row-highlighted {
  background-color: #6ee7b7 !important;
  color: #064e3b;
  font-weight: 600;
}

.custom-table tbody tr.row-highlighted td {
  border-bottom-color: #34d399;
}

.col-id {
  width: 14%;
  font-weight: 600;
}

.col-parcel {
  width: 26%;
}

.col-date {
  width: 16%;
}

.col-status {
  width: 18%;
}

.col-area {
  width: 12%;
  font-weight: 600;
}

.col-actions {
  width: 14%;
  text-align: center;
}

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
}

.status-completed {
  color: #065f46;
}

.status-active {
  color: #0369a1;
}

.status-scheduled {
  color: #854d0e;
}

.custom-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.4rem;
  background-color: #ffffff;
}

.page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.page-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn.active {
  background-color: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

.next-btn {
  padding: 0 1rem;
}

.table-empty {
  text-align: center;
  padding: 3rem 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
  color: #6b7280;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  color: #9ca3af;
}
</style>
