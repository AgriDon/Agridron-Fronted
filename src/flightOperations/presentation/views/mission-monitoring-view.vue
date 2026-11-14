<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { MissionUseCases } from '@/flightOperations/application/mission-use-cases.js'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'
import { TelemetryUseCases } from '@/flightOperations/application/telemetry-use-cases.js'
import { IncidentUseCases } from '@/flightOperations/application/incident-use-cases.js'
import { useWeatherStore } from '@/weatherIntegration/application/weather.store.js'

import TelemetryMapCanvas from '../components/telemetry-map-canvas.vue'
import TelemetryGauges from '../components/telemetry-gauges.vue'
import IncidentAlertFeed from '../components/incident-alert-feed.vue'
import MissionCompleteDialog from '../components/mission-complete-dialog.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const missionUseCases = new MissionUseCases()
const droneUseCases = new DroneUseCases()
const telemetryUseCases = new TelemetryUseCases()
const incidentUseCases = new IncidentUseCases()
const weatherStore = useWeatherStore()

const missionId = computed(() => route.params.id)

const mission = ref(null)
const drone = ref(null)
const telemetryHistory = ref([])
const incidents = ref([])
const loading = ref(true)
const errorMessage = ref('')

const showCompleteDialog = ref(false)

// Telemetry State
const currentTelemetry = ref({
  latitude: -12.046374,
  longitude: -77.042793,
  altitudeMeters: 2.5,
  speedMetersPerSecond: 4.0,
  batteryLevel: 98,
  tankVolumeLiters: 19.5,
  status: 'IN_FLIGHT'
})

// Simulator State
const isSimulating = ref(false)
let simulationInterval = null
const simStep = ref(0)

const baseLat = -12.046374
const baseLon = -77.042793

const loadCockpitData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    mission.value = await missionUseCases.getMission(missionId.value)

    if (mission.value?.droneId) {
      try {
        drone.value = await droneUseCases.getDrone(mission.value.droneId)
      } catch (e) {
        console.warn('Could not load assigned drone details', e)
      }
    }

    const [telemetry, incs] = await Promise.all([
      telemetryUseCases.listMissionTelemetry(missionId.value),
      incidentUseCases.listMissionIncidents(missionId.value)
    ])

    telemetryHistory.value = telemetry || []
    incidents.value = incs || []

    if (telemetry && telemetry.length > 0) {
      const last = telemetry[telemetry.length - 1]
      currentTelemetry.value = {
        latitude: last.latitude,
        longitude: last.longitude,
        altitudeMeters: last.altitudeMeters || 2.5,
        speedMetersPerSecond: last.speedMetersPerSecond || 4.0,
        batteryLevel: last.batteryLevel != null ? last.batteryLevel : 95,
        tankVolumeLiters: last.tankVolumeLiters != null ? last.tankVolumeLiters : (drone.value?.capacity || 20),
        status: last.status || mission.value.status
      }
    } else if (drone.value) {
      currentTelemetry.value.batteryLevel = drone.value.batteryLevel ?? 100
      currentTelemetry.value.tankVolumeLiters = drone.value.capacity ?? 20
    }
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

// Generates next coordinate in a zig-zag agricultural spray trajectory
const nextSimulationPoint = () => {
  simStep.value += 1
  const step = simStep.value

  // Zigzag pattern
  const row = Math.floor(step / 6)
  const col = step % 6
  const direction = row % 2 === 0 ? col : (5 - col)

  const latOffset = row * 0.0004
  const lonOffset = direction * 0.0005

  const newLat = Number((baseLat + latOffset).toFixed(6))
  const newLon = Number((baseLon + lonOffset).toFixed(6))

  const newBattery = Math.max(5, Math.round(currentTelemetry.value.batteryLevel - 1.5))
  const newTank = Math.max(0.5, Number((currentTelemetry.value.tankVolumeLiters - 0.4).toFixed(1)))

  return {
    missionId: Number(missionId.value),
    droneId: mission.value?.droneId ? Number(mission.value.droneId) : null,
    latitude: newLat,
    longitude: newLon,
    altitudeMeters: 2.5,
    speedMetersPerSecond: 4.2,
    batteryLevel: newBattery,
    tankVolumeLiters: newTank,
    status: 'IN_FLIGHT',
    timestamp: new Date().toISOString()
  }
}

const sendTelemetryStep = async () => {
  const point = nextSimulationPoint()

  try {
    const saved = await telemetryUseCases.recordTelemetryPoint(point)
    currentTelemetry.value = saved
    telemetryHistory.value.push(saved)

    if (mission.value) {
      mission.value.progress = Math.min(100, (mission.value.progress || 0) + 4)
      mission.value.treatedAreaHectares = Number(
        (((mission.value.plannedAreaHectares || 1.0) * mission.value.progress) / 100).toFixed(2)
      )
    }

    // Trigger low battery alert if battery dropped below 20%
    if (point.batteryLevel <= 20 && !incidents.value.some(i => i.type === 'LOW_BATTERY')) {
      await incidentUseCases.reportIncident({
        missionId: missionId.value,
        droneId: mission.value?.droneId,
        type: 'LOW_BATTERY',
        description: `Alerta automática: Batería restante ${point.batteryLevel}%. Retorno seguro a casa sugerido.`,
        severity: 'CRITICAL'
      })
      await reloadIncidents()
    }

    if (mission.value?.progress >= 100) {
      stopSimulation()
      showCompleteDialog.value = true
    }
  } catch (err) {
    console.error('Error recording telemetry', err)
  }
}

const startSimulation = () => {
  if (isSimulating.value) return
  isSimulating.value = true
  sendTelemetryStep()
  simulationInterval = setInterval(sendTelemetryStep, 2500)
}

const stopSimulation = () => {
  isSimulating.value = false
  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
}

const reloadIncidents = async () => {
  incidents.value = await incidentUseCases.listMissionIncidents(missionId.value)
}

const onMissionCompleted = async () => {
  stopSimulation()
  await loadCockpitData()
}

onMounted(() => {
  loadCockpitData()
  weatherStore.loadWeatherConditions()
})

onUnmounted(() => {
  stopSimulation()
})
</script>

<template>
  <div class="cockpit-container">
    <!-- Top Cockpit Command Bar -->
    <header class="cockpit-header">
      <div class="header-left">
        <pv-button
          icon="pi pi-arrow-left"
          label="Volver a Misiones"
          severity="secondary"
          size="small"
          text
          @click="router.push('/misiones')"
        />
        <div class="mission-titles">
          <h1 class="cockpit-title">
            CABINA DE CONTROL EN VIVO
            <span class="mission-tag">#{{ missionId }}</span>
          </h1>
          <p class="cockpit-subtitle">
            <span v-if="mission?.farmArea"><strong>Parcela:</strong> {{ mission.farmArea }}</span>
            <span v-if="mission?.cropType"> | <strong>Cultivo:</strong> {{ mission.cropType }}</span>
            <span v-if="drone"> | <strong>Dron:</strong> {{ drone.modelName }} ({{ drone.serialNumber }})</span>
            <span v-if="mission?.operator"> | <strong>Piloto:</strong> {{ mission.operator }}</span>
          </p>
        </div>
      </div>

      <div class="header-actions">
        <!-- Live Simulation Controls -->
        <div class="sim-controls">
          <pv-button
            v-if="!isSimulating"
            label="Simular Vuelo"
            icon="pi pi-play"
            size="small"
            severity="success"
            @click="startSimulation"
          />
          <pv-button
            v-else
            label="Detener Simulación"
            icon="pi pi-pause"
            size="small"
            severity="warn"
            @click="stopSimulation"
          />
          <pv-button
            label="Paso +1"
            icon="pi pi-step-forward"
            size="small"
            severity="secondary"
            outlined
            :disabled="isSimulating"
            @click="sendTelemetryStep"
          />
        </div>

        <pv-button
          label="Completar Misión"
          icon="pi pi-check-circle"
          size="small"
          severity="success"
          @click="showCompleteDialog = true"
        />
      </div>
    </header>

    <div v-if="loading" class="cockpit-loading">
      <pv-skeleton height="24rem" class="mb-3" />
      <pv-skeleton height="12rem" />
    </div>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <!-- Cockpit Main Display -->
    <div v-else class="cockpit-grid">
      <!-- Left: Map & Flight Gauges -->
      <main class="cockpit-main">
        <TelemetryMapCanvas
          :current-point="currentTelemetry"
          :history-points="telemetryHistory"
        />

        <TelemetryGauges
          :telemetry="currentTelemetry"
          :drone-capacity="drone?.capacity || 20"
          :mission-progress="mission?.progress || 0"
          :treated-area-hectares="mission?.treatedAreaHectares || 0"
          :planned-area-hectares="mission?.plannedAreaHectares || 1.0"
        />
      </main>

      <!-- Right: Real-Time Incidents Feed & Weather HUD -->
      <aside class="cockpit-sidebar">
        <!-- Weather Pre-flight Mini-HUD -->
        <div class="weather-hud">
          <div class="weather-hud-header">
            <i class="pi pi-cloud text-sky-400"></i>
            <span>CONDICIONES METEOROLÓGICAS</span>
          </div>
          <div class="weather-hud-body">
            <div class="weather-metric">
              <span class="w-label">Viento</span>
              <span class="w-value">{{ weatherStore.weatherConditions[0]?.windSpeed ?? 8 }} km/h</span>
            </div>
            <div class="weather-metric">
              <span class="w-label">Temp</span>
              <span class="w-value">{{ weatherStore.weatherConditions[0]?.temperature ?? 24 }}°C</span>
            </div>
            <div class="weather-metric">
              <span class="w-label">Humedad</span>
              <span class="w-value">{{ weatherStore.weatherConditions[0]?.humidity ?? 65 }}%</span>
            </div>
          </div>
        </div>

        <IncidentAlertFeed
          :incidents="incidents"
          :mission-id="missionId"
          :drone-id="mission?.droneId"
          @incident-reported="reloadIncidents"
        />
      </aside>
    </div>

    <!-- Complete Mission Modal -->
    <MissionCompleteDialog
      v-model:visible="showCompleteDialog"
      :mission="mission"
      @completed="onMissionCompleted"
    />
  </div>
</template>

<style scoped>
.cockpit-container {
  width: 100%;
  min-height: calc(100vh - 86px);
  background: #090d13;
  color: #f8fafc;
  padding: 1.5rem;
  box-sizing: border-box;
}

.cockpit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #1e293b;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cockpit-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mission-tag {
  color: #10b981;
  font-family: monospace;
}

.cockpit-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sim-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #111827;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #1f2937;
}

.cockpit-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

@media (max-width: 1100px) {
  .cockpit-grid {
    grid-template-columns: 1fr;
  }
}

.cockpit-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cockpit-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.weather-hud {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.weather-hud-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.weather-hud-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-metric {
  display: flex;
  flex-direction: column;
}

.w-label {
  font-size: 0.7rem;
  color: #64748b;
}

.w-value {
  font-size: 1rem;
  font-weight: 800;
  color: #f1f5f9;
  font-family: monospace;
}
</style>
