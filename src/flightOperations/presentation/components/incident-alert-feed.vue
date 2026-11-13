<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IncidentUseCases } from '@/flightOperations/application/incident-use-cases.js'
import { IncidentSeverity } from '@/flightOperations/domain/model/incident-severity.enum.js'

const props = defineProps({
  incidents: {
    type: Array,
    default: () => []
  },
  missionId: {
    type: [Number, String],
    default: null
  },
  droneId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['incident-reported'])

const { t } = useI18n()
const incidentUseCases = new IncidentUseCases()

const showReportDialog = ref(false)
const reporting = ref(false)
const reportError = ref('')

const form = ref({
  type: 'OBSTACLE_DETECTED',
  description: '',
  severity: IncidentSeverity.HIGH
})

const incidentTypes = [
  { label: 'Obstáculo detectado en vuelo', value: 'OBSTACLE_DETECTED' },
  { label: 'Alerta de batería crítica', value: 'LOW_BATTERY' },
  { label: 'Anomalía de propulsión / rotor', value: 'MOTOR_FAILURE' },
  { label: 'Pérdida momentánea de enlace', value: 'COMMUNICATION_LOSS' },
  { label: 'Deriva imprevista por viento', value: 'WEATHER_DRIFT' },
  { label: 'Otra anomalía operativa', value: 'MANUAL_ALERT' }
]

const severityOptions = Object.values(IncidentSeverity).map(s => ({
  label: s,
  value: s
}))

const getSeverityClass = (sev) => {
  switch (sev) {
    case 'CRITICAL': return 'sev-critical'
    case 'HIGH': return 'sev-high'
    case 'MEDIUM': return 'sev-medium'
    default: return 'sev-low'
  }
}

const openDialog = () => {
  form.value = {
    type: 'OBSTACLE_DETECTED',
    description: '',
    severity: IncidentSeverity.HIGH
  }
  reportError.value = ''
  showReportDialog.value = true
}

const onReport = async () => {
  if (!form.value.description.trim()) {
    reportError.value = 'Debe detallar la descripción de la incidencia'
    return
  }

  reporting.value = true
  reportError.value = ''

  try {
    await incidentUseCases.reportIncident({
      missionId: props.missionId,
      droneId: props.droneId,
      type: form.value.type,
      description: form.value.description.trim(),
      severity: form.value.severity
    })

    showReportDialog.value = false
    emit('incident-reported')
  } catch (error) {
    reportError.value = error.message
  } finally {
    reporting.value = false
  }
}
</script>

<template>
  <div class="incident-feed-card">
    <div class="feed-header">
      <div class="feed-title">
        <i class="pi pi-exclamation-triangle text-amber-400"></i>
        <span>INCIDENCIAS & ALERTAS</span>
      </div>
      <pv-button
        label="Reportar Alerta"
        icon="pi pi-plus"
        size="small"
        severity="danger"
        outlined
        @click="openDialog"
      />
    </div>

    <div v-if="incidents.length === 0" class="empty-feed">
      <i class="pi pi-shield text-emerald-400"></i>
      <p>Sin anomalías registradas en este vuelo.</p>
    </div>

    <div v-else class="feed-list">
      <div
        v-for="inc in incidents"
        :key="inc.id"
        class="feed-item"
        :class="getSeverityClass(inc.severity)"
      >
        <div class="feed-item-top">
          <span class="severity-badge">{{ inc.severity }}</span>
          <span class="time-stamp">
            {{ new Date(inc.occurredAt).toLocaleTimeString() }}
          </span>
        </div>
        <strong class="feed-item-type">{{ inc.type }}</strong>
        <p class="feed-item-desc">{{ inc.description }}</p>
      </div>
    </div>

    <!-- Report Incident Dialog -->
    <pv-dialog
      v-model:visible="showReportDialog"
      modal
      header="Reportar Anomalía u Obstáculo en Vuelo"
      :style="{ width: '28rem', maxWidth: '95vw' }"
    >
      <div class="dialog-form">
        <pv-message v-if="reportError" severity="error" :closable="false">
          {{ reportError }}
        </pv-message>

        <div class="form-field">
          <label class="form-label">Tipo de Evento</label>
          <pv-select
            v-model="form.type"
            :options="incidentTypes"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label class="form-label">Severidad Operativa</label>
          <pv-select
            v-model="form.severity"
            :options="severityOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label class="form-label">Descripción del Suceso <span class="required">*</span></label>
          <textarea
            v-model="form.description"
            rows="3"
            class="p-inputtext w-full"
            placeholder="Ej. Árbol no cartografiado detectado a 3 metros por sensor lidar frontal."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <pv-button
          label="Cancelar"
          severity="secondary"
          text
          @click="showReportDialog = false"
        />
        <pv-button
          label="Registrar Alerta"
          icon="pi pi-send"
          severity="danger"
          :loading="reporting"
          @click="onReport"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.incident-feed-card {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #1f2937;
}

.feed-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #f1f5f9;
}

.empty-feed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: #64748b;
  font-size: 0.85rem;
  text-align: center;
}

.empty-feed i {
  font-size: 2rem;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 22rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.feed-item {
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  border-left: 4px solid;
  background: rgba(255, 255, 255, 0.03);
}

.sev-critical {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.sev-high {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.08);
}

.sev-medium {
  border-color: #eab308;
  background: rgba(234, 179, 8, 0.08);
}

.sev-low {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

.feed-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.severity-badge {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.time-stamp {
  font-size: 0.7rem;
  color: #94a3b8;
  font-family: monospace;
}

.feed-item-type {
  font-size: 0.8rem;
  color: #f8fafc;
  display: block;
}

.feed-item-desc {
  margin: 0.2rem 0 0 0;
  font-size: 0.75rem;
  color: #cbd5e1;
  line-height: 1.3;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.required {
  color: #ef4444;
}
</style>
