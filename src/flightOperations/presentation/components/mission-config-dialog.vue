<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MissionUseCases } from '@/flightOperations/application/mission-use-cases.js'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mission: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'saved'])

const { t } = useI18n()
const missionUseCases = new MissionUseCases()
const droneUseCases = new DroneUseCases()

const drones = ref([])
const loadingDrones = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const form = ref({
  droneId: null,
  treatmentType: '',
  productName: '',
  productDose: '',
  operatorName: '',
  altitudeMeters: 2.5,
  speedMetersPerSecond: 4.0,
  sprayRateLitersPerHectare: 15.0,
  overlapPercentage: 20.0
})

const loadDrones = async () => {
  loadingDrones.value = true
  try {
    // List drones so user can pick an available drone or the currently assigned one
    drones.value = await droneUseCases.listDrones()
  } catch (err) {
    console.error('Error loading drones', err)
  } finally {
    loadingDrones.value = false
  }
}

watch(() => props.mission, (m) => {
  if (m) {
    form.value = {
      droneId: m.droneId ?? null,
      treatmentType: m.treatmentType || '',
      productName: m.product || m.productName || '',
      productDose: m.productDose != null ? String(m.productDose) : '',
      operatorName: m.operator || m.operatorName || '',
      altitudeMeters: m.flightParameters?.altitudeMeters ?? 2.5,
      speedMetersPerSecond: m.flightParameters?.speedMetersPerSecond ?? 4.0,
      sprayRateLitersPerHectare: m.flightParameters?.sprayRateLitersPerHectare ?? 15.0,
      overlapPercentage: m.flightParameters?.overlapPercentage ?? 20.0
    }
  }
}, { immediate: true })

watch(() => props.visible, (v) => {
  if (v) {
    errorMessage.value = ''
    loadDrones()
  }
})

const droneOptions = computed(() => {
  return drones.value.map(d => ({
    label: `${d.modelName} (SN: ${d.serialNumber}) - ${d.status} [${d.batteryLevel}%]`,
    value: d.id,
    disabled: d.status !== 'AVAILABLE' && d.id !== props.mission?.droneId
  }))
})

const close = () => {
  emit('update:visible', false)
}

const onSave = async () => {
  if (!props.mission) return

  if (!form.value.droneId) {
    errorMessage.value = t('mission.config.errorDroneRequired', 'Debe seleccionar un dron')
    return
  }

  if (!form.value.operatorName?.trim()) {
    errorMessage.value = t('mission.config.errorOperatorRequired', 'El operador técnico es obligatorio')
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    const missionId = props.mission.id

    // 1. Assign resources (drone, product, dose)
    await missionUseCases.assignResources(missionId, {
      droneId: form.value.droneId,
      treatmentType: form.value.treatmentType,
      productName: form.value.productName,
      productDose: form.value.productDose ? Number(form.value.productDose) : null
    })

    // 2. Assign operator
    await missionUseCases.assignOperator(missionId, {
      operatorName: form.value.operatorName.trim()
    })

    // 3. Configure flight parameters
    await missionUseCases.configureFlightParameters(missionId, {
      altitudeMeters: Number(form.value.altitudeMeters) || 2.5,
      speedMetersPerSecond: Number(form.value.speedMetersPerSecond) || 4.0,
      sprayRateLitersPerHectare: Number(form.value.sprayRateLitersPerHectare) || 15.0,
      overlapPercentage: Number(form.value.overlapPercentage) || 20.0
    })

    emit('saved')
    close()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :header="t('mission.config.title', 'Configuración Operativa y Recursos')"
    :style="{ width: '38rem', maxWidth: '95vw' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="config-dialog-content">
      <pv-message v-if="errorMessage" severity="error" :closable="false" class="mb-3">
        {{ errorMessage }}
      </pv-message>

      <!-- Section: Drone & Resources -->
      <h3 class="section-heading">
        <i class="pi pi-send"></i>
        {{ t('mission.config.resourcesTitle', 'Asignación de Recursos (MI-002)') }}
      </h3>

      <div class="form-field">
        <label class="form-label">
          {{ t('mission.config.droneSelect', 'Dron Asignado') }} <span class="required">*</span>
        </label>
        <pv-select
          v-model="form.droneId"
          :options="droneOptions"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          :placeholder="t('mission.config.dronePlaceholder', 'Seleccione un dron disponible')"
          :loading="loadingDrones"
          class="w-full"
        />
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label class="form-label">{{ t('mission.config.productName', 'Producto Químico') }}</label>
          <pv-input-text
            v-model="form.productName"
            :placeholder="t('mission.config.productPlaceholder', 'Ej. Fungicida Cobre')"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label class="form-label">{{ t('mission.config.productDose', 'Dosis (L/ha)') }}</label>
          <pv-input-text
            v-model="form.productDose"
            type="number"
            step="0.1"
            :placeholder="t('mission.config.dosePlaceholder', 'Ej. 2.5')"
            class="w-full"
          />
        </div>
      </div>

      <!-- Section: Operator -->
      <h3 class="section-heading mt-4">
        <i class="pi pi-user"></i>
        {{ t('mission.config.operatorTitle', 'Operador Técnico Certificado (MI-003)') }}
      </h3>

      <div class="form-field">
        <label class="form-label">
          {{ t('mission.config.operatorName', 'Nombre del Piloto / Operador') }} <span class="required">*</span>
        </label>
        <pv-input-text
          v-model="form.operatorName"
          :placeholder="t('mission.config.operatorPlaceholder', 'Ej. Ing. Carlos Mendoza')"
          class="w-full"
        />
      </div>

      <!-- Section: Flight Parameters -->
      <h3 class="section-heading mt-4">
        <i class="pi pi-sliders-h"></i>
        {{ t('mission.config.flightParamsTitle', 'Parámetros de Vuelo Autónomo (MI-004)') }}
      </h3>

      <div class="form-grid-2">
        <div class="form-field">
          <label class="form-label">{{ t('mission.config.altitude', 'Altitud de Vuelo (m)') }}</label>
          <pv-input-text
            v-model="form.altitudeMeters"
            type="number"
            step="0.5"
            min="1.0"
            max="30.0"
            class="w-full"
          />
          <small class="hint-text">Rango recomendado: 1.5 - 5.0 m</small>
        </div>

        <div class="form-field">
          <label class="form-label">{{ t('mission.config.speed', 'Velocidad de Avance (m/s)') }}</label>
          <pv-input-text
            v-model="form.speedMetersPerSecond"
            type="number"
            step="0.5"
            min="1.0"
            max="20.0"
            class="w-full"
          />
          <small class="hint-text">Rango recomendado: 3.0 - 7.0 m/s</small>
        </div>

        <div class="form-field">
          <label class="form-label">{{ t('mission.config.sprayRate', 'Tasa de Aspersión (L/ha)') }}</label>
          <pv-input-text
            v-model="form.sprayRateLitersPerHectare"
            type="number"
            step="1"
            min="1"
            max="100"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label class="form-label">{{ t('mission.config.overlap', 'Solape de Pasada (%)') }}</label>
          <pv-input-text
            v-model="form.overlapPercentage"
            type="number"
            step="5"
            min="0"
            max="80"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="t('farm.cancel', 'Cancelar')"
        severity="secondary"
        text
        @click="close"
      />
      <pv-button
        :label="t('mission.config.saveAction', 'Guardar Configuración')"
        icon="pi pi-check"
        :loading="saving"
        @click="onSave"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.config-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.section-heading {
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-primary-color, #16a34a);
  margin: 0.5rem 0 0.25rem 0;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--p-content-border-color, #e2e8f0);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--p-text-color);
}

.required {
  color: var(--p-red-500, #ef4444);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

@media (max-width: 500px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}

.hint-text {
  font-size: 0.75rem;
  opacity: 0.65;
}
</style>
