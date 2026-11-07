<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MissionUseCases } from '@/flightOperations/application/mission-use-cases.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mission: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'completed'])

const { t } = useI18n()
const useCases = new MissionUseCases()

const completing = ref(false)
const errorMessage = ref('')

const form = ref({
  treatedAreaHectares: '',
  closingNotes: '',
  completedAt: ''
})

watch(() => props.mission, (m) => {
  if (m) {
    form.value = {
      treatedAreaHectares: m.plannedAreaHectares ? String(m.plannedAreaHectares) : '1.0',
      closingNotes: '',
      completedAt: new Date().toISOString().slice(0, 16)
    }
  }
}, { immediate: true })

watch(() => props.visible, (v) => {
  if (v) errorMessage.value = ''
})

const close = () => {
  emit('update:visible', false)
}

const onConfirm = async () => {
  if (!props.mission) return

  completing.value = true
  errorMessage.value = ''

  try {
    await useCases.completeMission(props.mission.id, {
      treatedAreaHectares: form.value.treatedAreaHectares ? Number(form.value.treatedAreaHectares) : null,
      closingNotes: form.value.closingNotes,
      completedAt: form.value.completedAt ? new Date(form.value.completedAt).toISOString() : new Date().toISOString()
    })

    emit('completed')
    close()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    completing.value = false
  }
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :header="t('mission.complete.title', 'Completar Misión de Aspersión (TR-005)')"
    :style="{ width: '32rem', maxWidth: '95vw' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="complete-dialog-content">
      <pv-message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </pv-message>

      <p class="dialog-description">
        {{ t('mission.complete.desc', 'Al completar la misión, el dron asignado quedará automáticamente liberado y disponible para nuevas operaciones.') }}
      </p>

      <div class="form-field">
        <label class="form-label">
          {{ t('mission.complete.treatedArea', 'Área Total Tratada (ha)') }} <span class="required">*</span>
        </label>
        <pv-input-text
          v-model="form.treatedAreaHectares"
          type="number"
          step="0.01"
          min="0.01"
          class="w-full"
        />
      </div>

      <div class="form-field">
        <label class="form-label">
          {{ t('mission.complete.completedAt', 'Fecha y Hora de Cierre') }}
        </label>
        <input
          v-model="form.completedAt"
          type="datetime-local"
          class="p-inputtext w-full"
        />
      </div>

      <div class="form-field">
        <label class="form-label">
          {{ t('mission.complete.closingNotes', 'Observaciones Finales / Notas de Campo') }}
        </label>
        <textarea
          v-model="form.closingNotes"
          rows="3"
          class="p-inputtext w-full"
          :placeholder="t('mission.complete.notesPlaceholder', 'Ej. Cobertura uniforme completada sin incidencias técnicas.')"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="t('farm.cancel', 'Cancelar')"
        severity="secondary"
        text
        @click="close"
      />
      <pv-button
        :label="t('mission.complete.submit', 'Finalizar y Liberar Dron')"
        icon="pi pi-check-circle"
        severity="success"
        :loading="completing"
        @click="onConfirm"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.complete-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dialog-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--p-text-color);
  opacity: 0.8;
  line-height: 1.4;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--p-text-color);
}

.required {
  color: var(--p-red-500, #ef4444);
}
</style>
