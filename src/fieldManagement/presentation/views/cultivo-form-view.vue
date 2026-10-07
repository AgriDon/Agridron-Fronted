<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { CultivoUseCases, CropValidationError } from '@/fieldManagement/application/cultivo-use-cases.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const useCases = new CultivoUseCases()

const form = ref({
  name: '',
  variety: ''
})

const errors = ref({})
const loading = ref(true)
const saving = ref(false)
const submitError = ref('')

const cropId = computed(() => route.params.id ?? null)
const isEditing = computed(() => cropId.value !== null)

const titleKey = computed(() =>
  isEditing.value ? 'crop.form.edit-title' : 'crop.form.new-title'
)

const errorFor = (field) => (errors.value[field] ? t(errors.value[field]) : '')

const applyForm = (crop) => {
  form.value = {
    name: crop.name,
    variety: crop.variety
  }
}

const load = async () => {
  loading.value = true

  try {
    if (isEditing.value) {
      const crop = await useCases.getCrop(cropId.value)
      form.value = {
        name: crop.name,
        variety: crop.variety
      }
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
      await useCases.updateCrop(cropId.value, form.value)
    } else {
      await useCases.createCrop(form.value)
    }

    await router.push('/cultivos')
  } catch (error) {
    if (error instanceof CropValidationError) {
      errors.value = error.errors
    } else {
      submitError.value = error.message
    }
  } finally {
    saving.value = false
  }
}

const cancel = () => router.push('/cultivos')

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
    </div>

    <form v-else class="crop-form" novalidate @submit.prevent="onSubmit">
      <pv-message v-if="submitError" severity="error" :closable="false">
        {{ submitError }}
      </pv-message>

      <div class="field">
        <label class="field-label" for="crop-name">{{ t('crop.form.name') }}</label>
        <pv-input-text
          id="crop-name"
          v-model="form.name"
          :invalid="!!errors.name"
          class="field-input"
        />
        <small v-if="errors.name" class="field-error">{{ errorFor('name') }}</small>
      </div>

      <div class="field">
        <label class="field-label" for="crop-variety">{{ t('crop.variety') }}</label>
        <pv-input-text
          id="crop-variety"
          v-model="form.variety"
          :invalid="!!errors.variety"
          class="field-input"
        />
        <small v-if="errors.variety" class="field-error">{{ errorFor('variety') }}</small>
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
          :label="isEditing ? t('crop.form.update') : t('crop.form.create')"
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

.crop-form {
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