<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'
import {
  MaintenanceRecordUseCases,
  MaintenanceValidationError
} from '@/flightOperations/application/maintenance-record-use-cases.js'

import { MaintenanceType } from '@/flightOperations/domain/model/maintenance-type.enum.js'
import { DroneStatus } from '@/flightOperations/domain/model/dron-status.enum.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new DroneUseCases()
const maintenanceUseCases = new MaintenanceRecordUseCases()

const drone = ref(null)
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')

const droneId = computed(() => route.params.id)

const maintenanceRecords = ref([])
const loadingRecords = ref(false)

const loadMaintenanceRecords = async () => {
  loadingRecords.value = true
  try {
    maintenanceRecords.value = await maintenanceUseCases.listByDrone(droneId.value)
  } catch {
    maintenanceRecords.value = []
  } finally {
    loadingRecords.value = false
  }
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  notFound.value = false

  try {
    drone.value = await useCases.getDrone(droneId.value)
  } catch (error) {
    if (/not found/i.test(error.message)) {
      notFound.value = true
    } else {
      errorMessage.value = error.message
    }
  } finally {
    loading.value = false
  }
}

const onEdit = () => {
  router.push({ name: 'drones-edit', params: { id: droneId.value } })
}

const showDeleteDialog = ref(false)
const deleting = ref(false)
const deleteError = ref('')

const onDelete = () => {
  deleteError.value = ''
  showDeleteDialog.value = true
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  deleteError.value = ''
}

const confirmDelete = async () => {
  deleting.value = true
  deleteError.value = ''

  try {
    await useCases.deleteDrone(droneId.value)
    cancelDelete()
    await router.push('/drones')
  } catch (error) {
    deleteError.value = error.message
  } finally {
    deleting.value = false
  }
}

const emptyMaintenanceForm = () => ({
  date: new Date(),
  type: MaintenanceType.PREVENTIVE,
  description: '',
  technician: '',
  nextMaintenanceDate: null
})

const maintenanceForm = ref(emptyMaintenanceForm())
const maintenanceErrors = ref({})
const maintenanceSaveError = ref('')
const savingMaintenance = ref(false)
const showMaintenanceDialog = ref(false)

/** Only an available drone or one already in maintenance can receive a maintenance. */
const canRegisterMaintenance = computed(() =>
    [DroneStatus.AVAILABLE, DroneStatus.MAINTENANCE].includes(drone.value?.status)
)

const maintenanceTypes = computed(() =>
    Object.values(MaintenanceType).map(value => ({
      value,
      label: t(`drone.maintenance.type.${value}`)
    }))
)

const openMaintenanceDialog = () => {
  maintenanceForm.value = emptyMaintenanceForm()
  maintenanceErrors.value = {}
  maintenanceSaveError.value = ''
  showMaintenanceDialog.value = true
}

const closeMaintenanceDialog = () => {
  showMaintenanceDialog.value = false
}

const onMaintenanceSubmit = async () => {
  savingMaintenance.value = true
  maintenanceErrors.value = {}
  maintenanceSaveError.value = ''

  try {
    const result = await maintenanceUseCases.registerMaintenance(drone.value, maintenanceForm.value)
    drone.value = result.drone
    await loadMaintenanceRecords()
    closeMaintenanceDialog()
  } catch (error) {
    if (error instanceof MaintenanceValidationError) {
      maintenanceErrors.value = error.errors
    } else {
      maintenanceSaveError.value = error.message
    }
  } finally {
    savingMaintenance.value = false
  }
}


const getBatterySeverity = (level) => {
  if (level > 60) return 'success'
  if (level >= 25) return 'warn'
  return 'danger'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
  } catch {
    return '-'
  }
}

onMounted(load)
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t('drone.information') }}</h1>
    </div>

    <div v-if="loading" aria-busy="true">
      <pv-skeleton height="3rem" class="mb-3"></pv-skeleton>
      <pv-skeleton height="3rem" class="mb-3"></pv-skeleton>
      <pv-skeleton height="12rem"></pv-skeleton>
    </div>

    <pv-message v-else-if="notFound" severity="warn" :closable="false">
      {{ t('drone.notFound') }}
    </pv-message>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-else-if="drone" class="detail-card">
      <div class="detail-header-media">
        <img
            v-if="drone.urlimg"
            :src="drone.urlimg"
            :alt="drone.modelName"
            class="detail-image"
        />
        <div v-else class="detail-image detail-image--empty">
          {{ t('drone.noPhoto') }}
        </div>
      </div>

      <div class="detail-content">
        <h2 class="detail-title">{{ drone.modelName }}</h2>

        <dl class="detail-list">
          <dt>{{ t('drone.serial') }}</dt>
          <dd><strong>{{ drone.serialNumber }}</strong></dd>

          <dt>{{ t('drone.statusLabel') }}</dt>
          <dd>
            <pv-tag :value="t(`drone.status.${drone.status}`)" :severity="drone.status === 'AVAILABLE' ? 'success' : 'info'" />
          </dd>

          <dt>{{ t('drone.capacity') }}</dt>
          <dd>{{ drone.capacity }} L</dd>

          <dt>{{ t('drone.battery') }}</dt>
          <dd class="battery-cell">
            <pv-progressbar
                :value="drone.batteryLevel"
                :show-value="false"
                style="height: 0.6rem; width: 8rem"
            />
            <span :class="`text-${getBatterySeverity(drone.batteryLevel)} font-bold`">
              {{ drone.batteryLevel }}%
            </span>
          </dd>

          <dt>{{ t('drone.flightHours') }}</dt>
          <dd>{{ drone.flightHours }} h</dd>

          <dt>{{ t('drone.nozzleId') }}</dt>
          <dd>{{ drone.nozzleId != null ? drone.nozzleId : '-' }}</dd>

          <dt>{{ t('drone.lastMaintenance') }}</dt>
          <dd>{{ formatDate(drone.lastMaintenanceDate) }}</dd>

          <dt>{{ t('drone.nextMaintenance') }}</dt>
          <dd>{{ formatDate(drone.nextMaintenanceDate) }}</dd>
        </dl>

        <div class="detail-actions">
          <pv-button
              :label="t('drone.button.edit')"
              icon="pi pi-pencil"
              @click="onEdit"
          />
          <pv-button
              :label="t('drone.button.delete')"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="onDelete"
          />
          <pv-button
              v-if="canRegisterMaintenance"
              :label="t('drone.maintenance.registerButton')"
              icon="pi pi-wrench"
              severity="secondary"
              @click="openMaintenanceDialog"
          />
        </div>
      </div>
    </div>

    <section v-if="drone && !loading" class="history-card">
      <h2 class="history-title">{{ t('drone.maintenance.title') }}</h2>
      <p class="history-description">{{ t('drone.maintenance.description') }}</p>

      <pv-datatable
          :value="maintenanceRecords"
          :loading="loadingRecords"
          data-key="id"
          :paginator="maintenanceRecords.length > 5"
          :rows="5"
          responsive-layout="scroll"
      >
        <template #empty>{{ t('drone.maintenance.emptyState') }}</template>

        <pv-column field="date" :header="t('drone.maintenance.record.date')">
          <template #body="{ data }">{{ formatDate(data.date) }}</template>
        </pv-column>
        <pv-column field="type" :header="t('drone.maintenance.record.type')">
          <template #body="{ data }">
            <pv-tag
                :value="t(`drone.maintenance.type.${data.type}`)"
                :severity="data.type === 'corrective' ? 'warn' : 'info'"
            />
          </template>
        </pv-column>
        <pv-column field="description" :header="t('drone.maintenance.record.description')" />
        <pv-column field="technician" :header="t('drone.maintenance.record.technician')" />
      </pv-datatable>
    </section>

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
    <pv-button
        :label="t('parcel.detail.back')"
        icon="pi pi-arrow-left"
        text
        class="back-button"
        @click="router.push('/drones')"
    />
    <pv-dialog v-model:visible="showMaintenanceDialog" modal :style="{ width: '30rem' }">
      <template #header>
        <span class="dialog-title">{{ t('drone.maintenance.registerDialog.title') }}</span>
      </template>

      <div class="form-grid">
        <div class="form-field">
          <label for="mt-date">{{ t('drone.maintenance.registerDialog.form.date') }}</label>
          <pv-datepicker
              v-model="maintenanceForm.date"
              input-id="mt-date"
              date-format="dd/mm/yy"
              show-icon
              :invalid="!!maintenanceErrors.date"
          />
          <small v-if="maintenanceErrors.date" class="text-danger">{{ t(maintenanceErrors.date) }}</small>
        </div>

        <div class="form-field">
          <label for="mt-type">{{ t('drone.maintenance.registerDialog.form.type') }}</label>
          <pv-select
              v-model="maintenanceForm.type"
              input-id="mt-type"
              :options="maintenanceTypes"
              option-label="label"
              option-value="value"
              :invalid="!!maintenanceErrors.type"
          />
          <small v-if="maintenanceErrors.type" class="text-danger">{{ t(maintenanceErrors.type) }}</small>
        </div>

        <div class="form-field">
          <label for="mt-description">{{ t('drone.maintenance.registerDialog.form.description') }}</label>
          <pv-input-text id="mt-description" v-model="maintenanceForm.description" />
        </div>

        <div class="form-field">
          <label for="mt-technician">{{ t('drone.maintenance.registerDialog.form.technician') }}</label>
          <pv-input-text
              id="mt-technician"
              v-model="maintenanceForm.technician"
              :invalid="!!maintenanceErrors.technician"
          />
          <small v-if="maintenanceErrors.technician" class="text-danger">{{ t(maintenanceErrors.technician) }}</small>
        </div>

        <div class="form-field">
          <label for="mt-next">{{ t('drone.maintenance.registerDialog.form.nextMaintenanceDate') }}</label>
          <pv-datepicker
              v-model="maintenanceForm.nextMaintenanceDate"
              input-id="mt-next"
              date-format="dd/mm/yy"
              show-icon
              :min-date="maintenanceForm.date || undefined"
              :invalid="!!maintenanceErrors.nextMaintenanceDate"
          />
          <small v-if="maintenanceErrors.nextMaintenanceDate" class="text-danger">
            {{ t(maintenanceErrors.nextMaintenanceDate) }}
          </small>
        </div>
      </div>

      <pv-message v-if="maintenanceSaveError" severity="error" :closable="false">
        {{ maintenanceSaveError }}
      </pv-message>

      <template #footer>
        <pv-button
            :label="t('farm.cancel')"
            severity="secondary"
            text
            @click="closeMaintenanceDialog"
        />
        <pv-button
            :label="t('drone.maintenance.registerDialog.save')"
            icon="pi pi-check"
            :loading="savingMaintenance"
            @click="onMaintenanceSubmit"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
  max-width: 48rem;
}

.header-section {
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0;
}

.detail-card {
  display: flex;
  flex-direction: column;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
}

.detail-header-media {
  width: 100%;
  max-height: 18rem;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 18rem;
  object-fit: cover;
  display: block;
}

.detail-image--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-form-field-background, #f1f5f9);
  color: var(--p-text-color);
  opacity: 0.6;
}

.detail-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--p-text-color);
}

.detail-list {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: 0.75rem 1rem;
  margin: 0;
  align-items: center;
}

.detail-list dt {
  font-weight: 600;
  color: var(--p-text-color);
  opacity: 0.8;
}

.detail-list dd {
  margin: 0;
  color: var(--p-text-color);
}

.battery-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.text-success { color: #16a34a; }
.text-warn { color: #d97706; }
.text-danger { color: #dc2626; }

.detail-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-content-border-color, #e2e8f0);
}

.history-card {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  border-radius: 12px;
}

.history-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--p-text-color);
}

.history-description {
  margin: 0.25rem 0 1rem;
  color: var(--p-text-color);
  opacity: 0.7;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-weight: 600;
}

.back-button {
  margin-top: 1.5rem;
}

@media (max-width: 560px) {
  .detail-list {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .detail-list dt {
    margin-top: 0.5rem;
  }
}
</style>