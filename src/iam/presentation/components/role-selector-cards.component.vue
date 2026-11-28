<script setup>
/**
 * Interactive radio-card selector for choosing the account role during registration.
 * Emits `Farmer` or `Operator` via `update:modelValue`.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { USER_ROLES } from '../../domain/model/user.entity.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: USER_ROLES.FARMER
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const roleOptions = computed(() => [
  {
    value: USER_ROLES.FARMER,
    label: t('iam.roles.farmer'),
    description: t('iam.roles.farmerDescription'),
    icon: 'pi pi-map'
  },
  {
    value: USER_ROLES.OPERATOR,
    label: t('iam.roles.operator'),
    description: t('iam.roles.operatorDescription'),
    icon: 'pi pi-send'
  }
])

/**
 * Emits the selected role value when the selector is enabled.
 *
 * @param {string} roleValue Selected role (`Farmer` | `Operator`).
 */
const selectRole = (roleValue) => {
  if (props.disabled) return
  emit('update:modelValue', roleValue)
}
</script>

<template>
  <div class="role-selector">
    <div class="role-cards-grid" role="radiogroup" :aria-label="t('iam.signUp.roleQuestion')">
      <button
        v-for="option in roleOptions"
        :key="option.value"
        type="button"
        role="radio"
        class="role-card"
        :class="{
          'role-card--selected': modelValue === option.value,
          'role-card--disabled': disabled
        }"
        :aria-checked="modelValue === option.value"
        :disabled="disabled"
        @click="selectRole(option.value)"
      >
        <span class="role-card-check" aria-hidden="true">
          <i v-if="modelValue === option.value" class="pi pi-check"></i>
        </span>

        <div class="role-icon-badge" aria-hidden="true">
          <i :class="option.icon"></i>
        </div>

        <span class="role-title">{{ option.label }}</span>
        <span class="role-description">{{ option.description }}</span>
      </button>
    </div>

    <small v-if="error" class="role-error">{{ error }}</small>
  </div>
</template>

<style scoped>
.role-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 1.1rem 0.9rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background-color: #ffffff;
  color: #1f2937;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.role-card:hover:not(:disabled) {
  border-color: #86efac;
  background-color: #f8fafc;
  transform: translateY(-1px);
}

.role-card:focus-visible {
  outline: 3px solid rgba(22, 163, 74, 0.35);
  outline-offset: 2px;
}

.role-card--selected {
  border-color: #16a34a;
  background-color: #f0fdf4;
  box-shadow: 0 4px 12px rgba(21, 128, 61, 0.14);
}

.role-card--selected:hover:not(:disabled) {
  border-color: #15803d;
  background-color: #f0fdf4;
}

.role-card--disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.role-card-check {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #ffffff;
  transition: all 0.2s ease;
}

.role-card--selected .role-card-check {
  border-color: #15803d;
  background-color: #15803d;
}

.role-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.role-card--selected .role-icon-badge {
  background-color: #dcfce7;
  color: #15803d;
}

.role-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.role-card--selected .role-title {
  color: #14532d;
}

.role-description {
  font-size: 0.8rem;
  line-height: 1.35;
  color: #64748b;
}

.role-card--selected .role-description {
  color: #166534;
}

.role-error {
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 500;
}

@media (max-width: 520px) {
  .role-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
