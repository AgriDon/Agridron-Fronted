<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="terms-page">
    <div class="terms-top-bar">
      <router-link to="/inicio" class="back-link">
        <i class="pi pi-arrow-left" aria-hidden="true"></i>
        <span>{{ t('terms.back') }}</span>
      </router-link>
    </div>

    <pv-card class="terms-card">
      <template #title>
        <div class="terms-header">
          <h1 class="terms-title">{{ t('terms.title') }}</h1>
          <div class="terms-meta">
            <span>
              <strong>{{ t('terms.versionLabel') }}</strong> {{ t('terms.versionValue') }}
            </span>
            <span>
              <strong>{{ t('terms.updatedLabel') }}</strong> {{ t('terms.updatedValue') }}
            </span>
            <span>
              <strong>{{ t('terms.orgLabel') }}</strong> {{ t('terms.orgValue') }}
            </span>
          </div>
        </div>
      </template>

      <template #content>
        <div class="terms-sections">
          <article class="terms-section">
            <h2>{{ t('terms.sections.ethics.title') }}</h2>
            <p>{{ t('terms.sections.ethics.intro') }}</p>
            <ul>
              <li>
                <strong>{{ t('terms.sections.ethics.acmTitle') }}</strong>
                {{ t('terms.sections.ethics.acmDesc') }}
              </li>
              <li>
                <strong>{{ t('terms.sections.ethics.cipTitle') }}</strong>
                {{ t('terms.sections.ethics.cipDesc') }}
              </li>
            </ul>
            <div class="terms-callout">
              <p>{{ t('terms.sections.ethics.callout') }}</p>
            </div>
          </article>

          <article class="terms-section">
            <h2>{{ t('terms.sections.scope.title') }}</h2>
            <p>{{ t('terms.sections.scope.p1') }}</p>
            <p>{{ t('terms.sections.scope.p2') }}</p>
          </article>

          <article class="terms-section">
            <h2>{{ t('terms.sections.privacy.title') }}</h2>
            <p>{{ t('terms.sections.privacy.intro') }}</p>
            <ul>
              <li>{{ t('terms.sections.privacy.item1') }}</li>
              <li>{{ t('terms.sections.privacy.item2') }}</li>
              <li>{{ t('terms.sections.privacy.item3') }}</li>
            </ul>
          </article>

          <article class="terms-section">
            <h2>{{ t('terms.sections.safety.title') }}</h2>
            <p>{{ t('terms.sections.safety.intro') }}</p>
            <ul>
              <li>
                <strong>{{ t('terms.sections.safety.windTitle') }}</strong>
                {{ t('terms.sections.safety.windDesc') }}
              </li>
              <li>
                <strong>{{ t('terms.sections.safety.geoTitle') }}</strong>
                {{ t('terms.sections.safety.geoDesc') }}
              </li>
              <li>
                <strong>{{ t('terms.sections.safety.stopTitle') }}</strong>
                {{ t('terms.sections.safety.stopDesc') }}
              </li>
            </ul>
          </article>

          <article class="terms-section">
            <h2>{{ t('terms.sections.traceability.title') }}</h2>
            <p>{{ t('terms.sections.traceability.body') }}</p>
          </article>

          <article class="terms-section">
            <h2>{{ t('terms.sections.contact.title') }}</h2>
            <p>{{ t('terms.sections.contact.intro') }}</p>
            <p class="contact-details">
              <strong>{{ t('terms.sections.contact.emailLabel') }}</strong>
              <a href="mailto:info@agridron.com" class="contact-link">info@agridron.com</a><br />
              <strong>{{ t('terms.sections.contact.phoneLabel') }}</strong> +51 987 654 321<br />
              <strong>{{ t('terms.sections.contact.locationLabel') }}</strong>
              {{ t('terms.sections.contact.locationValue') }}
            </p>
          </article>
        </div>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.terms-page {
  max-width: 960px;
  margin: 0 auto;
}

.terms-top-bar {
  margin-bottom: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--agridron-brand, #0e876a);
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.back-link:hover {
  transform: translateX(-3px);
}

.terms-card {
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  border-radius: 14px;
}

.terms-header {
  border-bottom: 1px solid var(--p-content-border-color, #e2e8f0);
  padding-bottom: 1rem;
}

.terms-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--agridron-brand, #0e876a);
}

.terms-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--p-text-muted-color, #64748b);
}

.terms-sections {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.terms-section h2 {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
  color: var(--agridron-brand-dark, #163e33);
}

.terms-section p,
.terms-section li {
  line-height: 1.65;
  color: var(--p-text-color, #1f2937);
}

.terms-section ul {
  margin: 0.5rem 0 0;
  padding-left: 1.35rem;
}

.terms-section li {
  margin-bottom: 0.45rem;
}

.terms-callout {
  margin-top: 0.85rem;
  padding: 0.9rem 1.1rem;
  border-left: 4px solid var(--agridron-brand, #0e876a);
  background-color: rgba(14, 135, 106, 0.08);
  border-radius: 0 8px 8px 0;
}

.terms-callout p {
  margin: 0;
}

.contact-details {
  line-height: 1.8;
}

.contact-link {
  color: var(--agridron-brand, #0e876a);
  font-weight: 600;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  .terms-section h2 {
    color: var(--p-primary-color, #34d399);
  }
}
</style>
