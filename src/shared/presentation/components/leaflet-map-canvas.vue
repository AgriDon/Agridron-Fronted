<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'

const { t } = useI18n()

const props = defineProps({
  /** Open array of `[lng, lat]` vertices. */
  vertices: {
    type: Array,
    default: () => []
  },
  /** Optional parent geometry `[lng, lat]` rendered as a dashed reference polygon. */
  referenceVertices: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: false
  },
  defaultLayer: {
    type: String,
    default: 'satellite',
    validator: (value) => ['satellite', 'topographic', 'hybrid'].includes(value)
  },
  height: {
    type: String,
    default: '360px'
  },
  /** Initial `[lat, lng]` center when no geometry is provided (Valle de Cañete, Peru). */
  center: {
    type: Array,
    default: () => [-13.08, -76.39]
  },
  zoom: {
    type: Number,
    default: 14
  }
})

const emit = defineEmits(['update:vertices', 'layer-change'])

const mapContainer = ref(null)
const activeLayer = ref(props.defaultLayer)

let mapInstance = null
let activeTileLayer = null
let polygonLayer = null
let polylineLayer = null
let referenceLayer = null
let markersLayer = null
let resizeObserver = null

const layerOptions = computed(() => [
  { id: 'satellite', label: t('map.layers.satellite'), icon: 'pi pi-globe' },
  { id: 'topographic', label: t('map.layers.topographic'), icon: 'pi pi-map' },
  { id: 'hybrid', label: t('map.layers.hybrid'), icon: 'pi pi-th-large' }
])

const buildBaseLayer = (layerKey) => {
  const esriSatellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: 'Tiles © Esri'
    }
  )

  if (layerKey === 'topographic') {
    return L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '© OpenTopoMap (CC-BY-SA)'
    })
  }

  if (layerKey === 'hybrid') {
    const labelsOverlay = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Labels © Esri'
      }
    )
    return L.layerGroup([esriSatellite, labelsOverlay])
  }

  return esriSatellite
}

const setLayer = (layerKey) => {
  if (!['satellite', 'topographic', 'hybrid'].includes(layerKey)) {
    return
  }

  activeLayer.value = layerKey

  if (mapInstance) {
    if (activeTileLayer) {
      mapInstance.removeLayer(activeTileLayer)
    }
    activeTileLayer = buildBaseLayer(layerKey)
    activeTileLayer.addTo(mapInstance)
  }

  emit('layer-change', layerKey)
}

const toLatLngs = (coords) =>
  (coords || []).map(([lng, lat]) => [Number(lat), Number(lng)])

const syncReferencePolygon = () => {
  if (!mapInstance) return

  if (referenceLayer) {
    mapInstance.removeLayer(referenceLayer)
    referenceLayer = null
  }

  if (props.referenceVertices && props.referenceVertices.length >= 3) {
    referenceLayer = L.polygon(toLatLngs(props.referenceVertices), {
      color: '#38bdf8',
      fillColor: '#38bdf8',
      fillOpacity: 0.06,
      weight: 2,
      dashArray: '6, 6',
      interactive: false
    }).addTo(mapInstance)
  }
}

const createVertexIcon = (index) =>
  L.divIcon({
    className: 'agridron-vertex-icon-wrapper',
    html: `<span class="agridron-vertex-badge">${index + 1}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

const syncGeometryLayers = () => {
  if (!mapInstance) return

  if (polygonLayer) {
    mapInstance.removeLayer(polygonLayer)
    polygonLayer = null
  }
  if (polylineLayer) {
    mapInstance.removeLayer(polylineLayer)
    polylineLayer = null
  }
  if (markersLayer) {
    markersLayer.clearLayers()
  }

  const latLngs = toLatLngs(props.vertices)

  if (latLngs.length >= 3) {
    polygonLayer = L.polygon(latLngs, {
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 0.24,
      weight: 2.5
    }).addTo(mapInstance)
  } else if (latLngs.length === 2) {
    polylineLayer = L.polyline(latLngs, {
      color: '#22c55e',
      weight: 2.5,
      dashArray: '5, 5'
    }).addTo(mapInstance)
  }

  if (!markersLayer) {
    markersLayer = L.layerGroup().addTo(mapInstance)
  }

  if (!props.editable && latLngs.length >= 3) {
    return
  }

  latLngs.forEach((latLng, index) => {
    const marker = L.marker(latLng, {
      icon: createVertexIcon(index),
      draggable: props.editable
    })

    if (props.editable) {
      marker.on('dragend', (event) => {
        const pos = event.target.getLatLng()
        const updated = props.vertices.map((vertex, idx) =>
          idx === index
            ? [Number(pos.lng.toFixed(6)), Number(pos.lat.toFixed(6))]
            : [...vertex]
        )
        emit('update:vertices', updated)
      })
    }

    marker.addTo(markersLayer)
  })
}

const fitToGeometry = () => {
  if (!mapInstance) return

  const primaryLatLngs = toLatLngs(props.vertices)
  const refLatLngs = toLatLngs(props.referenceVertices)
  const points = primaryLatLngs.length >= 1 ? primaryLatLngs : refLatLngs

  if (points.length >= 2) {
    const bounds = L.latLngBounds(points)
    mapInstance.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 })
  } else if (points.length === 1) {
    mapInstance.setView(points[0], Math.max(mapInstance.getZoom(), 15))
  } else {
    mapInstance.setView(props.center, props.zoom)
  }
}

const zoomIn = () => {
  mapInstance?.zoomIn()
}

const zoomOut = () => {
  mapInstance?.zoomOut()
}

onMounted(() => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: false
  })

  activeTileLayer = buildBaseLayer(activeLayer.value)
  activeTileLayer.addTo(mapInstance)

  if (props.editable) {
    mapInstance.on('click', (event) => {
      const nextVertex = [
        Number(event.latlng.lng.toFixed(6)),
        Number(event.latlng.lat.toFixed(6))
      ]
      const updated = [...(props.vertices || []).map((v) => [...v]), nextVertex]
      emit('update:vertices', updated)
    })
  }

  syncReferencePolygon()
  syncGeometryLayers()
  fitToGeometry()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      mapInstance?.invalidateSize()
    })
    resizeObserver.observe(mapContainer.value)
  }
})

watch(
  () => props.vertices,
  () => {
    syncGeometryLayers()
    if (!props.editable) {
      fitToGeometry()
    }
  },
  { deep: true }
)

watch(
  () => props.referenceVertices,
  () => {
    syncReferencePolygon()
    if ((!props.vertices || props.vertices.length === 0) && props.referenceVertices?.length >= 2) {
      fitToGeometry()
    }
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

defineExpose({ fitToGeometry, setLayer })
</script>

<template>
  <div class="leaflet-map-wrapper" :style="{ height }">
    <div
      ref="mapContainer"
      class="leaflet-map-container"
      :class="{ 'is-editable': editable }"
    ></div>

    <!-- Map Base Layer Switcher (FM-007) -->
    <div
      class="map-layer-switcher"
      role="group"
      :aria-label="t('map.controls.layerSwitcherAria')"
    >
      <button
        v-for="option in layerOptions"
        :key="option.id"
        type="button"
        class="layer-pill"
        :class="{ 'is-active': activeLayer === option.id }"
        :aria-pressed="activeLayer === option.id"
        @click="setLayer(option.id)"
      >
        <i :class="option.icon"></i>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <!-- Large Touch Zoom & Recenter Controls -->
    <div class="map-touch-controls">
      <button
        type="button"
        class="touch-ctrl-btn"
        :title="t('map.controls.zoomIn')"
        :aria-label="t('map.controls.zoomIn')"
        @click="zoomIn"
      >
        <i class="pi pi-plus"></i>
      </button>
      <button
        type="button"
        class="touch-ctrl-btn"
        :title="t('map.controls.zoomOut')"
        :aria-label="t('map.controls.zoomOut')"
        @click="zoomOut"
      >
        <i class="pi pi-minus"></i>
      </button>
      <button
        type="button"
        class="touch-ctrl-btn"
        :title="t('map.controls.recenter')"
        :aria-label="t('map.controls.recenter')"
        @click="fitToGeometry"
      >
        <i class="pi pi-compass"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.leaflet-map-wrapper {
  position: relative;
  width: 100%;
  min-height: 240px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #0f172a;
}

.leaflet-map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.leaflet-map-container.is-editable {
  cursor: crosshair;
}

.map-layer-switcher {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 500;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.layer-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.65rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.layer-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.layer-pill.is-active {
  background: #16a34a;
  color: #ffffff;
}

.map-touch-controls {
  position: absolute;
  bottom: 1.5rem;
  right: 0.65rem;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.touch-ctrl-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.touch-ctrl-btn:hover {
  background: #1e293b;
  border-color: #22c55e;
}

.touch-ctrl-btn:active {
  transform: scale(0.95);
}

:deep(.agridron-vertex-icon-wrapper) {
  background: transparent;
  border: none;
}

:deep(.agridron-vertex-badge) {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #22c55e;
  color: #052e16;
  border: 2px solid #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
}
</style>
