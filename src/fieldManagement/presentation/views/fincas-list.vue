<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { FincaUseCases } from '@/fieldManagement/application/finca-use-cases.js'

const { t } = useI18n()

const emit = defineEmits(['edit', 'delete'])

const farms = ref([])
const parcels = ref([])
const loading = ref(true)
const errorMessage = ref('')

const useCases = new FincaUseCases()

const onImageError = (event) => {
  event.target.style.visibility = 'hidden'
}

const parcelCountByFarm = computed(() => {
  const counts = {}

  for (const parcel of parcels.value) {
    counts[parcel.farmId] = (counts[parcel.farmId] ?? 0) + 1
  }

  return counts
})

const parcelsFor = (farm) => parcelCountByFarm.value[farm.id] ?? 0

// load() is fired during setup and its promises can resolve after the user
// has already navigated away. Writing to the refs then would re-render an
// unmounted component, which throws "node is null" on the next patch.
let disposed = false

onUnmounted(() => {
  disposed = true
})

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [farmList, parcelList] = await Promise.all([
      useCases.listFarms(),
      useCases.listParcels()
    ])

    if (disposed) return

    farms.value = farmList
    parcels.value = parcelList
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
  <div class="farms-list">
    <!-- Loading state -->
    <div v-if="loading" class="farms-grid" aria-busy="true">
      <pv-skeleton v-for="index in 3" :key="index" class="farm-card-skeleton" />
    </div>

    <!-- Error state -->
    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <!-- Empty state -->
    <div v-else-if="farms.length === 0" class="farms-empty">
      <i class="pi pi-inbox"></i>
      <p>{{ t('farm.empty') }}</p>
    </div>

    <!-- Farm cards -->
    <div v-else class="farms-grid">
      <pv-card v-for="farm in farms" :key="farm.id" class="farm-card">
        <template #header>
          <img
            v-if="farm.image"
            :src="farm.image"
            :alt="farm.name"
            class="farm-card-image"
            @error="onImageError"
          />
        </template>

        <template #title>
          <span class="farm-card-name">{{ farm.name }}</span>
        </template>

        <template #subtitle>
          <span class="farm-card-location">{{ farm.location }}</span>
        </template>

        <template #content>
          <p class="farm-card-parcels">
            <i class="pi pi-map-marker"></i>
            {{ t('farm.parcelCount', { count: parcelsFor(farm) }) }}
          </p>
        </template>

        <template #footer>
          <div class="farm-card-actions">
            <pv-button
              :label="t('farm.button.edit')"
              icon="pi pi-pencil"
              text
              @click="emit('edit', farm.id)"
            />
            <pv-button
              :label="t('farm.button.delete')"
              icon="pi pi-trash"
              text
              severity="danger"
              @click="emit('delete', farm.id)"
            />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.farms-list {
  width: 100%;
}

/* 3 columns on desktop, 2 on tablet, 1 on mobile */
.farms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}



@media (max-width: 1100px) {
  .farms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .farms-grid {
    grid-template-columns: 1fr;
  }
}

.farm-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.farm-card-skeleton {
  height: 15rem;
}

/* Header image keeps the Material theme's padding out of the way */
.farm-card :deep(.p-card-body) {
  padding-top: 0;
}

/* :deep() is required: .p-card-title is rendered by PrimeVue, so the scoped
   data attribute of this component never lands on it. */
:deep(.p-card-title) {
  margin-top: 21px;
}

.farm-card-image {
  width: 100%;
  height: 10rem;
  object-fit: cover;
  display: block;
}

/* Colors come from PrimeVue tokens so the cards stay readable in both light
   and dark mode. PrimeVue 5 defaults to darkModeSelector: 'system', so a
   hardcoded light color here would vanish on a dark surface. */
.farm-card-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.farm-card-location {
  font-size: 0.9rem;
  /* PrimeVue 5 has no --p-text-color-secondary token; dim the themed text
     color instead of hardcoding a grey that breaks on dark surfaces. */
  color: var(--p-text-color);
  opacity: 0.62;
}

.farm-card-parcels {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.farm-card-parcels i {
  color: var(--p-primary-color);
}

.farm-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

/* Empty and error states */
.farms-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--p-text-color);
  opacity: 0.6;
}

.farms-empty i {
  font-size: 2.5rem;
}

.farms-empty p {
  margin: 0;
  font-weight: 600;
}
</style>