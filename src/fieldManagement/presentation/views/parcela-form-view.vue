<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { ParcelaUseCases, ParcelValidationError } from '@/fieldManagement/application/parcela-use-cases.js'
import GeojsonPolygonHelper from '../components/geojson-polygon-helper.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new ParcelaUseCases()

const form = ref({
  name: '',
  area: '',
  geometry: '',
  farmId: null,
  cropId: null,
  image: '',
  phenologicalStage: ''
})

const errors = ref({})
const farms = ref([])
const crops = ref([])
const loading = ref(true)
const saving = ref(false)
const submitError = ref('')

const parcelId = computed(() => route.params.id ?? null)
const isEditing = computed(() => parcelId.value !== null)

const titleKey = computed(() =>
  isEditing.value ? 'parcel.form.edit-title' : 'parcel.form.new-title'
)

const farmOptions = computed(() =>
  farms.value.map(farm => ({ id: Number(farm.id), label: farm.name }))
)

const cropOptions = computed(() =>
  crops.value.map(crop => ({
    id: Number(crop.id),
    label: crop.variety ? `${crop.name} (${crop.variety})` : crop.name
  }))
)

const stageOptions = [
  { label: 'Vegetativo', value: 'Vegetativo' },
  { label: 'Floración', value: 'Floración' },
  { label: 'Fructificación', value: 'Fructificación' },
  { label: 'Maduración', value: 'Maduración' }
]

const errorFor = (field) => (errors.value[field] ? t(errors.value[field]) : '')

const applyForm = (parcel) => {
  form.value = {
    name: parcel.name ?? '',
    area: parcel.area != null ? String(parcel.area) : '',
    geometry: typeof parcel.geometry === 'string'
      ? parcel.geometry
      : (parcel.geometry ? JSON.stringify(parcel.geometry) : ''),
    farmId: parcel.farmId != null ? Number(parcel.farmId) : null,
    cropId: parcel.cropId != null ? Number(parcel.cropId) : null,
    image: parcel.image ?? '',
    phenologicalStage: parcel.phenologicalStage ?? ''
  }
}

const load = async () => {
  loading.value = true
  submitError.value = ''

  try {
    const [farmList, cropList] = await Promise.all([
      useCases.listFarms(),
      useCases.listCrops()
    ])

    farms.value = farmList
    crops.value = cropList

    if (isEditing.value) {
      applyForm(await useCases.getParcel(parcelId.value))
    }
  } catch (error) {
    submitError.value = error.message
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  errors.value = {}
  submitError.value = ''
  saving.value = true

  try {
    if (isEditing.value) {
      await useCases.updateParcel(parcelId.value, form.value)
    } else {
      await useCases.createParcel(form.value)
    }

    await router.push('/parcelas')
  } catch (error) {
    if (error instanceof ParcelValidationError) {
      errors.value = error.errors
    } else {
      submitError.value = error.message
    }
  } finally {
    saving.value = false
  }
}

const cancel = () => router.push('/parcelas')

onMounted(load)
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t(titleKey) }}</h1>
    </div>

    <div v-if="loading" class="form-skeleton" aria-busy="true">
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
    </div>

    <form v-else class="parcel-form" novalidate @submit.prevent="onSubmit">
      <pv-message v-if="submitError" severity="error" :closable="false">
        {{ submitError }}
      </pv-message>

      <div class="field">
        <label class="field-label" for="parcel-name">{{ t('parcel.form.name') }}</label>
        <pv-input-text
          id="parcel-name"
          v-model="form.name"
          :invalid="!!errors.name"
          class="field-input"
        />
        <small v-if="errors.name" class="field-error">{{ errorFor('name') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="parcel-area">{{ t('parcel.form.area') }}</label>
        <pv-input-text
          id="parcel-area"
          v-model="form.area"
          type="number"
          step="0.1"
          :invalid="!!errors.area"
          class="field-input"
        />
        <small v-if="errors.area" class="field-error">{{ errorFor('area') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="parcel-geometry">{{ t('parcel.form.geometry') }}</label>
        <GeojsonPolygonHelper
          v-model="form.geometry"
          @update:area="(val) => { if (!form.area) form.area = String(val) }"
        />
        <small v-if="errors.geometry" class="field-error">{{ errorFor('geometry') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="parcel-stage">{{ t('parcel.form.phenologicalStage') }}</label>
        <pv-select
          id="parcel-stage"
          v-model="form.phenologicalStage"
          :options="stageOptions"
          option-label="label"
          option-value="value"
          class="field-input"
          :placeholder="t('parcel.form.stagePlaceholder')"
        />
      </div>

      <div class="field">
        <label class="field-label" for="parcel-farm">{{ t('parcel.form.farm') }}</label>
        <pv-select
          id="parcel-farm"
          v-model="form.farmId"
          :options="farmOptions"
          option-label="label"
          option-value="id"
          :invalid="!!errors.farmId"
          class="field-input"
          :placeholder="t('parcel.selectFarm')"
        />
        <small v-if="errors.farmId" class="field-error">{{ errorFor('farmId') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="parcel-crop">{{ t('parcel.form.crop') }}</label>
        <pv-select
          id="parcel-crop"
          v-model="form.cropId"
          :options="cropOptions"
          option-label="label"
          option-value="id"
          :invalid="!!errors.cropId"
          class="field-input"
          :placeholder="t('parcel.form.crop')"
        />
        <small v-if="errors.cropId" class="field-error">{{ errorFor('cropId') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="parcel-image">
          {{ t('parcel.form.image') }}
          <span class="field-hint">{{ t('parcel.form.imageHint') }}</span>
        </label>
        <pv-input-text
          id="parcel-image"
          v-model="form.image"
          class="field-input"
        />
      </div>

      <div class="form-actions">
        <pv-button
          :label="t('farm.cancel')"
          severity="secondary"
          text
          type="button"
          @click="cancel"
        />
        <pv-button
          :label="isEditing ? t('parcel.form.update') : t('parcel.form.create')"
          icon="pi pi-check"
          type="submit"
          :loading="saving"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
  max-width: 40rem;
}

.header-section {
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0;
}

.form-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.parcel-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--p-content-background, #1e293b);
  border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  padding: 1.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.field-hint {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--p-text-muted-color, #94a3b8);
  margin-left: 0.35rem;
}

.field-input {
  width: 100%;
}

.field-error {
  color: var(--p-red-500, #ef4444);
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.08));
}
</style>
