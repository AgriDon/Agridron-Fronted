<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { FincaUseCases } from '@/fieldManagement/application/finca-use-cases.js'
import { ParcelaUseCases } from '@/fieldManagement/application/parcela-use-cases.js'
import { MissionUseCases } from '@/flightOperations/application/mission-use-cases.js'

const { t } = useI18n()

// Shared data layer for farms, parcels and mission persistence.
const farmUseCases = new FincaUseCases()
const parcelUseCases = new ParcelaUseCases()
const missionUseCases = new MissionUseCases()

const farms = ref([])
const parcels = ref([])
const crops = ref([])
const missions = ref([])
const loading = ref(true)
const errorMessage = ref('')

const selectedFarmId = ref(null)
const selectedParcelId = ref(null)
const treatmentType = ref('Fungicida')
const productName = ref('Fungicida 48%')
const productDose = ref('2.0')
const missionDate = ref(new Date().toISOString().slice(0, 10))
const missionTime = ref('08:00')
const missionNotes = ref('')
const activeStep = ref(1)
const saving = ref(false)
const submitMessage = ref('')

// Builds a lookup for crop names so the parcel card can show the correct crop.
const cropNameById = computed(() => {
  const map = {}

  for (const crop of crops.value) {
    map[crop.id] = crop.name
  }

  return map
})

const farmOptions = computed(() =>
  farms.value.map((farm) => ({
    label: farm.name,
    value: farm.id,
    image: farm.image,
    location: farm.location
  }))
)

const parcelOptions = computed(() =>
  parcels.value
    .filter((parcel) => Number(parcel.farmId) === Number(selectedFarmId.value))
    .map((parcel) => ({
      label: parcel.name,
      value: parcel.id,
      image: parcel.image,
      area: parcel.area,
      cropId: parcel.cropId,
      farmId: parcel.farmId
    }))
)

const selectedFarm = computed(() =>
  farms.value.find((farm) => Number(farm.id) === Number(selectedFarmId.value)) ?? null
)

const selectedParcel = computed(() =>
  parcels.value.find((parcel) => Number(parcel.id) === Number(selectedParcelId.value)) ?? null
)

const selectedCrop = computed(() => {
  if (!selectedParcel.value) return t('crop.noCrop')
  return cropNameById.value[selectedParcel.value.cropId] ?? t('crop.noCrop')
})

const steps = computed(() => [
  { label: t('missions.wizard.step1') },
  { label: t('missions.wizard.step2') },
  { label: t('missions.wizard.step3') },
  { label: t('missions.wizard.step4') }
])

const canMoveForward = computed(() => {
  if (activeStep.value === 1) return Boolean(selectedFarmId.value && selectedParcelId.value)
  if (activeStep.value === 2) return Boolean(missionDate.value && missionTime.value)
  if (activeStep.value === 3) return Boolean(productName.value && productDose.value)
  return true
})

const currentImage = computed(() => {
  if (selectedParcel.value?.image) return selectedParcel.value.image
  if (selectedFarm.value?.image) return selectedFarm.value.image
  return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200'
})

const summaryDate = computed(() => {
  if (!missionDate.value || !missionTime.value) return 'No programada'
  return `${missionDate.value} ${missionTime.value}`
})

const getMissionStatusLabel = (status) => {
  const normalizedStatus = String(status ?? '').trim()

  if (normalizedStatus === 'Programada' || normalizedStatus === 'PLANNED') return t('missions.statusProgrammed')
  if (normalizedStatus === 'Iniciada' || normalizedStatus === 'STARTED') return t('missions.statusActive')
  if (normalizedStatus === 'En curso' || normalizedStatus === 'IN_PROGRESS') return t('missions.statusActive')
  if (normalizedStatus === 'Completada' || normalizedStatus === 'COMPLETED') return t('missions.statusCompleted')
  if (normalizedStatus === 'Pausada' || normalizedStatus === 'PAUSED') return t('missions.card.active')
  if (normalizedStatus === 'Cancelada' || normalizedStatus === 'CANCELLED') return t('missions.statusCancelled')
  if (normalizedStatus === 'Autorizada' || normalizedStatus === 'AUTHORIZED') return t('missions.statusProgrammed')

  return t('missions.statusProgrammed')
}

const getMissionStatusClass = (status) => {
  const normalizedStatus = String(status ?? '').trim()

  if (['Programada', 'PLANNED', 'Autorizada', 'AUTHORIZED'].includes(normalizedStatus)) {
    return 'scheduled'
  }

  return 'active'
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [farmList, parcelList, cropList, missionList] = await Promise.all([
      farmUseCases.listFarms(),
      parcelUseCases.listParcels(),
      parcelUseCases.listCrops(),
      missionUseCases.listMissions()
    ])

    farms.value = farmList
    parcels.value = parcelList
    crops.value = cropList
    missions.value = missionList

    if (farmList[0]) {
      selectedFarmId.value = farmList[0].id
    }

    const firstFarmParcels = parcelList.filter(
      (parcel) => Number(parcel.farmId) === Number(selectedFarmId.value)
    )

    if (firstFarmParcels[0]) {
      selectedParcelId.value = firstFarmParcels[0].id
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const onFarmChange = () => {
  const firstParcelFromFarm = parcelOptions.value[0]
  selectedParcelId.value = firstParcelFromFarm ? firstParcelFromFarm.value : null
}

const nextStep = () => {
  if (!canMoveForward.value) return

  if (activeStep.value < 4) {
    activeStep.value += 1
  }
}

const prevStep = () => {
  if (activeStep.value > 1) {
    activeStep.value -= 1
  }
}

const submitMission = async () => {
  if (!selectedParcel.value) return

  saving.value = true
  submitMessage.value = ''

  try {
    const missionDateTime = new Date(`${missionDate.value}T${missionTime.value}:00`).toISOString()

    await missionUseCases.createMission({
      farmId: selectedFarmId.value,
      parcelId: selectedParcelId.value,
      farmArea: selectedParcel.value.name,
      cropType: selectedCrop.value,
      operator: 'Juan Perez',
      treatmentType: treatmentType.value,
      product: productName.value,
      productDose: productDose.value,
      notes: missionNotes.value,
      status: 'Programada',
      progress: 10,
      date: missionDateTime
    })

    missions.value = await missionUseCases.listMissions()
    submitMessage.value = t('missions.success')
    activeStep.value = 1
    treatmentType.value = 'Fungicida'
    productName.value = 'Fungicida 48%'
    productDose.value = '2.0'
    missionNotes.value = ''
    missionDate.value = new Date().toISOString().slice(0, 10)
    missionTime.value = '08:00'
    selectedParcelId.value = parcelOptions.value[0]?.value ?? null
  } catch (error) {
    submitMessage.value = error.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mission-management-view">
    <div class="mission-shell">
      <h1 class="mission-title">{{ t('missions.newTitle') }}</h1>

      <div class="stepper" aria-label="Mission wizard">
        <div v-for="(step, index) in steps" :key="step.label" class="step-item">
          <div
            class="step-bullet"
            :class="{
              active: activeStep === index + 1,
              done: activeStep > index + 1
            }"
          >
            {{ index + 1 }}
          </div>
          <span class="step-label">{{ step.label }}</span>
          <span v-if="index < steps.length - 1" class="step-line"></span>
        </div>
      </div>

      <div v-if="loading" class="mission-loading">
        <pv-skeleton height="440px" />
      </div>

      <pv-message v-else-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </pv-message>

      <div v-else class="mission-panel">
        <div class="mission-form-panel">
          <h2 v-if="activeStep === 1" class="panel-title">{{ t('missions.wizard.step1') }}</h2>
          <h2 v-else-if="activeStep === 2" class="panel-title">{{ t('missions.wizard.step2') }}</h2>
          <h2 v-else-if="activeStep === 3" class="panel-title">{{ t('missions.wizard.step3') }}</h2>
          <h2 v-else class="panel-title">{{ t('missions.wizard.step4') }}</h2>

          <div v-if="activeStep === 1" class="step-content">
            <div class="selector-row">
              <div class="select-group">
                <label>{{ t('missions.form.farm') }}</label>
                <select v-model="selectedFarmId" @change="onFarmChange">
                  <option v-for="farm in farmOptions" :key="farm.value" :value="farm.value">
                    {{ farm.label }}
                  </option>
                </select>
              </div>

              <div class="select-group">
                <label>{{ t('missions.form.parcel') }}</label>
                <select v-model="selectedParcelId">
                  <option v-for="parcel in parcelOptions" :key="parcel.value" :value="parcel.value">
                    {{ parcel.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mission-image-frame">
              <img :src="currentImage" :alt="selectedFarm?.name || t('parcel.selectParcel')" />
              <div class="map-toolbar">
                <button type="button" class="map-tool">+</button>
                <button type="button" class="map-tool">−</button>
                <button type="button" class="map-tool">◎</button>
              </div>
            </div>
          </div>

          <div v-else-if="activeStep === 2" class="step-content compact-grid">
            <div class="field-group">
              <label>{{ t('missions.form.date') }}</label>
              <input v-model="missionDate" type="date" />
            </div>

            <div class="field-group">
              <label>{{ t('missions.form.time') }}</label>
              <input v-model="missionTime" type="time" />
            </div>
          </div>

          <div v-else-if="activeStep === 3" class="step-content compact-grid">
            <div class="field-group">
              <label>{{ t('missions.form.product') }}</label>
              <select v-model="productName">
                <option value="Fungicida 48%">{{ t('missions.form.products.Fungicida 48%') }}</option>
                <option value="Insecticida 25%">{{ t('missions.form.products.Insecticida 25%') }}</option>
                <option value="Herbicida 70%">{{ t('missions.form.products.Herbicida 70%') }}</option>
                <option value="Mezcla nutricional">{{ t('missions.form.products.Mezcla nutricional') }}</option>
              </select>
            </div>

            <div class="field-group">
              <label>{{ t('missions.form.dose') }}</label>
              <input v-model="productDose" type="number" min="0" step="0.1" />
            </div>

            <div class="field-group full-width">
              <label>{{ t('missions.form.notes') }}
                <span class="field-hint">{{ t('missions.form.imageHint') }}</span>
              </label>
              <textarea v-model="missionNotes" rows="5" :placeholder="t('missions.form.imageHint')"></textarea>
            </div>
          </div>

          <div v-else class="step-content summary-content">
            <div class="list-row">
              <span>{{ t('missions.summary.farm') }}</span>
              <strong>{{ selectedFarm?.name ?? '—' }}</strong>
            </div>
            <div class="list-row">
              <span>{{ t('missions.summary.parcel') }}</span>
              <strong>{{ selectedParcel?.name ?? '—' }}</strong>
            </div>
            <div class="list-row">
              <span>{{ t('missions.summary.crop') }}</span>
              <strong>{{ selectedCrop }}</strong>
            </div>
            <div class="list-row">
              <span>{{ t('missions.summary.area') }}</span>
              <strong>{{ selectedParcel?.area ?? '0' }} ha</strong>
            </div>
            <div class="list-row">
              <span>{{ t('missions.summary.dateTime') }}</span>
              <strong>{{ summaryDate }}</strong>
            </div>
            <div class="list-row">
              <span>{{ t('missions.summary.treatmentType') }}</span>
              <strong>{{ t('missions.form.treatmentTypes.' + treatmentType) }}</strong>
            </div>
            <div class="list-row">
              <span>{{ t('missions.summary.product') }}</span>
              <strong>{{ t('missions.form.products.' + productName) }} / {{ productDose }} L/ha</strong>
            </div>
          </div>
        </div>

        <aside class="summary-panel">
          <div class="summary-header">
            <h3>{{ t('missions.summary.areaSelected') }}</h3>
            <div class="summary-area">{{ selectedParcel?.area ?? '0' }} ha</div>
          </div>

          <div class="summary-field">
            <span class="summary-label">{{ t('missions.summary.crop') }}</span>
            <strong>{{ selectedCrop }}</strong>
          </div>

          <div class="summary-field">
            <span class="summary-label">{{ t('missions.summary.treatmentType') }}</span>
            <select v-model="treatmentType">
              <option value="Fungicida">{{ t('missions.form.treatmentTypes.Fungicida') }}</option>
              <option value="Herbicida">{{ t('missions.form.treatmentTypes.Herbicida') }}</option>
              <option value="Insecticida">{{ t('missions.form.treatmentTypes.Insecticida') }}</option>
              <option value="Fertilizante">{{ t('missions.form.treatmentTypes.Fertilizante') }}</option>
            </select>
          </div>

          <div class="summary-field">
            <span class="summary-label">{{ t('missions.summary.dateTime') }}</span>
            <strong>{{ summaryDate }}</strong>
          </div>

          <div class="summary-field">
            <span class="summary-label">{{ t('missions.summary.product') }}</span>
            <strong>{{ t('missions.form.products.' + productName) }}</strong>
          </div>

          <div class="action-stack">
            <pv-button
              class="continue-button"
              :label="activeStep === 4 ? t('missions.save') : t('missions.next')"
              icon="pi pi-arrow-right"
              @click="activeStep === 4 ? submitMission() : nextStep()"
              :loading="saving"
            />

            <pv-button
              v-if="activeStep > 1"
              class="back-button"
              severity="secondary"
              text
              :label="t('missions.back')"
              icon="pi pi-arrow-left"
              @click="prevStep"
            />
          </div>

          <pv-message v-if="submitMessage" :severity="submitMessage.includes(t('missions.success')) ? 'success' : 'error'" :closable="false">
            {{ submitMessage }}
          </pv-message>
        </aside>
      </div>

      <section class="mission-list-panel">
        <div class="mission-list-header">
          <h2>{{ t('missions.noMissionsPrompt') }}</h2>
        </div>

        <div v-if="missions.length === 0" class="mission-empty">
          {{ t('missions.noMissions') }}
        </div>

        <div v-else class="mission-card-grid">
          <article v-for="mission in missions" :key="mission.id" class="mission-card">
            <div class="mission-card-top">
              <span class="mission-badge" :class="(mission.status === 'PLANNED' || mission.status === 'Programada') ? 'scheduled' : 'active'">
                {{ t('missions.status.' + (mission.status || 'PLANNED')) }}
              </span>
              <span class="mission-id">{{ t('missions.mission') }} #{{ mission.id }}</span>
            </div>

            <h3>{{ mission.farmArea || t('missions.card.farmArea') }}</h3>
            <p><strong>{{ t('missions.cropLabel') }}:</strong> {{ mission.cropType || t('crop.noCrop') }}</p>
            <p><strong>{{ t('missions.card.operator') }}:</strong> {{ mission.operator || t('missions.card.operator') }}</p>
            <p><strong>{{ t('missions.card.date') }}:</strong> {{ new Date(mission.date || Date.now()).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) }}</p>

            <div class="progress-block">
              <div class="progress-meta">
                <span>{{ t('missions.card.progress') }}</span>
                <strong>{{ mission.progress || 10 }}%</strong>
              </div>
              <div class="progress-bar">
                <span :style="{ width: `${mission.progress || 10}%` }"></span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.mission-management-view {
  width: 100%;
  min-height: calc(100vh - 86px);
  background: #0b0d0f;
  padding: 2.5rem 0 3rem;
}

.mission-shell {
  width: min(1220px, calc(100% - 2.5rem));
  margin: 0 auto;
}

.mission-title {
  margin: 0 0 1.75rem;
  font-size: clamp(2.3rem, 2vw, 3.2rem);
  font-weight: 800;
  color: #f8fafc;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #cbd5e1;
  font-weight: 700;
}

.step-bullet {
  width: 3.35rem;
  height: 3.35rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  color: #e2e8f0;
  font-size: 1.6rem;
  font-weight: 800;
  border: 3px solid #273141;
  transition: all 0.2s ease;
}

.step-bullet.active {
  background: #1ec0a9;
  border-color: #27d2b8;
  color: #0b1120;
  box-shadow: 0 0 0 5px rgba(30, 192, 169, 0.12);
}

.step-bullet.done {
  background: #3bc7b3;
  border-color: #52d8c5;
  color: #07111b;
}

.step-label {
  font-size: 1.08rem;
  font-weight: 700;
}

.step-line {
  width: 3.4rem;
  height: 2px;
  background: rgba(148, 163, 184, 0.4);
  display: inline-block;
}

.mission-panel {
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(290px, 0.9fr);
  gap: 1.5rem;
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 24px;
  box-shadow: 0 18px 45px rgba(2, 6, 23, 0.42);
  padding: 2rem;
}

.mission-form-panel {
  background: #151b22;
  border-radius: 18px;
  padding: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.panel-title {
  margin: 0 0 1.25rem;
  font-size: 2rem;
  color: #f8fafc;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selector-row,
.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.select-group,
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-group label,
.field-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #dfe7f1;
}

select,
input,
textarea {
  appearance: none;
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  min-height: 3.25rem;
  padding: 0.8rem 1rem;
  color: #f8fafc;
  font-size: 1rem;
  outline: none;
}

textarea {
  min-height: 8rem;
  resize: vertical;
}

select:focus,
input:focus,
textarea:focus {
  border-color: rgba(30, 192, 169, 0.9);
  box-shadow: 0 0 0 3px rgba(30, 192, 169, 0.12);
}

.mission-image-frame {
  position: relative;
  width: 100%;
  min-height: 430px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #0f172a;
}

.mission-image-frame img {
  width: 100%;
  height: 100%;
  min-height: 430px;
  object-fit: cover;
  display: block;
  filter: saturate(1.1) contrast(1.05);
}

.map-toolbar {
  position: absolute;
  left: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-tool {
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.2);
  background: rgba(255, 255, 255, 0.85);
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
}

.summary-panel {
  background: #171f28;
  border-radius: 18px;
  padding: 1.4rem 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-header {
  margin-bottom: 0.4rem;
}

.summary-panel h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #f8fafc;
}

.summary-area {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.1;
}

.summary-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.summary-label {
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-field strong {
  color: #f8fafc;
  font-size: 1.12rem;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.continue-button {
  width: 100%;
  background: #1ec0a9 !important;
  border: none !important;
  border-radius: 12px !important;
  height: 3.25rem !important;
  font-weight: 800 !important;
}

.back-button {
  width: 100%;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #dfe7f1;
}

.list-row strong {
  color: #f8fafc;
  text-align: right;
}

.summary-content {
  gap: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.mission-loading {
  background: rgba(17, 24, 39, 0.8);
  border-radius: 18px;
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.mission-list-panel {
  margin-top: 2rem;
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
}

.mission-list-header h2 {
  margin: 0 0 1.25rem;
  color: #f8fafc;
  font-size: 1.8rem;
}

.mission-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.mission-card {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 1rem;
  color: #e5e7eb;
}

.mission-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
}

.mission-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.mission-badge.scheduled {
  background: rgba(250, 204, 21, 0.14);
  color: #facc15;
}

.mission-badge.active {
  background: rgba(34, 197, 94, 0.13);
  color: #4ade80;
}

.mission-id {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.mission-card h3 {
  color: #f8fafc;
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}

.mission-card p {
  margin: 0.35rem 0;
  color: #d1d5db;
}

.progress-block {
  margin-top: 1rem;
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #dfe7f1;
}

.progress-bar {
  width: 100%;
  height: 0.6rem;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #2dd4bf);
  border-radius: inherit;
}

.mission-empty {
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 1rem;
}

@media (max-width: 960px) {
  .mission-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .selector-row,
  .compact-grid {
    grid-template-columns: 1fr;
  }

  .stepper {
    justify-content: flex-start;
  }

  .step-label {
    display: none;
  }
}
</style>
