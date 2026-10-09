<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import DroneList from '@/flightOperations/presentation/components/dron-list.vue'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'
import { DroneStatus } from '@/flightOperations/domain/model/dron-status.enum.js'
import { CAPACITY_RANGES } from '@/flightOperations/presentation/components/capacity-ranges.js'

const { t } = useI18n()
const router = useRouter()

const useCases = new DroneUseCases()

// ---- Filters (passed to the list as props) ----
const selectedStatus = ref(null)
const selectedCapacity = ref(null)

const statusOptions = Object.values(DroneStatus)

const capacityOptions = computed(() => [
  { label: t('drone.capacityRange.all'), value: null },
  ...CAPACITY_RANGES.map((range) => ({
    label: t(range.labelKey),
    value: range.key
  }))
])

// Clicking the active status again clears the filter.
const toggleStatus = (status) => {
  selectedStatus.value = selectedStatus.value === status ? null : status
}

// ---- Delete flow ----
const showDeleteDialog = ref(false)
const droneIdToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref('')

// Changing the key remounts the list so it reloads after a delete.
const listKey = ref(0)

const onDelete = (id) => {
  droneIdToDelete.value = id
  deleteError.value = ''
  showDeleteDialog.value = true
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  droneIdToDelete.value = null
  deleteError.value = ''
}

const confirmDelete = async () => {
  deleting.value = true
  deleteError.value = ''

  try {
    await useCases.deleteDrone(droneIdToDelete.value)
    cancelDelete()
    listKey.value++
  } catch (error) {
    deleteError.value = error.message
  } finally {
    deleting.value = false
  }
}

// ---- Navigation ----
const onCreate = () => {
  router.push({ name: 'drones-edit' })
}

const onEdit = (id) => {
  router.push({ name: 'drones-edit', params: { id } })
}

const onView = (id) => {
  router.push({ name: 'drone-detail', params: { id } })
}
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <div>
        <h1 class="view-title">{{ t('drone.title') }}</h1>
        <p class="view-subtitle">{{ t('drone.subtitle') }}</p>
      </div>

      <pv-button
          :label="t('drone.newDrone')"
          icon="pi pi-plus-circle"
          @click="onCreate"
      />
    </div>

    <div class="filters">
      <div class="filter-group">
        <span class="filter-label">{{ t('drone.statusLabel') }}</span>
        <div class="filter-buttons">
          <pv-button
              v-for="status in statusOptions"
              :key="status"
              :label="t(`drone.status.${status}`)"
              size="small"
              :severity="selectedStatus === status ? 'primary' : 'secondary'"
              :outlined="selectedStatus !== status"
              @click="toggleStatus(status)"
          />
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">{{ t('drone.capacity') }}</span>
        <pv-select
            v-model="selectedCapacity"
            :options="capacityOptions"
            option-label="label"
            option-value="value"
            class="filter-select"
        />
      </div>
    </div>

    <DroneList
        :key="listKey"
        :status="selectedStatus"
        :capacity="selectedCapacity"
        @view="onView"
        @edit="onEdit"
        @delete="onDelete"
    />

    <pv-dialog v-model:visible="showDeleteDialog" modal :style="{ width: '26rem' }">
      <template #header>
        <span class="dialog-title">{{ t('drone.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('drone.delete-confirm') }}</p>

      <pv-message v-if="deleteError" severity="error" :closable="false">
        {{ deleteError }}
      </pv-message>

      <template #footer>
        <pv-button
            :label="t('farm.cancel')"
            severity="secondary"
            text
            @click="cancelDelete"
        />
        <pv-button
            :label="t('drone.button.delete')"
            icon="pi pi-trash"
            severity="danger"
            :loading="deleting"
            @click="confirmDelete"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-select {
  min-width: 12rem;
}
</style>
