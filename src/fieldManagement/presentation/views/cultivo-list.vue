<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CultivoUseCases } from '@/fieldManagement/application/cultivo-use-cases.js'

const { t } = useI18n()

const emit = defineEmits(['edit', 'delete'])

const crops = ref([])
const loading = ref(true)
const errorMessage = ref('')

const useCases = new CultivoUseCases()

let disposed = false

onUnmounted(() => {
  disposed = true
})

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const cropList = await useCases.listCrops()

    if (disposed) return

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
  <div class="cultivo-list">
    <div v-if="loading" class="cultivo-grid" aria-busy="true">
      <pv-skeleton v-for="index in 3" :key="index" class="cultivo-card-skeleton" />
    </div>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-else-if="crops.length === 0" class="cultivo-empty">
      <i class="pi pi-seed"></i>
      <p>{{ t('crop.empty') }}</p>
    </div>

    <div v-else class="cultivo-grid">
      <pv-card v-for="crop in crops" :key="crop.id" class="cultivo-card">
        <template #title>
          <span class="cultivo-card-name">{{ crop.name }}</span>
        </template>

        <template #subtitle>
          <span class="cultivo-card-variety">{{ crop.variety || t('crop.noVariety') }}</span>
        </template>

        <template #content>
          <p class="cultivo-card-detail">
            <i class="pi pi-info-circle"></i>
            {{ t('crop.information') }}: {{ crop.name }}
          </p>
        </template>

        <template #footer>
          <div class="cultivo-card-actions">
            <pv-button
              :label="t('crop.button.edit')"
              icon="pi pi-pencil"
              text
              @click="emit('edit', crop.id)"
            />
            <pv-button
              :label="t('crop.button.delete')"
              icon="pi pi-trash"
              text
              severity="danger"
              @click="emit('delete', crop.id)"
            />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.cultivo-list {
  width: 100%;
}

.cultivo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1100px) {
  .cultivo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .cultivo-grid {
    grid-template-columns: 1fr;
  }
}

.cultivo-card-skeleton {
  height: 15rem;
}

.cultivo-card :deep(.p-card-body) {
  padding-top: 0;
}

:deep(.p-card-title) {
  margin-top: 21px;
}

.cultivo-card-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.cultivo-card-variety {
  font-size: 0.9rem;
  color: var(--p-text-color);
  opacity: 0.62;
}

.cultivo-card-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.35rem;
  color: var(--p-text-color);
}

.cultivo-card-detail i {
  color: var(--p-primary-color);
}

.cultivo-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.cultivo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--p-text-color);
  opacity: 0.6;
}

.cultivo-empty i {
  font-size: 2.5rem;
}

.cultivo-empty p {
  margin: 0;
  font-weight: 600;
}
</style>