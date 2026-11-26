<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import ParcelaList from './parcela-list.vue'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'

const { t } = useI18n()
const router = useRouter()

const useCases = new ParcelaUseCases()

const statusFilter = ref('active')
const filterOptions = computed(() => [
  { label: t('parcel.filter.active'), value: 'active' },
  { label: t('parcel.filter.all'), value: 'all' },
  { label: t('parcel.filter.inactive'), value: 'inactive' }
])

const showDeactivateDialog = ref(false)
const parcelIdToDeactivate = ref(null)
const deactivating = ref(false)
const deactivateError = ref('')
const actionError = ref('')

const listKey = ref(0)

const onDeactivate = (id) => {
  parcelIdToDeactivate.value = id
  deactivateError.value = ''
  actionError.value = ''
  showDeactivateDialog.value = true
}

const cancelDeactivate = () => {
  showDeactivateDialog.value = false
  parcelIdToDeactivate.value = null
  deactivateError.value = ''
}

const confirmDeactivate = async () => {
  deactivating.value = true
  deactivateError.value = ''

  try {
    await useCases.deactivateParcel(parcelIdToDeactivate.value)
    cancelDeactivate()
    listKey.value++
  } catch (error) {
    deactivateError.value = error.message
  } finally {
    deactivating.value = false
  }
}

const onActivate = async (id) => {
  actionError.value = ''
  try {
    await useCases.activateParcel(id)
    listKey.value++
  } catch (error) {
    actionError.value = error.message
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

    <div class="filter-bar">
      <pv-select-button
        v-model="statusFilter"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
    </div>

    <pv-message
      v-if="actionError"
      severity="error"
      :closable="true"
      class="mb-3"
      @close="actionError = ''"
    >
      {{ actionError }}
    </pv-message>

    <ParcelaList
      :key="listKey"
      :status-filter="statusFilter"
      @see-more="onSeeMore"
      @edit="onEdit"
      @deactivate="onDeactivate"
      @activate="onActivate"
    />

    <pv-dialog
      v-model:visible="showDeactivateDialog"
      modal
      :style="{ width: '28rem' }"
    >
      <template #header>
        <span class="dialog-title">{{ t('parcel.deactivate.title') }}</span>
      </template>

      <p class="dialog-message">{{ t('parcel.deactivate.confirm') }}</p>

      <pv-message
        v-if="deactivateError"
        severity="error"
        :closable="false"
        class="mt-3"
      >
        {{ deactivateError }}
      </pv-message>

      <template #footer>
        <pv-button
          :label="t('parcel.cancel')"
          severity="secondary"
          text
          @click="cancelDeactivate"
        />
        <pv-button
          :label="t('parcel.button.deactivate')"
          icon="pi pi-ban"
          severity="warn"
          :loading="deactivating"
          @click="confirmDeactivate"
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
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  opacity: 0.85;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .header-section {
    margin-bottom: 1rem;
  }
  .view-title {
    font-size: 1.5rem;
  }
  .view-subtitle {
    font-size: 0.95rem;
  }
}
</style>
