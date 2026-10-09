
<script setup>
import { computed ,onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {CAPACITY_RANGES} from "@/flightOperations/presentation/components/capacity-ranges.js";

import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'

const { t } = useI18n()

const emit = defineEmits(['view', 'edit', 'delete'])

const props = defineProps({
  // Status to show (e.g. 'AVAILABLE'). null = all.
  status: { type: String, default: null },
  // Capacity in liters. null = all.
  capacity: { type: String, default: null }
})

const drones = ref([])
const loading = ref(true)
const errorMessage = ref('')

const useCases = new DroneUseCases()

let disposed = false

onUnmounted(() => {
  disposed = true
})

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const droneList = await useCases.listDrones()

    if (disposed) return

    drones.value = droneList
  } catch (error) {
    if (disposed) return

    errorMessage.value = error.message
  } finally {
    if (!disposed) {
      loading.value = false
    }
  }
}


/**
 * Allow filter drones for capacity
 * @type {ComputedRef<UnwrapRefSimple<*>[]>}
 */
const filteredDrones = computed(() => {
  const range = CAPACITY_RANGES.find((r) => r.key === props.capacity)

  return drones.value.filter((drone) => {
    const matchesStatus = !props.status || drone.status === props.status
    const matchesCapacity = !range || range.matches(Number(drone.capacity))

    return matchesStatus && matchesCapacity
  })
})

// Maps the status value to a CSS modifier (e.g. IN_FLIGHT -> in-flight).
const badgeClass = (status) =>
    `drone-badge--${String(status).toLowerCase().replace(/_/g, '-')}`

load()
</script>

<template>
  <div class="drone-list">
    <div v-if="loading" class="drone-grid" aria-busy="true">
      <pv-skeleton v-for="index in 4" :key="index" class="drone-card-skeleton" />
    </div>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>


    <div v-else-if="filteredDrones.length === 0" class="drone-empty">
      <i class="pi pi-send"></i>
      <p>{{ t('drone.empty') }}</p>
    </div>

    <div v-else class="drone-grid">
      <article v-for="drone in filteredDrones" :key="drone.id" class="drone-card">
        <div class="drone-media" @click="emit('view', drone.id)">
          <span class="drone-badge" :class="badgeClass(drone.status)">
            {{ t(`drone.status.${drone.status}`) }}
          </span>

          <img
              v-if="drone.urlimg"
              :src="drone.urlimg"
              :alt="drone.modelName"
              class="drone-image"
          />
          <div v-else class="drone-image drone-image--empty">
            {{ t('drone.noPhoto') }}
          </div>
        </div>

        <div class="drone-info">
          <h3 class="drone-name">{{ drone.modelName }}</h3>
          <p class="drone-detail">{{ t('drone.serial') }}: {{ drone.serialNumber }}</p>
          <p class="drone-detail">{{ t('drone.capacity') }}: {{ drone.capacity }} L</p>

          <div class="drone-actions">
            <pv-button
                :label="t('drone.button.edit')"
                icon="pi pi-pencil"
                size="small"
                @click="emit('edit', drone.id)"
            />
            <pv-button
                :label="t('drone.button.delete')"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                outlined
                @click="emit('delete', drone.id)"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.drone-list {
  width: 100%;
}

.drone-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 800px) {
  .drone-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 540px) {
  .drone-card {
    flex-direction: column;
  }
  .drone-media {
    flex: 0 0 auto;
    width: 100%;
    height: 11rem;
  }
}

.drone-card-skeleton {
  height: 10rem;
}

.drone-card {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
}

.drone-media {
  position: relative;
  flex: 0 0 11rem;
  cursor: pointer;
}

.drone-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  padding: 0.2rem 0;
  border-radius: 8px 8px 0 0;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  background: #64748b;
}

.drone-badge--available {
  background: #16a34a;
}

.drone-badge--assigned {
  background: #2563eb;
}

.drone-badge--in-flight {
  background: #7c3aed;
}

.drone-badge--maintenance,
.drone-badge--maintenance-soon {
  background: #eab308;
  color: #1f2937;
}

.drone-image {
  width: 100%;
  height: 100%;
  min-height: 8rem;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.drone-image--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-form-field-background, #f1f5f9);
  color: var(--p-text-color);
  opacity: 0.6;
  font-size: 0.85rem;
}

.drone-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.drone-name {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--p-text-color);
}

.drone-detail {
  margin: 0;
  color: var(--p-text-color);
  opacity: 0.8;
}

.drone-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.drone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--p-text-color);
  opacity: 0.6;
}

.drone-empty i {
  font-size: 2.5rem;
}

.drone-empty p {
  margin: 0;
  font-weight: 600;
}
</style>