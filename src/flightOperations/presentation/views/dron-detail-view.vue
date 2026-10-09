<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { DroneUseCases } from '@/flightOperations/application/dron-use-cases.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new DroneUseCases()

const drone = ref(null)
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')

const droneId = computed(() => route.params.id)

const load = async () => {
  loading.value = true

  try {
    drone.value = await useCases.getDrone(droneId.value)
  } catch (error) {
    if (/not found/i.test(error.message)) {
      notFound.value = true
    } else {
      errorMessage.value = error.message
    }
  } finally {
    loading.value = false
  }
}

const onEdit = () => {
  router.push({ name: 'drones-edit', params: { id: droneId.value } })
}

const showDeleteDialog = ref(false)
const deleting = ref(false)
const deleteError = ref('')

const onDelete = () => {
  deleteError.value = ''
  showDeleteDialog.value = true
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  deleteError.value = ''
}

const confirmDelete = async () => {
  deleting.value = true
  deleteError.value = ''

  try {
    await useCases.deleteDrone(droneId.value)
    cancelDelete()
    await router.push('/drones')
  } catch (error) {
    deleteError.value = error.message
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t('drone.information') }}</h1>
    </div>

    <div v-if="loading" aria-busy="true">
      <pv-skeleton height="3rem"></pv-skeleton>
      <pv-skeleton height="3rem"></pv-skeleton>
    </div>

    <pv-message v-else-if="notFound" severity="warn" :closable="false">
      {{ t('drone.notFound') }}
    </pv-message>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-else-if="drone" class="detail-card">
      <img
          v-if="drone.urlimg"
          :src="drone.urlimg"
          :alt="drone.modelName"
          class="detail-image"
      />
      <p v-else class="detail-no-photo">{{ t('drone.noPhoto') }}</p>

      <dl class="detail-list">
        <dt>{{ t('drone.model') }}</dt>
        <dd>{{ drone.modelName }}</dd>

        <dt>{{ t('drone.serial') }}</dt>
        <dd>{{ drone.serialNumber }}</dd>

        <dt>{{ t('drone.capacity') }}</dt>
        <dd>{{ drone.capacity }} L</dd>

        <dt>{{ t('drone.statusLabel') }}</dt>
        <dd>{{ t(`drone.status.${drone.status}`) }}</dd>
      </dl>

      <div class="detail-actions">
        <pv-button
            :label="t('drone.button.edit')"
            icon="pi pi-pencil"
            text
            @click="onEdit"
        />
        <pv-button
            :label="t('drone.button.delete')"
            icon="pi pi-trash"
            text
            severity="danger"
            @click="onDelete"
        />
      </div>
    </div>

    <pv-dialog v-model:visible="showDeleteDialog" modal :style="{ width: '26rem' }">
      <template #header>
        <span class="dialog-title">{{ t('drone.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('drone.delete-confirm') }}</p>

      <pv-message v-if="deleteError" severity="error" :closable="false">
        {{ deleteError }}
      </pv-message>

      <template #footer>
        <pv-button
            :label="t('farm.cancel')"
            severity="secondary"
            text
            @click="cancelDelete"
        />
        <pv-button
            :label="t('drone.button.delete')"
            icon="pi pi-trash"
            severity="danger"
            :loading="deleting"
            @click="confirmDelete"
        />
      </template>
    </pv-dialog>

    <pv-button
        :label="t('parcel.detail.back')"
        icon="pi pi-arrow-left"
        text
        class="back-button"
        @click="router.push('/drones')"
    />
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
  max-width: 44rem;
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

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-image {
  width: 100%;
  max-height: 18rem;
  object-fit: cover;
  border-radius: 8px;
}

.detail-no-photo {
  margin: 0;
  opacity: 0.6;
}

.detail-list {
  display: grid;
  grid-template-columns: 9rem 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}

.detail-list dt {
  font-weight: 700;
  color: var(--p-text-color);
}

.detail-list dd {
  margin: 0;
  color: var(--p-text-color);
  opacity: 0.8;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.back-button {
  margin-top: 1.5rem;
}
</style>
