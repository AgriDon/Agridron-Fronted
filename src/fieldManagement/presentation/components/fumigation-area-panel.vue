<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FumigationAreaUseCases } from '@/fieldManagement/application/fumigation-area-use-cases.js';
import GeojsonPolygonHelper from './geojson-polygon-helper.vue';

const { t } = useI18n();

const props = defineProps({
  parcelId: {
    type: [Number, String],
    required: true
  },
  parcelGeometry: {
    type: String,
    default: ''
  }
});

const useCases = new FumigationAreaUseCases();

const areas = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const showDialog = ref(false);
const saving = ref(false);
const saveError = ref('');

const form = ref({
  geometry: '',
  area: 0
});

const load = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    areas.value = await useCases.listFumigationAreas(props.parcelId);
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  saveError.value = '';
  // Suggest a sub-polygon if parcel geometry exists
  form.value = {
    geometry: props.parcelGeometry || '',
    area: 0
  };
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  saveError.value = '';
};

const onSave = async () => {
  saveError.value = '';
  saving.value = true;
  try {
    await useCases.createFumigationArea({
      parcelId: props.parcelId,
      geometry: form.value.geometry,
      area: form.value.area
    });
    closeDialog();
    await load();
  } catch (err) {
    saveError.value = err.message;
  } finally {
    saving.value = false;
  }
};

const onDelete = async (id) => {
  try {
    await useCases.deleteFumigationArea(id);
    await load();
  } catch (err) {
    errorMessage.value = err.message;
  }
};

onMounted(load);
</script>

<template>
  <div class="fumigation-panel">
    <div class="panel-header">
      <div>
        <h3 class="panel-title">{{ t('parcel.fumigation.title') }}</h3>
        <p class="panel-subtitle">{{ t('parcel.fumigation.subtitle') }}</p>
      </div>
      <pv-button
        :label="t('parcel.fumigation.newArea')"
        icon="pi pi-plus"
        size="small"
        @click="openCreateDialog"
      />
    </div>

    <pv-message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-if="loading" aria-busy="true">
      <pv-skeleton height="2.5rem" class="mb-2" />
      <pv-skeleton height="2.5rem" />
    </div>

    <div v-else-if="areas.length === 0" class="empty-state">
      <i class="pi pi-map-marker text-2xl text-muted mb-2"></i>
      <p>{{ t('parcel.fumigation.noAreas') }}</p>
    </div>

    <div v-else class="areas-grid">
      <div v-for="area in areas" :key="area.id" class="area-card">
        <div class="area-card-top">
          <span class="area-badge">Zona #{{ area.id }}</span>
          <span class="area-size">{{ area.area }} ha</span>
        </div>
        <div class="area-actions">
          <pv-button
            icon="pi pi-trash"
            severity="danger"
            text
            size="small"
            :aria-label="t('parcel.fumigation.delete')"
            @click="onDelete(area.id)"
          />
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <pv-dialog
      v-model:visible="showDialog"
      modal
      :header="t('parcel.fumigation.dialogTitle')"
      :style="{ width: '30rem' }"
    >
      <pv-message v-if="saveError" severity="error" :closable="false">
        {{ saveError }}
      </pv-message>

      <div class="dialog-body">
        <p class="dialog-hint">{{ t('parcel.fumigation.dialogHint') }}</p>
        <GeojsonPolygonHelper
          v-model="form.geometry"
          @update:area="(val) => form.area = val"
        />
      </div>

      <template #footer>
        <pv-button
          :label="t('parcel.fumigation.cancel')"
          severity="secondary"
          text
          @click="closeDialog"
        />
        <pv-button
          :label="t('parcel.fumigation.save')"
          icon="pi pi-check"
          :loading="saving"
          @click="onSave"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.fumigation-panel {
  background: var(--p-content-background, #1e293b);
  border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.panel-subtitle {
  font-size: 0.8rem;
  color: var(--p-text-muted-color, #94a3b8);
  margin: 0.15rem 0 0;
}

.empty-state {
  text-align: center;
  padding: 1.5rem 0;
  color: var(--p-text-muted-color, #94a3b8);
  font-size: 0.875rem;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.area-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.area-card-top {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.area-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #38bdf8;
}

.area-size {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-hint {
  font-size: 0.825rem;
  color: var(--p-text-muted-color);
  margin: 0;
}
</style>
