<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'

const { t } = useI18n()

const emit = defineEmits(['seeMore', 'edit', 'delete'])

const parcels = ref([])
const crops = ref([])
const loading = ref(true)
const errorMessage = ref('')

const useCases = new ParcelaUseCases()

// The assembler does not resolve the crop entity on each parcel, so the card
// label comes from the crops collection, matched by cropId.
const cropNameById = computed(() => {
  const map = {}

  for (const crop of crops.value) {
    map[crop.id] = crop.name
  }

  return map
})

const cropLabel = (parcel) =>
  parcel.crop?.name ?? cropNameById.value[parcel.cropId] ?? null

const onImageError = (event) => {
  event.target.style.visibility = 'hidden'
}

let disposed = false

onUnmounted(() => {
  disposed = true
})

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [parcelList, cropList] = await Promise.all([
      useCases.listParcels(),
      useCases.listCrops()
    ])

    if (disposed) return

    parcels.value = parcelList
    crops.value = cropList
  } catch (error) {
    if (disposed) return

    errorMessage.value = error.message
  } finally {
    if (!disposed) {
      loading.value = false
    }
  }
}

load()
</script>

<template>
  <div class="parcel-list">
    <div v-if="loading" class="parcel-grid" aria-busy="true">
      <pv-skeleton v-for="index in 3" :key="index" class="parcel-card-skeleton" />
    </div>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-else-if="parcels.length === 0" class="parcel-empty">
      <i class="pi pi-inbox"></i>
      <p>{{ t('parcel.empty') }}</p>
    </div>

    <div v-else class="parcel-grid">
      <pv-card v-for="parcel in parcels" :key="parcel.id" class="parcel-card">
        <template #title>
          <span class="parcel-card-name">{{ parcel.name }}</span>
        </template>

        <template #subtitle>
          <span class="parcel-card-crop">{{ cropLabel(parcel) ?? t('parcel.noCrop') }}</span>
        </template>

        <template #header>
          <img
            v-if="parcel.image"
            :src="parcel.image"
            :alt="parcel.name"
            class="parcel-card-image"
            @error="onImageError"
          />
        </template>

        <template #content>
          <p class="parcel-card-detail">
            <i class="pi pi-map"></i>
            {{ t('parcel.area') }}: {{ parcel.area }} ha
          </p>
          <p class="parcel-card-detail">
            <i class="pi pi-home"></i>
            {{ t('parcel.farm') }}: #{{ parcel.farmId }}
          </p>
        </template>

        <template #footer>
          <div class="parcel-card-actions">
            <pv-button
              :label="t('parcel.button.seeMore')"
              icon="pi pi-arrow-right"
              text
              @click="emit('seeMore', parcel.id)"
            />
            <pv-button
              :label="t('parcel.button.edit')"
              icon="pi pi-pencil"
              text
              @click="emit('edit', parcel.id)"
            />
            <pv-button
              :label="t('parcel.button.delete')"
              icon="pi pi-trash"
              text
              severity="danger"
              @click="emit('delete', parcel.id)"
            />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.parcel-list {
  width: 100%;
}

.parcel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1100px) {
  .parcel-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .parcel-grid {
    grid-template-columns: 1fr;
  }
}

.parcel-card-skeleton {
  height: 15rem;
}

.parcel-card :deep(.p-card-body) {
  padding-top: 0;
}

:deep(.p-card-title) {
  margin-top: 21px;
}

.parcel-card-image {
  width: 100%;
  height: 10rem;
  object-fit: cover;
  display: block;
}

.parcel-card-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.parcel-card-crop {
  font-size: 0.9rem;
  color: var(--p-text-color);
  opacity: 0.62;
}

.parcel-card-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.35rem;
  color: var(--p-text-color);
}

.parcel-card-detail i {
  color: var(--p-primary-color);
}

.parcel-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.parcel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--p-text-color);
  opacity: 0.6;
}

.parcel-empty i {
  font-size: 2.5rem;
}

.parcel-empty p {
  margin: 0;
  font-weight: 600;
}
</style>