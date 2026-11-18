<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
        <span class="footer-rights">{{ t('footer.rights') }}</span>
        <span class="footer-separator" aria-hidden="true">·</span>
        <span class="footer-dev">
          {{ t('footer.intro') }}<strong>{{ t('footer.author') }}</strong>
        </span>
      </div>

      <div class="footer-right">
        <span class="footer-badge">
          <i class="pi pi-verified" aria-hidden="true"></i>
          {{ t('footer.ethicsBadge') }}
        </span>
        <router-link to="/terms" class="footer-terms-link">
          <i class="pi pi-file-check" aria-hidden="true"></i>
          <span>{{ t('footer.termsLink') }}</span>
        </router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  padding: 1.15rem 3rem;
  border-top: 1px solid var(--p-content-border-color, #e2e8f0);
  background-color: var(--p-content-background, #ffffff);
  color: var(--p-text-muted-color, #64748b);
  font-size: 0.85rem;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1.5rem;
  flex-wrap: wrap;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-separator {
  opacity: 0.6;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--agridron-brand, #0e876a);
  background-color: rgba(14, 135, 106, 0.08);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
}

.footer-terms-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--agridron-brand, #0e876a);
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease, text-decoration-color 0.2s ease;
}

.footer-terms-link:hover {
  text-decoration: underline;
  opacity: 0.88;
}

@media (max-width: 992px) {
  .app-footer {
    padding: 1rem 1.25rem;
  }
}

@media (max-width: 640px) {
  .app-footer {
    padding: 0.9rem 0.85rem;
    font-size: 0.8rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
