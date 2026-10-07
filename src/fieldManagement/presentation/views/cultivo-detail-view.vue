<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { CultivoUseCases } from '@/fieldManagement/application/cultivo-use-cases.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new CultivoUseCases()

const crop = ref(null)
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')
const deleting = ref(false)
const deleteError = ref('')

const cropId = computed(() => route.params.id)

const load = async () => {
  loading.value = true

  try {
    crop.value = await useCases.getCrop(cropId.value)
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
  router.push({ name: 'cultivos-edit', params: { id: cropId.value } })
}

const onDelete = () => {
  cropIdToDelete.value = cropId.value
  deleteError.value = ''
  showDeleteDialog.value = true
}

const cropIdToDelete = ref(null)
const showDeleteDialog = ref(false)

const cancelDelete = () => {
  showDeleteDialog.value = false
  cropIdToDelete.value = null
  deleteError.value = ''
}

const confirmDelete = async () => {
  deleting.value = true
  deleteError.value = ''

  try {
    await useCases.deleteCrop(cropIdToDelete.value)
    cancelDelete()
    await router.push('/cultivos')
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
      <h1 class="view-title">{{ t('crop.information') }}</h1>
    </div>

    <div v-if="loading" aria-busy="true">
      <pv-skeleton height="3rem"></pv-skeleton>
      <pv-skeleton height="3rem"></pv-skeleton>
    </div>

    <pv-message v-else-if="notFound" severity="warn" :closable="false">
      {{ t('crop.notFound') }}
    </pv-message>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-else-if="crop" class="detail-card">
      <dl class="detail-list">
        <dt>{{ t('crop.form.name') }}</dt>
        <dd>{{ crop.name }}</dd>

        <dt>{{ t('crop.variety') }}</dt>
        <dd>{{ crop.variety || t('crop.noVariety') }}</dd>
      </dl>

      <div class="detail-actions">
        <pv-button
          :label="t('crop.button.edit')"
          icon="pi pi-pencil"
          text
          @click="onEdit"
        />
        <pv-button
          :label="t('crop.button.delete')"
          icon="pi pi-trash"
          text
          severity="danger"
          @click="onDelete"
        />
      </div>
    </div>

    <pv-dialog
      v-model:visible="showDeleteDialog"
      modal
      :style="{ width: '26rem' }"
    >
      <template #header>
        <span class="dialog-title">{{ t('crop.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('crop.delete-confirm') }}</p>

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
          :label="t('crop.button.delete')"
          icon="pi pi-trash"
          severity="danger"
          :loading="deleting"
          @click="confirmDelete"
        />
      </template>
    </pv-dialog>

    <pv-button
      :label="t('crop.back')"
      icon="pi pi-arrow-left"
      text
      class="back-button"
      @click="router.push('/cultivos')"
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

.detail-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 600;
}

.detail-link:hover {
  text-decoration: underline;
}

.geometry {
  display: block;
  background: var(--p-form-field-background, #f1f5f9);
  border: 1px solid var(--p-content-border-color, #cbd5e1);
  border-radius: 6px;
  padding: 0.6rem;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--p-text-color);
}

.back-button {
  margin-top: 1.5rem;
}

.detail-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 600;
}

.detail-link:hover {
  text-decoration: underline;
}
</style>
