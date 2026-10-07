<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import ParcelaList from '@/fieldManagement/presentation/views/parcela-list.vue'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'

const { t } = useI18n()
const router = useRouter()

const useCases = new ParcelaUseCases()

const showDeleteDialog = ref(false)
const parcelIdToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref('')

const listKey = ref(0)

const onDelete = (id) => {
  parcelIdToDelete.value = id
  deleteError.value = ''
  showDeleteDialog.value = true
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  parcelIdToDelete.value = null
  deleteError.value = ''
}

const confirmDelete = async () => {
  deleting.value = true
  deleteError.value = ''

  try {
    await useCases.deleteParcel(parcelIdToDelete.value)
    cancelDelete()
    listKey.value++
  } catch (error) {
    deleteError.value = error.message
  } finally {
    deleting.value = false
  }
}

const onCreate = () => {
  router.push({ name: 'parcelas-edit' })
}

const onEdit = (id) => {
  router.push({ name: 'parcelas-edit', params: { id } })
}

const onSeeMore = (id) => {
  router.push({ name: 'parcela-detail', params: { id } })
}
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <div>
        <h1 class="view-title">{{ t('parcel.title') }}</h1>
        <p class="view-subtitle">{{ t('parcel.subtitle') }}</p>
      </div>

      <pv-button
        :label="t('parcel.newParcel')"
        icon="pi pi-plus-circle"
        @click="onCreate"
      />
    </div>

    <ParcelaList
      :key="listKey"
      @seeMore="onSeeMore"
      @edit="onEdit"
      @delete="onDelete"
    />

    <pv-dialog
      v-model:visible="showDeleteDialog"
      modal
      :style="{ width: '26rem' }"
    >
      <template #header>
        <span class="dialog-title">{{ t('parcel.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('parcel.delete-confirm') }}</p>

      <pv-message
        v-if="deleteError"
        severity="error"
        :closable="false"
      >
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
          :label="t('parcel.button.delete')"
          icon="pi pi-trash"
          severity="danger"
          :loading="deleting"
          @click="confirmDelete"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}

.header-section {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0 0 0.5rem 0;
}

.view-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-text-color);
  opacity: 0.65;
  margin: 0;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.dialog-message {
  margin: 0;
  color: var(--p-text-color);
  opacity: 0.75;
  line-height: 1.5;
}
</style>