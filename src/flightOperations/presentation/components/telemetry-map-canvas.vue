<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPoint: {
    type: Object,
    default: () => ({ latitude: -12.0464, longitude: -77.0428, altitudeMeters: 2.5 })
  },
  historyPoints: {
    type: Array,
    default: () => []
  },
  parcelGeometry: {
    type: Object,
    default: null
  }
})

// Normalizes GPS coordinates to a 500x340 SVG viewport
const svgCoords = computed(() => {
  const points = [...props.historyPoints]
  if (props.currentPoint) points.push(props.currentPoint)

  if (points.length === 0) {
    return {
      droneX: 250,
      droneY: 170,
      pathD: 'M 100 170 L 250 170',
      polygonPoints: '60,40 440,40 420,300 80,290'
    }
  }

  const lats = points.map(p => Number(p.latitude) || 0)
  const lons = points.map(p => Number(p.longitude) || 0)

  let minLat = Math.min(...lats)
  let maxLat = Math.max(...lats)
  let minLon = Math.min(...lons)
  let maxLon = Math.max(...lons)

  if (maxLat - minLat < 0.0005) {
    minLat -= 0.0005
    maxLat += 0.0005
  }
  if (maxLon - minLon < 0.0005) {
    minLon -= 0.0005
    maxLon += 0.0005
  }

  const mapX = (lon) => 50 + ((lon - minLon) / (maxLon - minLon)) * 400
  const mapY = (lat) => 290 - ((lat - minLat) / (maxLat - minLat)) * 240

  let pathD = ''
  points.forEach((p, idx) => {
    const x = mapX(p.longitude)
    const y = mapY(p.latitude)
    pathD += `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  })

  const curX = props.currentPoint ? mapX(props.currentPoint.longitude) : 250
  const curY = props.currentPoint ? mapY(props.currentPoint.latitude) : 170

  // Bounding parcel frame
  const polygonPoints = `${50},${50} ${450},${50} ${450},${290} ${50},${290}`

  return {
    droneX: curX,
    droneY: curY,
    pathD: pathD.trim(),
    polygonPoints
  }
})
</script>

<template>
  <div class="telemetry-map-canvas">
    <div class="map-overlay-header">
      <div class="coord-pill">
        <i class="pi pi-compass text-emerald-400"></i>
        <span>Lat: {{ (currentPoint?.latitude || 0).toFixed(6) }}</span>
        <span>Lon: {{ (currentPoint?.longitude || 0).toFixed(6) }}</span>
      </div>
      <div class="coord-pill">
        <i class="pi pi-arrow-up text-sky-400"></i>
        <span>Alt: {{ (currentPoint?.altitudeMeters || 2.5).toFixed(1) }} m</span>
      </div>
    </div>

    <svg viewBox="0 0 500 340" class="svg-viewport" preserveAspectRatio="xMidYMid meet">
      <!-- Grid Background -->
      <defs>
        <pattern id="telemetryGrid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.07)" stroke-width="1" />
        </pattern>
        <radialGradient id="dronePulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="500" height="340" fill="#0d141c" />
      <rect width="500" height="340" fill="url(#telemetryGrid)" />

      <!-- Field boundary polygon -->
      <polygon
        :points="svgCoords.polygonPoints"
        fill="rgba(16, 185, 129, 0.05)"
        stroke="#10b981"
        stroke-width="2"
        stroke-dasharray="6,4"
      />

      <!-- Flight Path Track -->
      <path
        v-if="svgCoords.pathD"
        :d="svgCoords.pathD"
        fill="none"
        stroke="#38bdf8"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Takeoff Point Home Pin -->
      <g transform="translate(60, 270)">
        <circle r="8" fill="#eab308" opacity="0.3" />
        <circle r="4" fill="#eab308" />
        <text x="12" y="4" fill="#cbd5e1" font-size="10" font-weight="700">HOME</text>
      </g>

      <!-- Current Drone Position Marker -->
      <g :transform="`translate(${svgCoords.droneX}, ${svgCoords.droneY})`">
        <!-- Radar Pulse Circle -->
        <circle r="22" fill="url(#dronePulse)">
          <animate attributeName="r" values="12;28;12" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
        </circle>

        <!-- Drone Body -->
        <circle r="9" fill="#10b981" stroke="#ffffff" stroke-width="2" />
        <line x1="-12" y1="-12" x2="12" y2="12" stroke="#ffffff" stroke-width="2" />
        <line x1="-12" y1="12" x2="12" y2="-12" stroke="#ffffff" stroke-width="2" />
        <circle cx="-12" cy="-12" r="3" fill="#38bdf8" />
        <circle cx="12" cy="12" r="3" fill="#38bdf8" />
        <circle cx="-12" cy="12" r="3" fill="#38bdf8" />
        <circle cx="12" cy="-12" r="3" fill="#38bdf8" />
      </g>
    </svg>

    <div class="map-overlay-footer">
      <span class="status-indicator">
        <span class="live-dot"></span> TELEMETRÍA SATELITAL EN VIVO
      </span>
      <span class="points-counter">{{ historyPoints.length }} lecturas persistidas</span>
    </div>
  </div>
</template>

<style scoped>
.telemetry-map-canvas {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #0d141c;
  border: 1px solid #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.map-overlay-header {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  z-index: 10;
  pointer-events: none;
}

.coord-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #f1f5f9;
}

.svg-viewport {
  width: 100%;
  height: 100%;
  display: block;
}

.map-overlay-footer {
  position: absolute;
  bottom: 0.65rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  pointer-events: none;
  font-size: 0.75rem;
  color: #94a3b8;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  color: #10b981;
  letter-spacing: 0.05em;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}
</style>
