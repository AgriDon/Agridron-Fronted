<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { DroneUseCases, DroneValidationError } from '@/flightOperations/application/dron-use-cases.js'
import { DroneStatus } from '@/flightOperations/domain/model/dron-status.enum.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new DroneUseCases()

const form = ref({
  serialNumber: '',
  model: '',
  capacity: '',
  nozzleId: '',
  urlimg: '',
  status: DroneStatus.AVAILABLE,
  lastMaintenanceDate: '',
  nextMaintenanceDate: ''
})

const errors = ref({})
const loading = ref(false)
const saving = ref(false)
const submitError = ref('')

const droneId = computed(() => route.params.id ?? null)
const isEditing = computed(() => droneId.value !== null)

const titleKey = computed(() =>
  isEditing.value ? 'drone.form.edit-title' : 'drone.form.new-title'
)

const formatDateForInput = (isoDate) => {
  if (!isoDate) return ''
  try {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

const loadDrone = async () => {
  if (!isEditing.value) return

  loading.value = true
  submitError.value = ''

  try {
    const drone = await useCases.getDrone(droneId.value)
    form.value = {
      serialNumber: drone.serialNumber || '',
      model: drone.modelName || '',
      capacity: drone.capacity != null ? String(drone.capacity) : '',
      nozzleId: drone.nozzleId != null ? String(drone.nozzleId) : '',
      urlimg: drone.urlimg || '',
      status: drone.status || DroneStatus.AVAILABLE,
      lastMaintenanceDate: formatDateForInput(drone.lastMaintenanceDate),
      nextMaintenanceDate: formatDateForInput(drone.nextMaintenanceDate)
    }
  } catch (error) {
    submitError.value = error.message
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  errors.value = {}
  submitError.value = ''

  const validationErrors = DroneUseCases.validate(form.value, isEditing.value)
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    return
  }

  saving.value = true

  try {
    if (isEditing.value) {
      await useCases.updateDrone(droneId.value, form.value)
    } else {
      await useCases.createDrone(form.value)
    }
    await router.push('/drones')
  } catch (error) {
    if (error instanceof DroneValidationError) {
      errors.value = error.errors
    } else {
      submitError.value = error.message
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadDrone)
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t(titleKey) }}</h1>
      <p class="view-subtitle">{{ t('drone.subtitle') }}</p>
    </div>

    <div v-if="loading" aria-busy="true">
      <pv-skeleton height="3rem" class="mb-3"></pv-skeleton>
      <pv-skeleton height="3rem" class="mb-3"></pv-skeleton>
      <pv-skeleton height="3rem"></pv-skeleton>
    </div>

    <form v-else class="drone-form" @submit.prevent="onSubmit">
      <pv-message v-if="submitError" severity="error" :closable="false">
        {{ submitError }}
      </pv-message>

      <!-- Serial Number -->
      <div class="form-field">
        <label for="drone-serial" class="form-label">
          {{ t('drone.serial') }} <span class="required">*</span>
        </label>
        <pv-input-text
          id="drone-serial"
          v-model="form.serialNumber"
          :placeholder="t('drone.form.serial-placeholder')"
          :invalid="Boolean(errors.serialNumber)"
          :disabled="isEditing"
          class="form-input"
        />
        <small v-if="errors.serialNumber" class="field-error">
          {{ t(errors.serialNumber) }}
        </small>
      </div>

      <!-- Model -->
      <div class="form-field">
        <label for="drone-model" class="form-label">
          {{ t('drone.model') }} <span class="required">*</span>
        </label>
        <pv-input-text
          id="drone-model"
          v-model="form.model"
          :placeholder="t('drone.form.model-placeholder')"
          :invalid="Boolean(errors.model)"
          class="form-input"
        />
        <small v-if="errors.model" class="field-error">
          {{ t(errors.model) }}
        </small>
      </div>

      <!-- Capacity (Liters) -->
      <div class="form-field">
        <label for="drone-capacity" class="form-label">
          {{ t('drone.capacity') }} (L) <span class="required">*</span>
        </label>
        <pv-input-text
          id="drone-capacity"
          v-model="form.capacity"
          type="number"
          step="0.1"
          min="0.1"
          :placeholder="t('drone.form.capacity-placeholder')"
          :invalid="Boolean(errors.capacity)"
          class="form-input"
        />
        <small v-if="errors.capacity" class="field-error">
          {{ t(errors.capacity) }}
        </small>
      </div>

      <!-- Nozzle ID (Boquilla) -->
      <div class="form-field">
        <label for="drone-nozzle" class="form-label">
          {{ t('drone.nozzleId') }}
        </label>
        <pv-input-text
          id="drone-nozzle"
          v-model="form.nozzleId"
          type="number"
          :placeholder="t('drone.form.nozzle-placeholder')"
          class="form-input"
        />
      </div>

      <!-- Maintenance Dates -->
      <div class="form-grid">
        <div class="form-field">
          <label for="drone-last-maint" class="form-label">
            {{ t('drone.lastMaintenance') }}
          </label>
          <input
            id="drone-last-maint"
            v-model="form.lastMaintenanceDate"
            type="date"
            class="p-inputtext form-input"
          />
        </div>

        <div class="form-field">
          <label for="drone-next-maint" class="form-label">
            {{ t('drone.nextMaintenance') }}
          </label>
          <input
            id="drone-next-maint"
            v-model="form.nextMaintenanceDate"
            type="date"
            class="p-inputtext form-input"
          />
        </div>
      </div>

      <!-- Image URL -->
      <div class="form-field">
        <label for="drone-image" class="form-label">
          {{ t('drone.form.image-url') }}
        </label>
        <pv-input-text
          id="drone-image"
          v-model="form.urlimg"
          :placeholder="t('drone.form.image-placeholder')"
          class="form-input"
        />
      </div>

      <!-- Image Live Preview -->
      <div v-if="form.urlimg" class="image-preview-container">
        <span class="preview-label">{{ t('drone.preview') }}</span>
        <img
          :src="form.urlimg"
          alt="Preview"
          class="image-preview"
          @error="e => e.target.style.display = 'none'"
        />
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <pv-button
          :label="t('farm.cancel')"
          severity="secondary"
          text
          type="button"
          @click="router.push('/drones')"
        />
        <pv-button
          :label="t('parcel.form.submit')"
          icon="pi pi-check"
          type="submit"
          :loading="saving"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
  max-width: 42rem;
}

.header-section {
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0 0 0.25rem 0;
}

.view-subtitle {
  font-size: 0.95rem;
  color: var(--p-text-color);
  opacity: 0.7;
  margin: 0;
}

.drone-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  border-radius: 12px;
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.required {
  color: var(--p-red-500, #ef4444);
}

.form-input {
  width: 100%;
}

.field-error {
  color: var(--p-red-500, #ef4444);
  font-size: 0.8rem;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.preview-label {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.7;
}

.image-preview {
  max-height: 12rem;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--p-content-border-color, #e2e8f0);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-content-border-color, #e2e8f0);
}
</style>
