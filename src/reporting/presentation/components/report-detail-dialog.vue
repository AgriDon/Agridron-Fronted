<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  report: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'close'])

const { t } = useI18n()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const printPdf = () => {
  window.print()
}

const close = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <pv-dialog
    v-model:visible="dialogVisible"
    modal
    :header="t('reports.dialog.title')"
    :style="{ width: '92vw', maxWidth: '780px' }"
    class="report-dialog"
  >
    <div v-if="report" class="printable-report">
      <!-- Report Header Banner -->
      <div class="report-header-banner">
        <div class="report-brand">
          <img src="/Agridron_Logo.png" alt="AgriDron Solutions" class="report-logo" />
          <div>
            <h2 class="report-code">{{ report.code }}</h2>
            <span class="report-subtitle">{{ t('reports.dialog.subtitle') }}</span>
          </div>
        </div>
        <div class="report-badge-box">
          <pv-tag
            :value="report.status"
            :severity="report.isCompleted() ? 'success' : report.isInProgress() ? 'info' : 'warn'"
          />
        </div>
      </div>

      <!-- Main Specifications Grid -->
      <div class="spec-grid">
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.table.parcel') }}</span>
          <span class="spec-value">{{ report.parcelName }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.table.date') }}</span>
          <span class="spec-value">{{ new Date(report.date).toLocaleDateString() }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.table.area') }}</span>
          <span class="spec-value">{{ report.area }} ha</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.dialog.operator') }}</span>
          <span class="spec-value">{{ report.operator }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.dialog.treatmentType') }}</span>
          <span class="spec-value">{{ report.treatmentType }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.dialog.product') }}</span>
          <span class="spec-value">{{ report.product }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.dialog.dose') }}</span>
          <span class="spec-value">{{ report.dose }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">{{ t('reports.dialog.appliedVolume') }}</span>
          <span class="spec-value">{{ report.appliedVolume }} L</span>
        </div>
      </div>

      <!-- Coverage / Flight Observation Box -->
      <div class="flight-observation-box">
        <h4 class="box-title">
          <i class="pi pi-compass"></i>
          {{ t('reports.dialog.coverageTitle') }}
        </h4>
        <p class="box-description">
          {{ report.observations || t('reports.dialog.defaultObservation') }}
        </p>
        <div class="telemetry-bar">
          <div class="telemetry-item">
            <span>{{ t('reports.dialog.progress') }}:</span>
            <strong>{{ report.progress }}%</strong>
          </div>
          <div class="telemetry-item">
            <span>{{ t('reports.dialog.precision') }}:</span>
            <strong>99.4% (RTK GPS)</strong>
          </div>
          <div class="telemetry-item">
            <span>{{ t('reports.dialog.drift') }}:</span>
            <strong>0.02% (Anti-Deriva)</strong>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-actions">
        <pv-button
          :label="t('reports.dialog.close')"
          icon="pi pi-times"
          severity="secondary"
          text
          @click="close"
        />
        <pv-button
          :label="t('reports.dialog.exportPdf')"
          icon="pi pi-file-pdf"
          severity="success"
          @click="printPdf"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.printable-report {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.report-header-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--p-surface-200, #e2e8f0);
}

.report-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.report-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.report-code {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--p-text-color, #1e293b);
}

.report-subtitle {
  font-size: 0.85rem;
  color: var(--p-text-muted-color, #64748b);
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  background: var(--p-surface-50, #f8fafc);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--p-surface-200, #e2e8f0);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color, #64748b);
}

.spec-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--p-text-color, #0f172a);
}

.flight-observation-box {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 1.25rem;
  border-radius: 12px;
}

.box-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #047857;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.box-description {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: var(--p-text-color, #1e293b);
  line-height: 1.5;
}

.telemetry-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(16, 185, 129, 0.3);
  font-size: 0.88rem;
}

.telemetry-item span {
  color: var(--p-text-muted-color, #64748b);
  margin-right: 0.35rem;
}

.telemetry-item strong {
  color: #065f46;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

@media print {
  :global(body *) {
    visibility: hidden;
  }
  .printable-report,
  .printable-report * {
    visibility: visible;
  }
  .printable-report {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
