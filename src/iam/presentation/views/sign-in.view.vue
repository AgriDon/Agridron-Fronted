<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'
import { useIamStore } from '../../application/iam.store.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const iamStore = useIamStore()

const form = reactive({
  email: '',
  password: ''
})

const fieldErrors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const submitting = ref(false)
const authError = ref('')
const authSeverity = ref('error')

const validateForm = () => {
  fieldErrors.email = ''
  fieldErrors.password = ''

  if (!form.email.trim()) {
    fieldErrors.email = t('iam.signIn.emailRequired')
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    fieldErrors.email = t('iam.signIn.emailInvalid')
  }

  if (!form.password) {
    fieldErrors.password = t('iam.signIn.passwordRequired')
  }

  return !fieldErrors.email && !fieldErrors.password
}

const resolveRedirectTarget = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/inicio'
}

const handleSignIn = async () => {
  authError.value = ''
  authSeverity.value = 'error'
  if (!validateForm()) return

  submitting.value = true
  try {
    const session = await iamStore.signIn({
      email: form.email,
      password: form.password
    })
    if (session?.token && iamStore.isAuthenticated) {
      await router.replace(resolveRedirectTarget())
    }
  } catch (err) {
    if (err?.status === 403) {
      authSeverity.value = 'warn'
      authError.value = t('iam.signIn.accountUnverified')
    } else if (err?.status === 401) {
      authSeverity.value = 'error'
      authError.value = err.detail || t('iam.signIn.invalidCredentials')
    } else {
      authSeverity.value = 'error'
      authError.value = err?.message || t('iam.signIn.invalidCredentials')
    }
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
      <div class="auth-header">
        <img src="/Agridron_Logo.png" alt="AgriDron Solutions" class="auth-logo" />
        <h1 class="auth-title">{{ t('iam.signIn.title') }}</h1>
        <p class="auth-subtitle">{{ t('iam.signIn.subtitle') }}</p>
      </div>

      <pv-message v-if="authError" :severity="authSeverity" :closable="false" class="auth-alert">
        {{ authError }}
      </pv-message>

      <form class="auth-form" novalidate @submit.prevent="handleSignIn">
        <div class="form-field">
          <label for="signin-email" class="field-label">{{ t('iam.signIn.email') }}</label>
          <div class="input-wrapper">
            <i class="pi pi-envelope input-leading-icon" aria-hidden="true"></i>
            <pv-input-text
              id="signin-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              :placeholder="t('iam.signIn.emailPlaceholder')"
              :invalid="Boolean(fieldErrors.email)"
              :disabled="submitting"
              class="auth-input auth-input--leading"
            />
          </div>
          <small v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</small>
        </div>

        <div class="form-field">
          <label for="signin-password" class="field-label">{{ t('iam.signIn.password') }}</label>
          <div class="input-wrapper">
            <i class="pi pi-lock input-leading-icon" aria-hidden="true"></i>
            <pv-input-text
              id="signin-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :placeholder="t('iam.signIn.passwordPlaceholder')"
              :invalid="Boolean(fieldErrors.password)"
              :disabled="submitting"
              class="auth-input auth-input--leading auth-input--trailing"
            />
            <button
              type="button"
              class="password-toggle-btn"
              :aria-label="showPassword ? t('iam.signIn.hidePassword') : t('iam.signIn.showPassword')"
              :disabled="submitting"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          <small v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</small>
        </div>

        <pv-button
          type="submit"
          :label="submitting ? t('iam.signIn.signingIn') : t('iam.signIn.submit')"
          :loading="submitting"
          class="primary-submit-btn"
        />

        <div class="auth-divider">
          <span>{{ t('iam.signIn.noAccount') }}</span>
        </div>

        <pv-button
          type="button"
          :label="t('iam.signIn.createAccount')"
          outlined
          :disabled="submitting"
          class="secondary-action-btn"
          @click="router.push('/sign-up')"
        />
      </form>
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
  padding: 2rem 1.25rem;
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
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2.25rem 2rem;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(21, 128, 61, 0.06);
  border: 1px solid #e2e8f0;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-logo {
  max-height: 58px;
  max-width: 210px;
  object-fit: contain;
  margin-bottom: 1.15rem;
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
  gap: 1.15rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
  padding-top: 0.72rem !important;
  padding-bottom: 0.72rem !important;
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

:deep(.primary-submit-btn) {
  width: 100%;
  margin-top: 0.35rem;
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

.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.84rem;
  margin: 0.2rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
}

:deep(.secondary-action-btn) {
  width: 100%;
  color: #15803d !important;
  border-color: #15803d !important;
  font-weight: 700 !important;
  padding: 0.75rem 1.25rem !important;
  border-radius: 10px !important;
}

:deep(.secondary-action-btn:hover:not(:disabled)) {
  background-color: #f0fdf4 !important;
  border-color: #16a34a !important;
  color: #14532d !important;
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
    padding: 1.75rem 1.35rem;
  }
}
</style>
