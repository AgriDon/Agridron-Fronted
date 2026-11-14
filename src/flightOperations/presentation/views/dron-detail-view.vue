<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'
import { IncidentUseCases } from '@/flightOperations/application/incident-use-cases.js'
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
const incidentUseCases = new IncidentUseCases()

const drone = ref(null)
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')

const droneId = computed(() => route.params.id)

// ---- Maintenance history (DR-005) ----
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

// ---- Active failure (DR-006) ----
const activeFailure = ref(null)

/** Shows the last reported failure only while the drone is out of service. */
const loadActiveFailure = async () => {
  activeFailure.value = null
  if (drone.value?.status !== DroneStatus.OUT_OF_SERVICE) return
  try {
    activeFailure.value = await incidentUseCases.getLatestDroneFailure(drone.value.id)
  } catch {
    activeFailure.value = null
  }
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  notFound.value = false

  try {
    drone.value = await useCases.getDrone(droneId.value)
    await loadMaintenanceRecords()
    await loadActiveFailure()
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

// ---- Report failure (DR-006) ----
const showFailureDialog = ref(false)
const failureDescription = ref('')
const failureError = ref('')
const reportingFailure = ref(false)

const canReportFailure = computed(() => DroneUseCases.canReportFailure(drone.value))

/** Warn when the failure leaves a mission without a usable drone. */
const hasMissionInProgress = computed(() =>
    [DroneStatus.ASSIGNED, DroneStatus.PAUSED].includes(drone.value?.status)
)

const openFailureDialog = () => {
  failureDescription.value = ''
  failureError.value = ''
  showFailureDialog.value = true
}

const confirmReportFailure = async () => {
  reportingFailure.value = true
  failureError.value = ''

  try {
    drone.value = await useCases.reportFailure(drone.value, failureDescription.value)
    await loadActiveFailure()
    showFailureDialog.value = false
  } catch (error) {
    failureError.value = error.message.startsWith('drone.') ? t(error.message) : error.message
  } finally {
    reportingFailure.value = false
  }
}

// ---- Send to maintenance (DR-005) ----
const showSendDialog = ref(false)
const sending = ref(false)
const sendError = ref('')

/** Only an available drone can be taken out of operation for maintenance. */
const canSendToMaintenance = computed(() => drone.value?.status === DroneStatus.AVAILABLE)

const openSendDialog = () => {
  sendError.value = ''
  showSendDialog.value = true
}

const confirmSendToMaintenance = async () => {
  sending.value = true
  sendError.value = ''

  try {
    drone.value = await useCases.sendToMaintenance(drone.value)
    showSendDialog.value = false
  } catch (error) {
    sendError.value = error.message.startsWith('drone.') ? t(error.message) : error.message
  } finally {
    sending.value = false
  }
}

// ---- Register maintenance dialog (DR-005) ----
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

/** A maintenance is registered when the drone leaves the workshop: planned (MAINTENANCE) or repair (OUT_OF_SERVICE). */
const canRegisterMaintenance = computed(() =>
    [DroneStatus.MAINTENANCE, DroneStatus.OUT_OF_SERVICE].includes(drone.value?.status)
)

/** A drone with a reported failure only accepts a corrective maintenance. */
const isRepair = computed(() => drone.value?.status === DroneStatus.OUT_OF_SERVICE)

const maintenanceTypes = computed(() =>
    Object.values(MaintenanceType).map(value => ({
      value,
      label: t(`drone.maintenance.type.${value}`)
    }))
)

const openMaintenanceDialog = () => {
  maintenanceForm.value = emptyMaintenanceForm()
  if (isRepair.value) {
    maintenanceForm.value.type = MaintenanceType.CORRECTIVE
    maintenanceForm.value.description = activeFailure.value?.description || ''
  }
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
    await loadActiveFailure()
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

/** Tag color for each drone status. */
const STATUS_SEVERITY = {
  [DroneStatus.AVAILABLE]: 'success',
  [DroneStatus.ASSIGNED]: 'info',
  [DroneStatus.IN_FLIGHT]: 'contrast',
  [DroneStatus.PAUSED]: 'warn',
  [DroneStatus.MAINTENANCE]: 'warn',
  [DroneStatus.OUT_OF_SERVICE]: 'danger'
}

const getStatusSeverity = (status) => STATUS_SEVERITY[status] || 'secondary'

const getBatterySeverity = (level) => {
  if (level > 60) return 'success'
  if (level >= 25) return 'warn'
  return 'danger'
}

/**
 * Formats a date in local time.
 * - "YYYY-MM-DD" (date only) is built as a local date: new Date("YYYY-MM-DD") would be UTC
 *   and show the previous day in Lima.
 * - Values with time ("...T23:17:19Z") are real instants, so they are converted normally.
 * @param {string|Date|null} value
 * @returns {string}
 */
const formatDate = (value) => {
  if (!value) return '-'
  if (value instanceof Date || String(value).includes('T')) {
    const date = new Date(value)
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
  }
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return '-'
  return new Date(y, m - 1, d).toLocaleDateString()
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
            <pv-tag :value="t(`drone.status.${drone.status}`)" :severity="getStatusSeverity(drone.status)" />
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

        <pv-message v-if="activeFailure" severity="error" :closable="false" class="failure-banner">
          <strong>⚠ {{ t('drone.failure.banner') }} · {{ formatDate(activeFailure.occurredAt) }}</strong>
          <div>{{ activeFailure.description }}</div>
        </pv-message>

        <div class="detail-actions">
          <div class="detail-actions__main">
            <pv-button
                v-if="canSendToMaintenance"
                :label="t('drone.maintenance.sendButton')"
                icon="pi pi-cog"
                severity="warn"
                outlined
                @click="openSendDialog"
            />
            <pv-button
                v-if="canRegisterMaintenance"
                :label="t('drone.maintenance.registerButton')"
                icon="pi pi-wrench"
                @click="openMaintenanceDialog"
            />
            <pv-button
                v-if="canReportFailure"
                :label="t('drone.failure.reportButton')"
                icon="pi pi-exclamation-triangle"
                severity="danger"
                outlined
                @click="openFailureDialog"
            />
          </div>

          <div class="detail-actions__manage">
            <pv-button
                icon="pi pi-pencil"
                rounded
                :aria-label="t('drone.button.edit')"
                v-tooltip.top="t('drone.button.edit')"
                @click="onEdit"
            />
            <pv-button
                icon="pi pi-trash"
                severity="danger"
                rounded
                :aria-label="t('drone.button.delete')"
                v-tooltip.top="t('drone.button.delete')"
                @click="onDelete"
            />
          </div>
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
    <pv-dialog v-model:visible="showFailureDialog" modal :style="{ width: '30rem' }">
      <template #header>
        <span class="dialog-title">{{ t('drone.failure.dialog.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('drone.failure.dialog.hint') }}</p>

      <pv-message v-if="hasMissionInProgress" severity="warn" :closable="false" class="mb-3">
        {{ t('drone.failure.dialog.missionWarning') }}
      </pv-message>

      <div class="form-field">
        <label for="failure-description">{{ t('drone.failure.dialog.description') }}</label>
        <pv-input-text
            id="failure-description"
            v-model="failureDescription"
            :placeholder="t('drone.failure.dialog.placeholder')"
            :invalid="!!failureError"
        />
        <small v-if="failureError" class="text-danger">{{ failureError }}</small>
      </div>

      <template #footer>
        <pv-button
            :label="t('farm.cancel')"
            severity="secondary"
            text
            @click="showFailureDialog = false"
        />
        <pv-button
            :label="t('drone.failure.dialog.confirm')"
            icon="pi pi-exclamation-triangle"
            severity="danger"
            :loading="reportingFailure"
            @click="confirmReportFailure"
        />
      </template>
    </pv-dialog>

    <pv-dialog v-model:visible="showSendDialog" modal :style="{ width: '26rem' }">
      <template #header>
        <span class="dialog-title">{{ t('drone.maintenance.sendDialog.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('drone.maintenance.sendDialog.message') }}</p>

      <pv-message v-if="sendError" severity="error" :closable="false">
        {{ sendError }}
      </pv-message>

      <template #footer>
        <pv-button
            :label="t('farm.cancel')"
            severity="secondary"
            text
            @click="showSendDialog = false"
        />
        <pv-button
            :label="t('drone.maintenance.sendDialog.confirm')"
            icon="pi pi-cog"
            severity="warn"
            :loading="sending"
            @click="confirmSendToMaintenance"
        />
      </template>
    </pv-dialog>

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
              :disabled="isRepair"
              :invalid="!!maintenanceErrors.type"
          />
          <small v-if="isRepair" class="field-hint">{{ t('drone.failure.correctiveOnly') }}</small>
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
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

.detail-actions__main,
.detail-actions__manage {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-actions__manage {
  margin-left: auto;
}

.failure-banner div {
  margin-top: 0.25rem;
}

.field-hint {
  opacity: 0.7;
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