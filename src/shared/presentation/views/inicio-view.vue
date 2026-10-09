<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { FincaUseCases } from '@/fieldManagement/application/finca-use-cases.js'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'
import { MissionUseCases } from '@/flightOperations/application/mission-use-cases.js'
import { WeatherUseCases } from '@/weatherIntegration/application/weather-use-cases.js'
import { UserProfileService } from '@/shared/application/user-profile-service.js'

const { t } = useI18n()
const router = useRouter()

const fincaUseCases = new FincaUseCases()
const parcelaUseCases = new ParcelaUseCases()
const missionUseCases = new MissionUseCases()
const weatherUseCases = new WeatherUseCases()
const userService = new UserProfileService()

// State
const loading = ref(true)
const user = ref({ name: 'Juan Pérez', role: 'Agricultor' })
const farms = ref([])
const parcels = ref([])
const missions = ref([])
const weather = ref({
  temp: 18,
  condition: 'Parcialmente nublado',
  wind: '12 km/h',
  humidity: '65%'
})

// Dialog for weather forecast
const showWeatherDialog = ref(false)

// Computed KPIs
const farmsCount = computed(() => farms.value.length || 3)
const parcelsCount = computed(() => parcels.value.length || 18)
const missionsCount = computed(() => missions.value.length || 6)
const totalArea = computed(() => {
  if (parcels.value.length > 0) {
    const sum = parcels.value.reduce((acc, p) => acc + (Number(p.area) || 0), 0)
    return Math.round(sum * 10) / 10
  }
  return 18.5
})

// Recent 5 missions
const recentMissions = computed(() => {
  if (missions.value.length === 0) {
    return [
      { id: 'M1-001', parcel: 'Lote3 - Uva', date: '12/05/26', status: 'En curso', progress: 60 },
      { id: 'M1-002', parcel: 'Lote2 - Fresa', date: '11/07/26', status: 'Completado', progress: 100 },
      { id: 'M1-003', parcel: 'Lote5 - Sandia', date: '09/01/26', status: 'Completado', progress: 100 },
      { id: 'M1-004', parcel: 'Lote2 - Fresa', date: '27/01/26', status: 'Programado', progress: 0 },
      { id: 'M1-005', parcel: 'Lote1 - Melon', date: '30/03/26', status: 'Completado', progress: 100 }
    ]
  }

  return missions.value.slice(0, 5).map((m, idx) => ({
    id: `M1-00${m.id || idx + 1}`,
    parcel: m.farmArea || `Lote ${m.id || idx + 1}`,
    date: formatDate(m.date),
    status: formatStatus(m.status),
    progress: Number(m.progress) || (m.status === 'COMPLETED' ? 100 : m.status === 'IN_PROGRESS' ? 60 : 0)
  }))
})

const formatDate = (dateStr) => {
  if (!dateStr) return '12/05/26'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`
}

const formatStatus = (st) => {
  const map = {
    'COMPLETED': 'Completado',
    'IN_PROGRESS': 'En curso',
    'PLANNED': 'Programado',
    'PAUSED': 'En pausa',
    'CANCELLED': 'Cancelado'
  }
  return map[st] || st || 'Programado'
}

const statusClass = (status) => {
  if (/completado/i.test(status)) return 'badge--completed'
  if (/curso|proceso/i.test(status)) return 'badge--in-progress'
  return 'badge--planned'
}

const loadData = async () => {
  loading.value = true
  try {
    const [userData, farmList, parcelList, missionList, weatherList] = await Promise.allSettled([
      userService.getCurrentUser(),
      fincaUseCases.listFarms(),
      parcelaUseCases.listParcels(),
      missionUseCases.listMissions(),
      weatherUseCases.listWeatherConditions()
    ])

    if (userData.status === 'fulfilled' && userData.value) {
      user.value = userData.value
    }
    if (farmList.status === 'fulfilled' && Array.isArray(farmList.value)) {
      farms.value = farmList.value
    }
    if (parcelList.status === 'fulfilled' && Array.isArray(parcelList.value)) {
      parcels.value = parcelList.value
    }
    if (missionList.status === 'fulfilled' && Array.isArray(missionList.value)) {
      missions.value = missionList.value
    }
    if (weatherList.status === 'fulfilled' && weatherList.value?.length > 0) {
      const w = weatherList.value[0]
      weather.value = {
        temp: w.temperature ? Math.round(w.temperature) : 18,
        condition: w.condition || 'Parcialmente nublado',
        wind: w.windSpeed ? `${Math.round(w.windSpeed)} km/h` : '12 km/h',
        humidity: w.humidity ? `${Math.round(w.humidity)}%` : '65%'
      }
    }
  } catch (err) {
    console.error('Error cargando datos del dashboard:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="dashboard-container">
    <!-- Welcome Header -->
    <header class="welcome-header">
      <h1 class="welcome-title">¡Bienvenido, {{ user.name ? user.name.split(' ')[0] : 'Juan' }}!</h1>
      <p class="welcome-subtitle">Aquí tienes un resumen de tus operaciones</p>
    </header>

    <!-- Top KPI Cards Row -->
    <section class="kpi-grid">
      <!-- Card 1: Fincas Registradas -->
      <div class="kpi-card" @click="router.push('/fincas')">
        <div class="kpi-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=300"
            alt="Fincas"
            class="kpi-image"
          />
        </div>
        <span class="kpi-label">Fincas Registradas</span>
        <span class="kpi-value">{{ farmsCount }}</span>
      </div>

      <!-- Card 2: Parcelas -->
      <div class="kpi-card" @click="router.push('/parcelas')">
        <div class="kpi-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300"
            alt="Parcelas"
            class="kpi-image"
          />
        </div>
        <span class="kpi-label">Parcelas</span>
        <span class="kpi-value">{{ parcelsCount }}</span>
      </div>

      <!-- Card 3: Misiones -->
      <div class="kpi-card" @click="router.push('/misiones')">
        <div class="kpi-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300"
            alt="Misiones"
            class="kpi-image"
          />
        </div>
        <span class="kpi-label">Misiones</span>
        <span class="kpi-value">{{ missionsCount }}</span>
      </div>

      <!-- Card 4: Área Total -->
      <div class="kpi-card" @click="router.push('/parcelas')">
        <div class="kpi-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300"
            alt="Área Total"
            class="kpi-image"
          />
        </div>
        <span class="kpi-label">Área Total(ha)</span>
        <span class="kpi-value">{{ totalArea }}</span>
      </div>
    </section>

    <!-- Bottom Two Columns Section -->
    <div class="dashboard-bottom-grid">
      <!-- Left Column: Misiones recientes Table -->
      <section class="recent-missions-panel">
        <div class="panel-header">
          <h2 class="panel-title">Misiones recientes</h2>
          <button class="view-all-btn" @click="router.push('/misiones')">
            <span>Ver todas</span>
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>

        <div class="table-container">
          <table class="missions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Parcela</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Progreso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in recentMissions" :key="m.id">
                <td class="col-id">{{ m.id }}</td>
                <td class="col-parcel">{{ m.parcel }}</td>
                <td class="col-date">{{ m.date }}</td>
                <td class="col-status">
                  <span class="status-pill" :class="statusClass(m.status)">
                    {{ m.status }}
                  </span>
                </td>
                <td class="col-progress">
                  <div class="progress-cell">
                    <span>{{ m.progress }}%</span>
                    <div class="mini-bar-bg">
                      <div class="mini-bar-fill" :style="{ width: `${m.progress}%` }"></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Right Column: Clima & Fotografía -->
      <aside class="dashboard-sidebar">
        <!-- Weather Card matching mockup -->
        <div class="weather-box">
          <div class="weather-header">
            <h3>Estado del clima</h3>
          </div>
          <div class="weather-body">
            <div class="temp-row">
              <i class="pi pi-cloud weather-icon"></i>
              <span class="temp-value">{{ weather.temp }}° C</span>
            </div>
            <p class="weather-desc">{{ weather.condition }}</p>
            <div class="weather-specs">
              <p>Viento : {{ weather.wind }}</p>
              <p>Humedad : {{ weather.humidity }}</p>
            </div>
          </div>
          <button class="forecast-btn" @click="showWeatherDialog = true">
            <span>Ver pronostico</span>
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>

        <!-- Landscape Satellite Imagery Box -->
        <div class="terrain-box">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"
            alt="Predio agrícola"
            class="terrain-image"
          />
        </div>
      </aside>
    </div>

    <!-- Weather Forecast Dialog -->
    <pv-dialog
      v-model:visible="showWeatherDialog"
      modal
      header="Pronóstico Meteorológico Agrícola"
      :style="{ width: '32rem' }"
    >
      <div class="forecast-dialog-content">
        <p><strong>Condiciones en campo:</strong> Adecuadas para pulverización con drones.</p>
        <ul class="forecast-list">
          <li><strong>Ventana óptima de vuelo:</strong> 06:00 - 10:30 hrs</li>
          <li><strong>Velocidad de viento estimada:</strong> &lt; 15 km/h (Seguro para deriva)</li>
          <li><strong>Probabilidad de precipitación:</strong> 10%</li>
        </ul>
      </div>
      <template #footer>
        <pv-button label="Cerrar" text @click="showWeatherDialog = false" />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Header */
.welcome-header {
  margin-bottom: 0.5rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.4rem 0;
}

.welcome-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0;
}

/* Top KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.kpi-card {
  background: #ffffff;
  border: 1.5px solid #1f2937;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.kpi-image-wrapper {
  width: 100%;
  max-width: 110px;
  height: 70px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.kpi-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kpi-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.kpi-value {
  font-size: 2.25rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

/* Bottom Grid Layout */
.dashboard-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  align-items: start;
}

/* Recent Missions Table */
.recent-missions-panel {
  background: #14382e;
  border-radius: 8px;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #0f2c24;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.view-all-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.missions-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

.missions-table th {
  padding: 1rem 1.25rem;
  color: #d1fae5;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.missions-table td {
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
}

.missions-table tr:last-child td {
  border-bottom: none;
}

.col-id {
  font-weight: 700;
  color: #ffffff;
}

.col-parcel {
  font-weight: 500;
}

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge--completed {
  background-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.badge--in-progress {
  background-color: rgba(234, 179, 8, 0.2);
  color: #fde047;
}

.badge--planned {
  background-color: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-bar-bg {
  width: 60px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  background-color: #10b981;
  border-radius: 9999px;
}

/* Sidebar Right */
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Weather Box */
.weather-box {
  background: #19906d;
  color: #ffffff;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.weather-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
}

.temp-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.weather-icon {
  font-size: 2.2rem;
  color: #fef08a;
}

.temp-value {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.weather-desc {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
  opacity: 0.9;
}

.weather-specs p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.forecast-btn {
  margin-top: 1rem;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.forecast-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Terrain Box */
.terrain-box {
  border-radius: 8px;
  overflow: hidden;
  height: 170px;
  border: 1px solid #d1d5db;
}

.terrain-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.forecast-dialog-content {
  line-height: 1.6;
}

.forecast-list {
  margin: 0.75rem 0 0 1.25rem;
  padding: 0;
}

/* Responsiveness */
@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
