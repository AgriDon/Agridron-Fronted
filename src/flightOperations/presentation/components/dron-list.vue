<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'
import { CAPACITY_RANGES } from './capacity-ranges.js'

const props = defineProps({
  status: { type: String, default: null },
  capacity: { type: String, default: null }
})

const emit = defineEmits(['view', 'edit', 'delete'])

const { t } = useI18n()
const useCases = new DroneUseCases()

const drones = ref([])
const loading = ref(true)
const errorMessage = ref('')

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    drones.value = await useCases.listDrones()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

watch(() => [props.status, props.capacity], () => {
  // Client-side filtering reacts immediately
})

const filteredDrones = computed(() => {
  const range = CAPACITY_RANGES.find((r) => r.key === props.capacity)

  return drones.value.filter((drone) => {
    const matchesStatus = !props.status || drone.status === props.status
    const matchesCapacity = !range || range.matches(Number(drone.capacity))

    return matchesStatus && matchesCapacity
  })
})

const badgeClass = (status) =>
  `drone-badge--${String(status).toLowerCase().replace(/_/g, '-')}`

const getBatterySeverity = (level) => {
  if (level > 60) return 'success'
  if (level >= 25) return 'warn'
  return 'danger'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
  } catch {
    return '-'
  }
}

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
          <div>
            <h3 class="drone-name" @click="emit('view', drone.id)">{{ drone.modelName }}</h3>
            <p class="drone-detail">
              <span class="detail-label">{{ t('drone.serial') }}:</span>
              <strong>{{ drone.serialNumber }}</strong>
            </p>
            <p class="drone-detail">
              <span class="detail-label">{{ t('drone.capacity') }}:</span>
              <span>{{ drone.capacity }} L</span>
            </p>
            <p class="drone-detail">
              <span class="detail-label">{{ t('drone.flightHours') }}:</span>
              <span>{{ drone.flightHours }} h</span>
            </p>

            <!-- Battery Level Indicator -->
            <div class="battery-indicator">
              <span class="detail-label">{{ t('drone.battery') }}:</span>
              <div class="battery-bar-wrapper">
                <pv-progressbar
                  :value="drone.batteryLevel"
                  :show-value="false"
                  :class="`battery-bar--${getBatterySeverity(drone.batteryLevel)}`"
                  style="height: 0.5rem; flex: 1"
                />
                <span class="battery-text" :class="`text-${getBatterySeverity(drone.batteryLevel)}`">
                  {{ drone.batteryLevel }}%
                </span>
              </div>
            </div>
          </div>

          <div class="drone-actions">
            <pv-button
              :label="t('drone.button.edit')"
              icon="pi pi-pencil"
              size="small"
              text
              @click="emit('edit', drone.id)"
            />
            <pv-button
              :label="t('drone.button.delete')"
              icon="pi pi-trash"
              size="small"
              severity="danger"
              text
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
  padding: 0.85rem;
  border-radius: 12px;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.drone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
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
  padding: 0.25rem 0;
  border-radius: 8px 8px 0 0;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  background: #64748b;
  letter-spacing: 0.03em;
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

.drone-badge--paused {
  background: #f59e0b;
}

.drone-badge--maintenance,
.drone-badge--maintenance-soon {
  background: #ea580c;
  color: #fff;
}

.drone-badge--out-of-service {
  background: #dc2626;
}

.drone-image {
  width: 100%;
  height: 100%;
  min-height: 8.5rem;
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
  margin: 0 0 0.4rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--p-text-color);
  cursor: pointer;
}

.drone-name:hover {
  color: var(--p-primary-color, #16a34a);
}

.drone-detail {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--p-text-color);
}

.detail-label {
  opacity: 0.75;
}

.battery-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-top: 0.35rem;
}

.battery-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 55%;
}

.battery-text {
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 2.2rem;
  text-align: right;
}

.text-success { color: #16a34a; }
.text-warn { color: #d97706; }
.text-danger { color: #dc2626; }

.drone-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--p-content-border-color, #e2e8f0);
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
