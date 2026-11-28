<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'
import { useIamStore } from '../../application/iam.store.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const iamStore = useIamStore()

const status = ref('loading')
const errorMessage = ref('')

onMounted(async () => {
  const rawToken = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token
  const token = typeof rawToken === 'string' ? rawToken.trim() : ''

  if (!token) {
    status.value = 'error'
    errorMessage.value = t('iam.verifyEmail.missingToken')
    return
  }

  try {
    await iamStore.verifyEmail(token)
    status.value = 'success'
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err?.message || t('iam.verifyEmail.invalidToken')
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-topbar">
      <LanguageSwitcher />
    </div>

    <div class="auth-card">
      <img src="/Agridron_Logo.png" alt="AgriDron Solutions" class="auth-logo" />

      <div v-if="status === 'loading'" class="verify-state">
        <div class="state-icon state-icon--loading" aria-hidden="true">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <h1 class="verify-title">{{ t('iam.verifyEmail.loadingTitle') }}</h1>
        <p class="verify-subtitle">{{ t('iam.verifyEmail.loadingSubtitle') }}</p>
      </div>

      <div v-else-if="status === 'success'" class="verify-state">
        <div class="state-icon state-icon--success" aria-hidden="true">
          <i class="pi pi-check"></i>
        </div>
        <h1 class="verify-title">{{ t('iam.verifyEmail.successTitle') }}</h1>
        <p class="verify-subtitle">{{ t('iam.verifyEmail.successSubtitle') }}</p>
        <pv-button
          type="button"
          :label="t('iam.verifyEmail.goToSignIn')"
          icon="pi pi-sign-in"
          class="primary-action-btn"
          @click="router.push('/sign-in')"
        />
      </div>

      <div v-else class="verify-state">
        <div class="state-icon state-icon--error" aria-hidden="true">
          <i class="pi pi-times"></i>
        </div>
        <h1 class="verify-title">{{ t('iam.verifyEmail.errorTitle') }}</h1>
        <pv-message severity="error" :closable="false" class="verify-alert">
          {{ errorMessage }}
        </pv-message>
        <div class="verify-actions">
          <pv-button
            type="button"
            :label="t('iam.verifyEmail.goToSignIn')"
            class="primary-action-btn"
            @click="router.push('/sign-in')"
          />
          <pv-button
            type="button"
            :label="t('iam.verifyEmail.goToSignUp')"
            outlined
            class="secondary-action-btn"
            @click="router.push('/sign-up')"
          />
        </div>
      </div>
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
  background: linear-gradient(145deg, #f0fdf4 0%, #f8fafc 55%, #ecfdf5 100%);
  position: relative;
}

.auth-topbar {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(21, 128, 61, 0.06);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.auth-logo {
  max-height: 54px;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: 1.5rem;
}

.verify-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.state-icon {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.25rem;
}

.state-icon--loading {
  background-color: #f0fdf4;
  color: #16a34a;
}

.state-icon--success {
  background-color: #dcfce7;
  color: #15803d;
  box-shadow: 0 6px 18px rgba(21, 128, 61, 0.18);
}

.state-icon--error {
  background-color: #fee2e2;
  color: #dc2626;
}

.verify-title {
  margin: 0 0 0.6rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.verify-subtitle {
  margin: 0 0 1.75rem 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #475569;
}

.verify-alert {
  width: 100%;
  margin: 0.5rem 0 1.5rem;
  text-align: left;
}

.verify-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.primary-action-btn) {
  width: 100%;
  background-color: #15803d !important;
  border-color: #15803d !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  padding: 0.8rem 1.25rem !important;
  border-radius: 10px !important;
}

:deep(.primary-action-btn:hover:not(:disabled)) {
  background-color: #16a34a !important;
  border-color: #16a34a !important;
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
    padding: 2rem 1.35rem;
  }
}
</style>
