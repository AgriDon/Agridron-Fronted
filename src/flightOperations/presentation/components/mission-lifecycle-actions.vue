<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { MissionUseCases } from '@/flightOperations/application/mission-use-cases.js'
import { useWeatherStore } from '@/weatherIntegration/application/weather.store.js'

const props = defineProps({
  mission: { type: Object, required: true }
})

const emit = defineEmits(['action-done', 'open-config', 'open-complete'])

const { t } = useI18n()
const router = useRouter()
const useCases = new MissionUseCases()
const weatherStore = useWeatherStore()

const loading = ref(false)
const errorMessage = ref('')

// Weather Warning Confirmation Dialog
const showWeatherDialog = ref(false)
const pendingAction = ref(null)
const weatherWarningText = ref('')

// Cancel reason dialog
const showCancelDialog = ref(false)
const cancelReason = ref('')

const isAdverseWeather = computed(() => {
  const current = weatherStore.currentWeather
  if (!current) return false
  const windKmh = current.windSpeed ?? 0
  const isRaining = (current.precipitation ?? 0) > 0 || /lluvia|rain/i.test(current.condition || '')
  return windKmh > 25 || isRaining
})

const checkWeatherAndProceed = (actionName, executor) => {
  if (isAdverseWeather.value) {
    const cur = weatherStore.currentWeather
    weatherWarningText.value = `Alerta climática activa: Viento ${cur?.windSpeed ?? 0} km/h, Condición: ${cur?.condition ?? 'Inestable'}. Supera los límites recomendados para aspersión (máx 25 km/h y sin lluvia).`
    pendingAction.value = executor
    showWeatherDialog.value = true
    return
  }
  executor()
}

const confirmAdverseWeather = () => {
  showWeatherDialog.value = false
  if (pendingAction.value) {
    pendingAction.value()
    pendingAction.value = null
  }
}

// Actions
const onApprove = () => {
  checkWeatherAndProceed('approve', async () => {
    loading.value = true
    try {
      await useCases.approveMission(props.mission.id)
      emit('action-done')
    } catch (err) {
      errorMessage.value = err.message
    } finally {
      loading.value = false
    }
  })
}

const onStart = () => {
  checkWeatherAndProceed('start', async () => {
    loading.value = true
    try {
      await useCases.startMission(props.mission.id)
      emit('action-done')
      // Immediately navigate to live cockpit
      router.push({ name: 'mision-monitoreo', params: { id: props.mission.id } })
    } catch (err) {
      errorMessage.value = err.message
    } finally {
      loading.value = false
    }
  })
}

const onPause = async () => {
  loading.value = true
  try {
    await useCases.pauseMission(props.mission.id, { reason: 'Pausa solicitada por operador' })
    emit('action-done')
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

const onResume = async () => {
  loading.value = true
  try {
    await useCases.resumeMission(props.mission.id)
    emit('action-done')
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

const onCancelPrompt = () => {
  cancelReason.value = ''
  showCancelDialog.value = true
}

const confirmCancel = async () => {
  loading.value = true
  try {
    await useCases.cancelMission(props.mission.id, cancelReason.value || 'Cancelado por usuario')
    showCancelDialog.value = false
    emit('action-done')
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

const onGoToMonitoring = () => {
  router.push({ name: 'mision-monitoreo', params: { id: props.mission.id } })
}
</script>

<template>
  <div class="lifecycle-actions">
    <pv-message v-if="errorMessage" severity="error" :closable="true" class="w-full mb-2" @close="errorMessage = ''">
      {{ errorMessage }}
    </pv-message>

    <!-- Configure Resources & Parameters (PLANNED) -->
    <pv-button
      v-if="mission.status === 'PLANNED'"
      :label="t('mission.action.configure', 'Configurar')"
      icon="pi pi-cog"
      size="small"
      severity="secondary"
      outlined
      @click="emit('open-config', mission)"
    />

    <!-- Approve for Takeoff (PLANNED -> AUTHORIZED) -->
    <pv-button
      v-if="mission.status === 'PLANNED'"
      :label="t('mission.action.approve', 'Aprobar Vuelo')"
      icon="pi pi-check"
      size="small"
      severity="success"
      :disabled="!mission.droneId || !mission.operator"
      :loading="loading"
      @click="onApprove"
    />

    <!-- Start Flight (AUTHORIZED -> IN_PROGRESS) -->
    <pv-button
      v-if="mission.status === 'AUTHORIZED'"
      :label="t('mission.action.start', 'Iniciar Vuelo')"
      icon="pi pi-play"
      size="small"
      severity="primary"
      :loading="loading"
      @click="onStart"
    />

    <!-- Live Telemetry Monitor (IN_PROGRESS or PAUSED) -->
    <pv-button
      v-if="mission.status === 'IN_PROGRESS' || mission.status === 'PAUSED'"
      :label="t('mission.action.monitor', 'Cabina en Vivo')"
      icon="pi pi-desktop"
      size="small"
      severity="help"
      @click="onGoToMonitoring"
    />

    <!-- Pause Flight (IN_PROGRESS -> PAUSED) -->
    <pv-button
      v-if="mission.status === 'IN_PROGRESS'"
      :label="t('mission.action.pause', 'Pausar')"
      icon="pi pi-pause"
      size="small"
      severity="warn"
      :loading="loading"
      @click="onPause"
    />

    <!-- Resume Flight (PAUSED -> IN_PROGRESS) -->
    <pv-button
      v-if="mission.status === 'PAUSED'"
      :label="t('mission.action.resume', 'Reanudar')"
      icon="pi pi-play"
      size="small"
      severity="info"
      :loading="loading"
      @click="onResume"
    />

    <!-- Complete Mission (IN_PROGRESS or PAUSED -> COMPLETED) -->
    <pv-button
      v-if="mission.status === 'IN_PROGRESS' || mission.status === 'PAUSED'"
      :label="t('mission.action.complete', 'Completar')"
      icon="pi pi-check-circle"
      size="small"
      severity="success"
      outlined
      @click="emit('open-complete', mission)"
    />

    <!-- Cancel Mission -->
    <pv-button
      v-if="mission.status !== 'COMPLETED' && mission.status !== 'CANCELLED'"
      :label="t('mission.action.cancel', 'Cancelar')"
      icon="pi pi-times"
      size="small"
      severity="danger"
      text
      @click="onCancelPrompt"
    />

    <!-- Weather Safety Warning Dialog -->
    <pv-dialog
      v-model:visible="showWeatherDialog"
      modal
      :header="t('mission.weather.warningTitle', 'Advertencia Meteorológica Pre-Vuelo')"
      :style="{ width: '28rem' }"
    >
      <pv-message severity="warn" :closable="false" class="mb-3">
        {{ weatherWarningText }}
      </pv-message>
      <p style="margin: 0; font-size: 0.9rem; line-height: 1.4;">
        {{ t('mission.weather.warningQuestion', '¿Desea autorizar e iniciar la operación bajo supervisión manual o prefiere esperar a condiciones óptimas?') }}
      </p>

      <template #footer>
        <pv-button
          :label="t('mission.weather.abort', 'Esperar Condiciones')"
          severity="secondary"
          text
          @click="showWeatherDialog = false"
        />
        <pv-button
          :label="t('mission.weather.proceed', 'Continuar de Todos Modos')"
          severity="warn"
          icon="pi pi-exclamation-triangle"
          @click="confirmAdverseWeather"
        />
      </template>
    </pv-dialog>

    <!-- Cancel Mission Dialog -->
    <pv-dialog
      v-model:visible="showCancelDialog"
      modal
      :header="t('mission.cancel.title', 'Confirmar Cancelación de Misión')"
      :style="{ width: '28rem' }"
    >
      <div class="p-fluid">
        <label class="font-bold text-sm mb-2 block">
          {{ t('mission.cancel.reasonLabel', 'Motivo de Cancelación (MI-006)') }}
        </label>
        <pv-input-text
          v-model="cancelReason"
          :placeholder="t('mission.cancel.reasonPlaceholder', 'Ej. Cambio climático repentino / Mantenimiento urgente')"
          class="w-full"
        />
      </div>

      <template #footer>
        <pv-button
          :label="t('farm.cancel', 'Volver')"
          severity="secondary"
          text
          @click="showCancelDialog = false"
        />
        <pv-button
          :label="t('mission.action.cancel', 'Cancelar Misión')"
          severity="danger"
          icon="pi pi-times"
          :loading="loading"
          @click="confirmCancel"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.lifecycle-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
