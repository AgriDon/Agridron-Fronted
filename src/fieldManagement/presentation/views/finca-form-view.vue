<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { FincaUseCases, FarmValidationError } from '@/fieldManagement/application/finca-use-cases.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new FincaUseCases()

const form = ref({
  name: '',
  location: '',
  ownerId: null,
  image: ''
})

const errors = ref({})
const users = ref([])
const loading = ref(true)
const saving = ref(false)
const submitError = ref('')

const farmId = computed(() => route.params.id ?? null)
const isEditing = computed(() => farmId.value !== null)

const titleKey = computed(() =>
  isEditing.value ? 'farm.form.edit-title' : 'farm.form.new-title'
)

// Users whose id is not in the user collection still own farms in the mock
// data (ownerId 5, 10, 12 have no matching user). Without this fallback the
// select would silently show the first user and rewriting the farm would
// change its owner.
const ownerOptions = computed(() => {
  const options = users.value.map(user => ({
    id: user.id,
    label: `${user.username} (${user.email})`
  }))

  const current = form.value.ownerId

  if (current !== null && !options.some(option => option.id === Number(current))) {
    options.unshift({ id: Number(current), label: t('farm.form.unknownOwner', { id: current }) })
  }

  return options
})

const errorFor = (field) => (errors.value[field] ? t(errors.value[field]) : '')

const applyForm = (farm) => {
  form.value = {
    name: farm.name,
    location: farm.location,
    ownerId: farm.ownerId,
    image: farm.image ?? ''
  }
}

const load = async () => {
  loading.value = true

  try {
    users.value = await useCases.listUsers()

    if (isEditing.value) {
      applyForm(await useCases.getFarm(farmId.value))
    }
  } catch (error) {
    submitError.value = error.message
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  errors.value = {}
  submitError.value = ''
  saving.value = true

  try {
    if (isEditing.value) {
      await useCases.updateFarm(farmId.value, form.value)
    } else {
      await useCases.createFarm(form.value)
    }

    await router.push('/fincas')
  } catch (error) {
    if (error instanceof FarmValidationError) {
      errors.value = error.errors
    } else {
      submitError.value = error.message
    }
  } finally {
    saving.value = false
  }
}

const cancel = () => router.push('/fincas')

onMounted(load)
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">{{ t(titleKey) }}</h1>
    </div>

    <div v-if="loading" class="form-skeleton" aria-busy="true">
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
      <pv-skeleton height="3rem" />
    </div>

    <form v-else class="farm-form" novalidate @submit.prevent="onSubmit">
      <pv-message v-if="submitError" severity="error" :closable="false">
        {{ submitError }}
      </pv-message>

      <div class="field">
        <label class="field-label" for="farm-name">{{ t('farm.form.name') }}</label>
        <pv-input-text
          id="farm-name"
          v-model="form.name"
          :invalid="!!errors.name"
          class="field-input"
        />
        <small v-if="errors.name" class="field-error">{{ errorFor('name') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="farm-location">{{ t('farm.form.location') }}</label>
        <pv-input-text
          id="farm-location"
          v-model="form.location"
          :invalid="!!errors.location"
          class="field-input"
        />
        <small v-if="errors.location" class="field-error">{{ errorFor('location') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="farm-owner">{{ t('farm.form.ownerId') }}</label>
        <pv-select
          id="farm-owner"
          v-model="form.ownerId"
          :options="ownerOptions"
          option-label="label"
          option-value="id"
          :invalid="!!errors.ownerId"
          class="field-input"
          :placeholder="t('farm.form.selectOwner')"
        />
        <small v-if="errors.ownerId" class="field-error">{{ errorFor('ownerId') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="farm-image">
          {{ t('farm.form.image') }}
          <span class="field-hint">{{ t('farm.form.imageHint') }}</span>
        </label>
        <pv-input-text
          id="farm-image"
          v-model="form.image"
          class="field-input"
        />
      </div>

      <div class="form-actions">
        <pv-button
          :label="t('farm.cancel')"
          severity="secondary"
          text
          type="button"
          @click="cancel"
        />
        <pv-button
          :label="isEditing ? t('farm.form.update') : t('farm.form.create')"
          icon="pi pi-check"
          type="submit"
          :loading="saving"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
  max-width: 40rem;
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

.form-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.farm-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.field-hint {
  font-weight: 400;
  opacity: 0.6;
  margin-left: 0.35rem;
}

.field-input {
  width: 100%;
}

.field-error {
  color: var(--p-red-500, #dc2626);
  font-size: 0.8rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>