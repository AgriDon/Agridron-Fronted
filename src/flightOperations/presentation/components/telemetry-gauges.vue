<script setup>
import { computed } from 'vue'

const props = defineProps({
  telemetry: {
    type: Object,
    default: () => ({
      batteryLevel: 100,
      tankVolumeLiters: 20,
      speedMetersPerSecond: 4.0,
      altitudeMeters: 2.5
    })
  },
  droneCapacity: {
    type: Number,
    default: 20
  },
  missionProgress: {
    type: Number,
    default: 0
  },
  treatedAreaHectares: {
    type: Number,
    default: 0
  },
  plannedAreaHectares: {
    type: Number,
    default: 1.0
  }
})

const batterySeverity = computed(() => {
  const b = props.telemetry?.batteryLevel ?? 100
  if (b > 60) return 'success'
  if (b >= 25) return 'warn'
  return 'danger'
})

const tankPercentage = computed(() => {
  const cap = props.droneCapacity || 20
  const cur = props.telemetry?.tankVolumeLiters ?? cap
  return Math.min(100, Math.max(0, Math.round((cur / cap) * 100)))
})
</script>

<template>
  <div class="telemetry-gauges-grid">
    <!-- Battery Gauge -->
    <div class="gauge-card" :class="`border-${batterySeverity}`">
      <div class="gauge-header">
        <span class="gauge-title">BATERÍA</span>
        <i class="pi pi-bolt" :class="`text-${batterySeverity}`"></i>
      </div>
      <div class="gauge-value" :class="`text-${batterySeverity}`">
        {{ Math.round(telemetry?.batteryLevel ?? 100) }}%
      </div>
      <pv-progressbar
        :value="telemetry?.batteryLevel ?? 100"
        :show-value="false"
        style="height: 0.5rem;"
      />
      <small v-if="(telemetry?.batteryLevel ?? 100) < 20" class="critical-warning">
        ¡Nivel crítico de batería!
      </small>
    </div>

    <!-- Tank Volume Gauge -->
    <div class="gauge-card">
      <div class="gauge-header">
        <span class="gauge-title">TANQUE PRODUCTO</span>
        <i class="pi pi-database text-sky-400"></i>
      </div>
      <div class="gauge-value text-sky-400">
        {{ (telemetry?.tankVolumeLiters ?? droneCapacity).toFixed(1) }} L
      </div>
      <pv-progressbar
        :value="tankPercentage"
        :show-value="false"
        style="height: 0.5rem;"
      />
      <small class="gauge-meta">{{ tankPercentage }}% restante</small>
    </div>

    <!-- Flight Speed Gauge -->
    <div class="gauge-card">
      <div class="gauge-header">
        <span class="gauge-title">VELOCIDAD</span>
        <i class="pi pi-forward text-amber-400"></i>
      </div>
      <div class="gauge-value text-amber-400">
        {{ (telemetry?.speedMetersPerSecond ?? 4.0).toFixed(1) }} <span class="unit">m/s</span>
      </div>
      <small class="gauge-meta">Avance programado</small>
    </div>

    <!-- Altitude Gauge -->
    <div class="gauge-card">
      <div class="gauge-header">
        <span class="gauge-title">ALTITUD AGL</span>
        <i class="pi pi-arrow-up text-violet-400"></i>
      </div>
      <div class="gauge-value text-violet-400">
        {{ (telemetry?.altitudeMeters ?? 2.5).toFixed(1) }} <span class="unit">m</span>
      </div>
      <small class="gauge-meta">Radar sobre cultivo</small>
    </div>

    <!-- Area Progress Gauge -->
    <div class="gauge-card gauge-card-wide">
      <div class="gauge-header">
        <span class="gauge-title">COBERTURA TRATADA</span>
        <i class="pi pi-check-circle text-emerald-400"></i>
      </div>
      <div class="gauge-progress-row">
        <div class="gauge-value text-emerald-400">
          {{ missionProgress }}%
        </div>
        <div class="gauge-meta-area">
          <span>{{ (treatedAreaHectares || 0).toFixed(2) }} ha de {{ (plannedAreaHectares || 1.0).toFixed(2) }} ha</span>
        </div>
      </div>
      <pv-progressbar
        :value="missionProgress"
        :show-value="false"
        style="height: 0.6rem;"
      />
    </div>
  </div>
</template>

<style scoped>
.telemetry-gauges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.gauge-card-wide {
  grid-column: span 4;
}

@media (max-width: 900px) {
  .telemetry-gauges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .gauge-card-wide {
    grid-column: span 2;
  }
}

.gauge-card {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gauge-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.gauge-value {
  font-size: 1.8rem;
  font-weight: 900;
  font-family: monospace;
  line-height: 1.1;
}

.unit {
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
}

.gauge-meta {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.critical-warning {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 700;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.gauge-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.gauge-meta-area {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}

.text-success { color: #10b981; }
.text-warn { color: #f59e0b; }
.text-danger { color: #ef4444; }

.border-danger {
  border-color: #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}
</style>
