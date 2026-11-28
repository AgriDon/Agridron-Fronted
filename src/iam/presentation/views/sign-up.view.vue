<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'
import { USER_ROLES } from '../../domain/model/user.entity.js'
import { validatePasswordStrength } from '../../domain/model/sign-up.request.js'
import { useIamStore } from '../../application/iam.store.js'
import RoleSelectorCards from '../components/role-selector-cards.component.vue'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,19}$/

const { t } = useI18n()
const router = useRouter()
const iamStore = useIamStore()

const form = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: USER_ROLES.FARMER
})

const fieldErrors = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: ''
})

const showPassword = ref(false)
const submitting = ref(false)
const signUpError = ref('')
const registrationSuccess = ref(false)
const registeredEmail = ref('')

const passwordCheck = computed(() => validatePasswordStrength(form.password))

const passwordRules = computed(() => [
  { key: 'minLength', label: t('iam.signUp.passwordRules.minLength'), met: passwordCheck.value.rules.minLength },
  { key: 'hasUppercase', label: t('iam.signUp.passwordRules.hasUppercase'), met: passwordCheck.value.rules.hasUppercase },
  { key: 'hasLowercase', label: t('iam.signUp.passwordRules.hasLowercase'), met: passwordCheck.value.rules.hasLowercase },
  { key: 'hasNumber', label: t('iam.signUp.passwordRules.hasNumber'), met: passwordCheck.value.rules.hasNumber },
  { key: 'hasSpecial', label: t('iam.signUp.passwordRules.hasSpecial'), met: passwordCheck.value.rules.hasSpecial }
])

const validateForm = () => {
  fieldErrors.fullName = ''
  fieldErrors.email = ''
  fieldErrors.phoneNumber = ''
  fieldErrors.password = ''
  fieldErrors.role = ''

  if (!form.fullName.trim()) {
    fieldErrors.fullName = t('iam.signUp.fullNameRequired')
  } else if (form.fullName.trim().length < 3) {
    fieldErrors.fullName = t('iam.signUp.fullNameMinLength')
  }

  if (!form.email.trim()) {
    fieldErrors.email = t('iam.signUp.emailRequired')
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    fieldErrors.email = t('iam.signUp.emailInvalid')
  }

  if (!form.phoneNumber.trim()) {
    fieldErrors.phoneNumber = t('iam.signUp.phoneNumberRequired')
  } else if (!PHONE_PATTERN.test(form.phoneNumber.trim())) {
    fieldErrors.phoneNumber = t('iam.signUp.phoneNumberInvalid')
  }

  if (!form.password) {
    fieldErrors.password = t('iam.signUp.passwordRequired')
  } else if (!passwordCheck.value.isValid) {
    fieldErrors.password = t('iam.signUp.passwordWeak')
  }

  if (!form.role) {
    fieldErrors.role = t('iam.signUp.roleRequired')
  }

  return (
    !fieldErrors.fullName &&
    !fieldErrors.email &&
    !fieldErrors.phoneNumber &&
    !fieldErrors.password &&
    !fieldErrors.role
  )
}

const handleSignUp = async () => {
  signUpError.value = ''
  if (!validateForm()) {
    if (form.password && !passwordCheck.value.isValid) {
      signUpError.value = t('iam.signUp.passwordWeak')
    }
    return
  }

  submitting.value = true
  try {
    await iamStore.signUp({
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
      role: form.role
    })
    registeredEmail.value = form.email.trim()
    registrationSuccess.value = true
  } catch (err) {
    signUpError.value = err?.message || t('iam.signUp.signUpError')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-topbar">
      <LanguageSwitcher />
    </div>

    <div class="auth-card">
      <template v-if="registrationSuccess">
        <div class="success-state">
          <div class="success-icon-circle" aria-hidden="true">
            <i class="pi pi-envelope"></i>
          </div>
          <img src="/Agridron_Logo.png" alt="AgriDron Solutions" class="auth-logo auth-logo--compact" />
          <h1 class="auth-title">{{ t('iam.signUp.successTitle') }}</h1>
          <p class="success-description">
            {{ t('iam.signUp.successMessage', { email: registeredEmail }) }}
          </p>
          <pv-button
            type="button"
            :label="t('iam.signUp.goToSignIn')"
            icon="pi pi-sign-in"
            class="primary-submit-btn"
            @click="router.push('/sign-in')"
          />
        </div>
      </template>

      <template v-else>
        <div class="card-nav-row">
          <button
            type="button"
            class="back-btn"
            :aria-label="t('iam.signUp.back')"
            @click="router.push('/sign-in')"
          >
            <i class="pi pi-chevron-left"></i>
            <span>{{ t('iam.signUp.back') }}</span>
          </button>
        </div>

        <div class="auth-header">
          <img src="/Agridron_Logo.png" alt="AgriDron Solutions" class="auth-logo" />
          <h1 class="auth-title">{{ t('iam.signUp.title') }}</h1>
          <p class="auth-subtitle">{{ t('iam.signUp.subtitle') }}</p>
        </div>

        <pv-message v-if="signUpError" severity="error" :closable="false" class="auth-alert">
          {{ signUpError }}
        </pv-message>

        <form class="auth-form" novalidate @submit.prevent="handleSignUp">
          <div class="form-field">
            <label for="signup-fullname" class="field-label">{{ t('iam.signUp.fullName') }}</label>
            <div class="input-wrapper">
              <i class="pi pi-user input-leading-icon" aria-hidden="true"></i>
              <pv-input-text
                id="signup-fullname"
                v-model="form.fullName"
                autocomplete="name"
                :placeholder="t('iam.signUp.fullNamePlaceholder')"
                :invalid="Boolean(fieldErrors.fullName)"
                :disabled="submitting"
                class="auth-input auth-input--leading"
              />
            </div>
            <small v-if="fieldErrors.fullName" class="field-error">{{ fieldErrors.fullName }}</small>
          </div>

          <div class="form-field">
            <label for="signup-email" class="field-label">{{ t('iam.signUp.email') }}</label>
            <div class="input-wrapper">
              <i class="pi pi-envelope input-leading-icon" aria-hidden="true"></i>
              <pv-input-text
                id="signup-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                :placeholder="t('iam.signUp.emailPlaceholder')"
                :invalid="Boolean(fieldErrors.email)"
                :disabled="submitting"
                class="auth-input auth-input--leading"
              />
            </div>
            <small v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</small>
          </div>

          <div class="form-field">
            <label for="signup-phone" class="field-label">{{ t('iam.signUp.phoneNumber') }}</label>
            <div class="input-wrapper">
              <i class="pi pi-phone input-leading-icon" aria-hidden="true"></i>
              <pv-input-text
                id="signup-phone"
                v-model="form.phoneNumber"
                type="tel"
                autocomplete="tel"
                :placeholder="t('iam.signUp.phoneNumberPlaceholder')"
                :invalid="Boolean(fieldErrors.phoneNumber)"
                :disabled="submitting"
                class="auth-input auth-input--leading"
              />
            </div>
            <small v-if="fieldErrors.phoneNumber" class="field-error">{{ fieldErrors.phoneNumber }}</small>
          </div>

          <div class="form-field">
            <label for="signup-password" class="field-label">{{ t('iam.signUp.password') }}</label>
            <div class="input-wrapper">
              <i class="pi pi-lock input-leading-icon" aria-hidden="true"></i>
              <pv-input-text
                id="signup-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :placeholder="t('iam.signUp.passwordPlaceholder')"
                :invalid="Boolean(fieldErrors.password)"
                :disabled="submitting"
                class="auth-input auth-input--leading auth-input--trailing"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="showPassword ? t('iam.signUp.hidePassword') : t('iam.signUp.showPassword')"
                :disabled="submitting"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
            <ul class="password-checklist" aria-live="polite">
              <li
                v-for="rule in passwordRules"
                :key="rule.key"
                class="password-rule"
                :class="{ 'password-rule--met': rule.met }"
              >
                <span class="password-rule-icon" aria-hidden="true">{{ rule.met ? '✓' : '•' }}</span>
                <span>{{ rule.label }}</span>
              </li>
            </ul>
            <small v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</small>
          </div>

          <div class="form-field role-section">
            <span class="field-label">{{ t('iam.signUp.roleQuestion') }}</span>
            <RoleSelectorCards
              v-model="form.role"
              :disabled="submitting"
              :error="fieldErrors.role"
            />
          </div>

          <pv-button
            type="submit"
            :label="submitting ? t('iam.signUp.signingUp') : t('iam.signUp.submit')"
            :loading="submitting"
            class="primary-submit-btn"
          />
        </form>

        <p class="auth-footer-link">
          {{ t('iam.signUp.hasAccount') }}
          <router-link to="/sign-in" class="inline-link">
            {{ t('iam.signUp.signInLink') }}
          </router-link>
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  background: linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #e6f4ea 100%);
  color-scheme: light;
  position: relative;
}

.auth-topbar {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem 2rem 2.25rem;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(21, 128, 61, 0.06);
  border: 1px solid #e2e8f0;
}

.card-nav-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.65rem 0.4rem 0.4rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.back-btn:hover {
  background-color: #f0fdf4;
  color: #15803d;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-logo {
  max-height: 54px;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: 0.95rem;
}

.auth-logo--compact {
  max-height: 44px;
  margin-bottom: 0.75rem;
}

.auth-title {
  margin: 0 0 0.35rem 0;
  font-size: 1.65rem;
  font-weight: 800;
  color: #111827;
}

.auth-subtitle {
  margin: 0;
  font-size: 0.92rem;
  color: #64748b;
  line-height: 1.45;
}

.auth-alert {
  margin-bottom: 1.25rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.role-section {
  margin-top: 0.25rem;
  gap: 0.6rem;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1f2937;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-leading-icon {
  position: absolute;
  left: 0.9rem;
  color: #64748b;
  font-size: 0.95rem;
  pointer-events: none;
  z-index: 1;
}

:deep(.auth-input),
:deep(.p-inputtext.auth-input) {
  width: 100%;
  background-color: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  caret-color: #1e293b !important;
  border-radius: 10px !important;
  padding-top: 0.7rem !important;
  padding-bottom: 0.7rem !important;
  font-size: 0.95rem !important;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

:deep(.auth-input::placeholder),
:deep(.p-inputtext.auth-input::placeholder) {
  color: #64748b !important;
  opacity: 1 !important;
}

:deep(.auth-input:enabled:hover),
:deep(.p-inputtext.auth-input:enabled:hover) {
  border-color: #94a3b8 !important;
  background-color: #f1f5f9 !important;
}

:deep(.auth-input--leading) {
  padding-left: 2.55rem !important;
}

:deep(.auth-input--trailing) {
  padding-right: 2.75rem !important;
}

:deep(.auth-input:focus),
:deep(.p-inputtext.auth-input:focus) {
  background-color: #ffffff !important;
  border-color: #15803d !important;
  color: #1e293b !important;
  box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.16) !important;
}

:deep(.auth-input.p-invalid),
:deep(.p-inputtext.auth-input.p-invalid) {
  border-color: #dc2626 !important;
}

:deep(.auth-input:-webkit-autofill),
:deep(.auth-input:-webkit-autofill:hover),
:deep(.auth-input:-webkit-autofill:focus),
:deep(.auth-input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 1000px #f1f5f9 inset !important;
  box-shadow: 0 0 0 1000px #f1f5f9 inset !important;
  -webkit-text-fill-color: #1e293b !important;
  caret-color: #1e293b !important;
  transition: background-color 5000s ease-in-out 0s;
}

.password-toggle-btn {
  position: absolute;
  right: 0.5rem;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.password-toggle-btn:hover:not(:disabled) {
  color: #15803d;
  background-color: #f0fdf4;
}

.field-error {
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 500;
}

.password-checklist {
  list-style: none;
  margin: 0.35rem 0 0 0;
  padding: 0.65rem 0.8rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem 0.75rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.password-rule {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  line-height: 1.3;
  color: #64748b;
  transition: color 0.15s ease;
}

.password-rule-icon {
  width: 14px;
  text-align: center;
  font-weight: 700;
  flex-shrink: 0;
}

.password-rule--met {
  color: #15803d;
  font-weight: 600;
}

.password-rule--met .password-rule-icon {
  color: #15803d;
}

:deep(.primary-submit-btn) {
  width: 100%;
  margin-top: 0.45rem;
  background-color: #15803d !important;
  border-color: #15803d !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  padding: 0.8rem 1.25rem !important;
  border-radius: 10px !important;
}

:deep(.primary-submit-btn:hover:not(:disabled)) {
  background-color: #16a34a !important;
  border-color: #16a34a !important;
}

.auth-footer-link {
  margin: 1.35rem 0 0 0;
  text-align: center;
  font-size: 0.92rem;
  color: #475569;
}

.inline-link {
  color: #15803d;
  font-weight: 700;
  text-decoration: none;
  margin-left: 0.25rem;
}

.inline-link:hover {
  color: #16a34a;
  text-decoration: underline;
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0.5rem 0.25rem;
}

.success-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #dcfce7;
  color: #15803d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.15rem;
  box-shadow: 0 6px 18px rgba(21, 128, 61, 0.16);
}

.success-description {
  margin: 0.5rem 0 1.75rem;
  font-size: 0.96rem;
  line-height: 1.55;
  color: #475569;
}

@media (max-width: 520px) {
  .auth-page {
    padding: 4.25rem 1rem 1.5rem;
  }

  .auth-topbar {
    top: 0.85rem;
    right: 0.85rem;
  }

  .auth-card {
    padding: 1.5rem 1.25rem 1.75rem;
  }

  .password-checklist {
    grid-template-columns: 1fr;
  }
}
</style>
