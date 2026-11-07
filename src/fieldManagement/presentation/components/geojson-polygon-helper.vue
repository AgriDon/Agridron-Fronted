<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'update:area']);

// Default preset coordinates (e.g. Cañete / Ica)
const PRESETS = [
  {
    name: 'Valle de Cañete (Polígono 12.5 ha)',
    coords: [
      [-76.395, -13.075],
      [-76.385, -13.075],
      [-76.385, -13.085],
      [-76.395, -13.085],
      [-76.395, -13.075]
    ],
    area: 12.5
  },
  {
    name: 'Ica - San Rafael (Polígono 8.3 ha)',
    coords: [
      [-76.140, -14.070],
      [-76.130, -14.070],
      [-76.130, -14.078],
      [-76.140, -14.078],
      [-76.140, -14.070]
    ],
    area: 8.3
  },
  {
    name: 'Mendoza - Uva (Polígono 20.0 ha)',
    coords: [
      [-68.840, -32.890],
      [-68.825, -32.890],
      [-68.825, -32.902],
      [-68.840, -32.902],
      [-68.840, -32.890]
    ],
    area: 20.0
  }
];

const selectedPreset = ref(null);
const rawJson = ref(props.modelValue || '');

watch(() => props.modelValue, (newVal) => {
  if (newVal !== rawJson.value) {
    rawJson.value = newVal || '';
  }
});

const parsedCoordinates = computed(() => {
  try {
    if (!rawJson.value) return [];
    const parsed = JSON.parse(rawJson.value);
    if (parsed.type === 'Polygon' && Array.isArray(parsed.coordinates) && parsed.coordinates[0]) {
      return parsed.coordinates[0];
    }
  } catch {
    return [];
  }
  return [];
});

const isValidGeoJson = computed(() => parsedCoordinates.value.length >= 3);

// Converts longitude/latitude points to normalized 2D SVG points [0..200]
const svgPoints = computed(() => {
  const coords = parsedCoordinates.value;
  if (!coords || coords.length < 3) return '';

  const lngs = coords.map(c => Number(c[0]));
  const lats = coords.map(c => Number(c[1]));

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const spanLng = (maxLng - minLng) || 0.0001;
  const spanLat = (maxLat - minLat) || 0.0001;

  const padding = 20;
  const width = 200 - padding * 2;
  const height = 140 - padding * 2;

  return coords.map(([lng, lat]) => {
    const x = padding + ((Number(lng) - minLng) / spanLng) * width;
    const y = padding + (1 - (Number(lat) - minLat) / spanLat) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
});

const applyPreset = (preset) => {
  if (!preset) return;
  const geojson = {
    type: 'Polygon',
    coordinates: [preset.coords]
  };
  const jsonStr = JSON.stringify(geojson);
  rawJson.value = jsonStr;
  emit('update:modelValue', jsonStr);
  emit('update:area', preset.area);
};

const onRawInput = (e) => {
  const val = e.target.value;
  rawJson.value = val;
  emit('update:modelValue', val);
};
</script>

<template>
  <div class="geojson-helper">
    <div class="helper-header">
      <span class="helper-title">{{ t('parcel.geometryHelper.title') }}</span>
      <div class="presets-row">
        <pv-button
          v-for="(p, i) in PRESETS"
          :key="i"
          :label="p.name"
          size="small"
          severity="secondary"
          outlined
          type="button"
          class="preset-btn"
          @click="applyPreset(p)"
        />
      </div>
    </div>

    <!-- Live SVG Silhouette Preview -->
    <div v-if="isValidGeoJson" class="preview-box">
      <div class="preview-badge">{{ t('parcel.geometryHelper.previewBadge') }} ({{ parsedCoordinates.length }} vértices)</div>
      <svg class="polygon-svg" viewBox="0 0 200 140">
        <polygon :points="svgPoints" class="polygon-shape" />
        <circle
          v-for="(pt, idx) in svgPoints.split(' ')"
          :key="idx"
          :cx="pt.split(',')[0]"
          :cy="pt.split(',')[1]"
          r="3"
          class="polygon-vertex"
        />
      </svg>
    </div>
    <div v-else-if="rawJson" class="invalid-hint">
      {{ t('parcel.geometryHelper.invalidHint') }}
    </div>

    <textarea
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

.helper-header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.helper-title {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--p-text-muted-color, #94a3b8);
}

.presets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.preset-btn {
  font-size: 0.75rem !important;
  padding: 0.3rem 0.6rem !important;
}

.preview-box {
  position: relative;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 140px;
}

.preview-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.7rem;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.polygon-svg {
  width: 100%;
  max-width: 220px;
  height: 120px;
}

.polygon-shape {
  fill: rgba(34, 197, 94, 0.2);
  stroke: #22c55e;
  stroke-width: 2;
  stroke-linejoin: round;
}

.polygon-vertex {
  fill: #4ade80;
  stroke: #0f172a;
  stroke-width: 1;
}

.geojson-textarea {
  font-family: monospace;
  font-size: 0.785rem;
  resize: vertical;
}

.invalid-hint {
  font-size: 0.75rem;
  color: #f87171;
}
</style>
