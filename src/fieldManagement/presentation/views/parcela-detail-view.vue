<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'
import FumigationAreaPanel from '../components/fumigation-area-panel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new ParcelaUseCases()

const parcel = ref(null)
const cropName = ref('')
const farmName = ref('')
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')

const parcelId = computed(() => route.params.id)

const load = async () => {
  loading.value = true

  try {
    const found = await useCases.getParcel(parcelId.value)

    parcel.value = found

    try {
      const [crops, farms] = await Promise.all([
        useCases.listCrops(),
        useCases.listFarms()
      ])

      cropName.value = crops.find(crop => crop.id === found.cropId)?.name ?? ''
      farmName.value = farms.find(farm => farm.id === found.farmId)?.name ?? ''
    } catch {
      cropName.value = ''
      farmName.value = ''
    }
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

onMounted(load)
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t('parcel.detail.title') }}</h1>
    </div>

    <div v-if="loading" aria-busy="true">
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
    </div>

    <pv-message v-else-if="notFound" severity="warn" :closable="false">
      {{ t('parcel.detail.notFound') }}
    </pv-message>

    <pv-message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </pv-message>

    <div v-else-if="parcel" class="detail-card">
      <img
        v-if="parcel.image"
        :src="parcel.image"
        :alt="parcel.name"
        class="detail-image"
      />

      <dl class="detail-list">
        <dt>{{ t('parcel.detail.name') }}</dt>
        <dd>{{ parcel.name }}</dd>

        <dt>{{ t('parcel.area') }}</dt>
        <dd>{{ parcel.area }} ha</dd>

        <dt>{{ t('parcel.phenologicalStage') }}</dt>
        <dd>
          <span class="stage-tag">{{ parcel.phenologicalStage || t('parcel.noStage') }}</span>
        </dd>

        <dt>{{ t('parcel.form.farm') }}</dt>
        <dd>
          <router-link
            :to="{ name: 'fincas-edit', params: { id: parcel.farmId } }"
            class="detail-link"
          >
            {{ farmName || '#' + parcel.farmId }}
          </router-link>
        </dd>

        <dt>{{ t('parcel.form.crop') }}</dt>
        <dd>
          <router-link
            v-if="cropName"
            :to="{ name: 'cultivo-detail', params: { id: parcel.cropId } }"
            class="detail-link"
          >
            {{ cropName }}
          </router-link>
          <span v-else>{{ t('parcel.noCrop') }}</span>
        </dd>

        <dt>{{ t('parcel.detail.geometry') }}</dt>
        <dd><code class="geometry">{{ parcel.geometry }}</code></dd>
      </dl>

      <!-- Fumigation Areas Sub-Resource Panel -->
      <FumigationAreaPanel
        :parcel-id="parcel.id"
        :parcel-geometry="parcel.geometry"
      />
    </div>

    <pv-button
      :label="t('parcel.detail.back')"
      icon="pi pi-arrow-left"
      text
      class="back-button mt-4"
      @click="router.push('/parcelas')"
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
  border-radius: 12px;
}

.detail-list {
  display: grid;
  grid-template-columns: 12rem 1fr;
  row-gap: 0.85rem;
  column-gap: 1rem;
  margin: 0;
  background: var(--p-content-background, #1e293b);
  border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  padding: 1.25rem;
}

.detail-list dt {
  font-weight: 600;
  color: var(--p-text-muted-color, #94a3b8);
}

.detail-list dd {
  margin: 0;
  color: var(--p-text-color);
}

.stage-tag {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.detail-link {
  color: var(--p-primary-color, #22c55e);
  text-decoration: underline;
}

.geometry {
  font-family: monospace;
  font-size: 0.785rem;
  word-break: break-all;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  display: block;
}

.back-button {
  margin-top: 1.25rem;
}
</style>
