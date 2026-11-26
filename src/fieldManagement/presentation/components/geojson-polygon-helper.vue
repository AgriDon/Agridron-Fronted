<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LeafletMapCanvas from '@/shared/presentation/components/leaflet-map-canvas.vue'
import {
  buildGeoJsonPolygon,
  calculateGeodesicAreaHectares,
  parsePolygonVertices
} from '@/fieldManagement/domain/services/parcel-geometry.service.js'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  referenceGeometry: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '360px'
  }
})

const emit = defineEmits(['update:modelValue', 'update:area'])

const PRESETS = [
  {
    name: 'Valle de Cañete',
    coords: [
      [-76.395, -13.075],
      [-76.385, -13.075],
      [-76.385, -13.085],
      [-76.395, -13.085]
    ]
  },
  {
    name: 'Ica - San Rafael',
    coords: [
      [-76.140, -14.070],
      [-76.130, -14.070],
      [-76.130, -14.078],
      [-76.140, -14.078]
    ]
  },
  {
    name: 'Mendoza - Uva',
    coords: [
      [-68.840, -32.890],
      [-68.825, -32.890],
      [-68.825, -32.902],
      [-68.840, -32.902]
    ]
  }
]

const mapRef = ref(null)
const showAdvanced = ref(false)
const rawJson = ref(props.modelValue || '')
const vertices = ref(parsePolygonVertices(props.modelValue).vertices)
const hasInvalidRawInput = ref(false)

watch(
  () => props.modelValue,
  (newVal) => {
    const normalized = newVal || ''
    if (normalized !== rawJson.value) {
      rawJson.value = normalized
      const parsed = parsePolygonVertices(normalized)
      if (parsed.valid) {
        vertices.value = parsed.vertices
        hasInvalidRawInput.value = false
      } else if (!normalized.trim()) {
        vertices.value = []
        hasInvalidRawInput.value = false
      }
    }
  }
)

const referenceVertices = computed(
  () => parsePolygonVertices(props.referenceGeometry).vertices
)

const liveAreaHectares = computed(() =>
  vertices.value.length >= 3 ? calculateGeodesicAreaHectares(vertices.value) : 0
)

const isValidPolygon = computed(
  () => vertices.value.length >= 3 && liveAreaHectares.value > 0
)

const commitVertices = (nextVertices) => {
  vertices.value = nextVertices
  hasInvalidRawInput.value = false

  if (nextVertices.length >= 3) {
    const geoJson = buildGeoJsonPolygon(nextVertices)
    const area = calculateGeodesicAreaHectares(nextVertices)
    rawJson.value = geoJson
    emit('update:modelValue', geoJson)
    emit('update:area', area)
  } else {
    rawJson.value = ''
    emit('update:modelValue', '')
    emit('update:area', 0)
  }
}

const onVerticesChange = (nextVertices) => {
  commitVertices(nextVertices)
}

const undoLastVertex = () => {
  if (vertices.value.length === 0) return
  commitVertices(vertices.value.slice(0, -1))
}

const clearPolygon = () => {
  commitVertices([])
}

const fitMap = () => {
  mapRef.value?.fitToGeometry()
}

const applyPreset = async (preset) => {
  if (!preset) return
  commitVertices(preset.coords.map(([lng, lat]) => [lng, lat]))
  await nextTick()
  mapRef.value?.fitToGeometry()
}

const onRawInput = async (event) => {
  const val = event.target.value
  rawJson.value = val

  if (!val.trim()) {
    vertices.value = []
    hasInvalidRawInput.value = false
    emit('update:modelValue', '')
    emit('update:area', 0)
    return
  }

  const parsed = parsePolygonVertices(val)
  if (parsed.valid && parsed.vertices.length >= 3) {
    vertices.value = parsed.vertices
    hasInvalidRawInput.value = false
    emit('update:modelValue', val)
    emit('update:area', calculateGeodesicAreaHectares(parsed.vertices))
    await nextTick()
    mapRef.value?.fitToGeometry()
  } else {
    hasInvalidRawInput.value = true
    emit('update:modelValue', val)
  }
}
</script>

<template>
  <div class="geojson-helper">
    <div class="helper-toolbar">
      <div class="toolbar-info">
        <span class="helper-title">{{ t('parcel.geometryHelper.title') }}</span>
        <span class="helper-subtitle">{{ t('parcel.geometryHelper.drawHint') }}</span>
      </div>

      <div class="toolbar-actions">
        <pv-button
          type="button"
          :label="t('parcel.geometryHelper.undo')"
          icon="pi pi-undo"
          size="small"
          severity="secondary"
          outlined
          :disabled="vertices.length === 0"
          @click="undoLastVertex"
        />
        <pv-button
          type="button"
          :label="t('parcel.geometryHelper.clear')"
          icon="pi pi-trash"
          size="small"
          severity="danger"
          outlined
          :disabled="vertices.length === 0"
          @click="clearPolygon"
        />
        <pv-button
          type="button"
          :label="t('map.controls.recenter')"
          icon="pi pi-compass"
          size="small"
          severity="secondary"
          outlined
          @click="fitMap"
        />
      </div>
    </div>

    <div class="presets-bar">
      <span class="presets-label">{{ t('parcel.geometryHelper.presetsLabel') }}</span>
      <div class="presets-row">
        <pv-button
          v-for="(preset, index) in PRESETS"
          :key="index"
          :label="preset.name"
          size="small"
          severity="secondary"
          text
          type="button"
          class="preset-btn"
          @click="applyPreset(preset)"
        />
      </div>
    </div>

    <LeafletMapCanvas
      ref="mapRef"
      :vertices="vertices"
      :reference-vertices="referenceVertices"
      :editable="true"
      :height="height"
      @update:vertices="onVerticesChange"
    />

    <div class="metrics-bar">
      <div class="metrics-left">
        <span class="metric-pill">
          <i class="pi pi-map-marker"></i>
          {{ t('parcel.geometryHelper.verticesCount', { count: vertices.length }) }}
        </span>
        <span class="metric-pill metric-area">
          <i class="pi pi-chart-bar"></i>
          {{ t('parcel.geometryHelper.calculatedArea') }}:
          <strong>{{ liveAreaHectares.toFixed(2) }} ha</strong>
        </span>
      </div>

      <div class="metrics-right">
        <pv-tag
          :value="isValidPolygon ? t('parcel.geometryHelper.validPolygon') : t('parcel.geometryHelper.needMoreVertices')"
          :severity="isValidPolygon ? 'success' : 'warn'"
        />
        <pv-button
          type="button"
          :label="showAdvanced ? t('parcel.geometryHelper.hideAdvanced') : t('parcel.geometryHelper.showAdvanced')"
          :icon="showAdvanced ? 'pi pi-chevron-up' : 'pi pi-code'"
          size="small"
          text
          @click="showAdvanced = !showAdvanced"
        />
      </div>
    </div>

    <div v-if="hasInvalidRawInput" class="invalid-hint">
      {{ t('parcel.geometryHelper.invalidHint') }}
    </div>

    <textarea
      v-if="showAdvanced"
      id="parcel-geometry"
      :value="rawJson"
      rows="3"
      class="field-input geojson-textarea"
      :placeholder="t('parcel.geometryHelper.placeholder')"
      @input="onRawInput"
    ></textarea>
  </div>
</template>

<style scoped>
.geojson-helper {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.25rem;
}

.helper-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.toolbar-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.helper-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.helper-subtitle {
  font-size: 0.78rem;
  color: var(--p-text-muted-color, #94a3b8);
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.presets-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.presets-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color, #94a3b8);
}

.presets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.preset-btn {
  font-size: 0.75rem !important;
  padding: 0.2rem 0.55rem !important;
}

.metrics-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.metrics-left,
.metrics-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color, #94a3b8);
}

.metric-area {
  color: #4ade80;
}

.geojson-textarea {
  width: 100%;
  font-family: monospace;
  font-size: 0.785rem;
  resize: vertical;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.65);
  color: var(--p-text-color);
}

.invalid-hint {
  font-size: 0.75rem;
  color: #f87171;
}
</style>
