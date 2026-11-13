<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { InventoryUseCases, InventoryValidationError } from '@/inventoryManagement/application/inventory-use-cases.js'

const { t } = useI18n()
const useCases = new InventoryUseCases()

// ==========================================
// Component State
// ==========================================
const loading = ref(true)
const activeTab = ref('chemicals') // 'chemicals' | 'nozzles'
const errorMessage = ref('')
const successMessage = ref('')

const chemicals = ref([])
const nozzles = ref([])

// Filters - Chemicals
const searchQuery = ref('')
const selectedType = ref('all')
const onlyLowStock = ref(false)

// Filters - Nozzles
const selectedNozzleStatus = ref('all')

// Dialogs
const showChemicalDialog = ref(false)
const showRestockDialog = ref(false)
const showNozzleDialog = ref(false)
const showDeleteDialog = ref(false)

// Action targets & form models
const isEditing = ref(false)
const saving = ref(false)
const formErrors = ref({})

const chemicalForm = ref({
  id: null,
  name: '',
  type: 'herbicide',
  stockLiters: 0,
  minimumStockLiters: 0,
  expirationDate: ''
})

const restockTarget = ref(null)
const restockAmount = ref(20)

const nozzleForm = ref({
  id: null,
  type: 'flat-fan',
  diameterMm: 5,
  stockUnits: 10,
  status: 'good'
})

const deleteTarget = ref(null) // { type: 'chemical'|'nozzle', id: number, name: string }

// ==========================================
// Computed Data & Metrics
// ==========================================
const totalChemicalsCount = computed(() => chemicals.value.length)

const lowStockChemicals = computed(() =>
  chemicals.value.filter((chem) => chem.isLowStock && chem.isLowStock())
)

const totalLitersInStock = computed(() =>
  chemicals.value.reduce((acc, chem) => acc + (Number(chem.stockLiters) || 0), 0)
)

const wornNozzlesCount = computed(() =>
  nozzles.value.filter((n) => n.status === 'worn').length
)

const chemicalTypeOptions = computed(() => [
  { label: t('inventory.types.all'), value: 'all' },
  { label: t('inventory.types.herbicide'), value: 'herbicide' },
  { label: t('inventory.types.insecticide'), value: 'insecticide' },
  { label: t('inventory.types.fungicide'), value: 'fungicide' },
  { label: t('inventory.types.fertilizer'), value: 'fertilizer' }
])

const chemicalFormTypeOptions = computed(() => [
  { label: t('inventory.types.herbicide'), value: 'herbicide' },
  { label: t('inventory.types.insecticide'), value: 'insecticide' },
  { label: t('inventory.types.fungicide'), value: 'fungicide' },
  { label: t('inventory.types.fertilizer'), value: 'fertilizer' }
])

const nozzleTypeOptions = computed(() => [
  { label: t('inventory.nozzles.types.flatFan'), value: 'flat-fan' },
  { label: t('inventory.nozzles.types.hollowCone'), value: 'hollow-cone' }
])

const nozzleStatusFilterOptions = computed(() => [
  { label: t('inventory.nozzles.status.all'), value: 'all' },
  { label: t('inventory.nozzles.status.good'), value: 'good' },
  { label: t('inventory.nozzles.status.worn'), value: 'worn' }
])

// Filtered Lists
const filteredChemicals = computed(() => {
  return chemicals.value.filter((chem) => {
    // Search query
    const matchName =
      !searchQuery.value ||
      chem.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    // Category
    const matchType =
      selectedType.value === 'all' || chem.type === selectedType.value

    // Low stock filter
    const matchLowStock =
      !onlyLowStock.value || (chem.isLowStock && chem.isLowStock())

    return matchName && matchType && matchLowStock
  })
})

const filteredNozzles = computed(() => {
  return nozzles.value.filter((nozzle) => {
    if (selectedNozzleStatus.value === 'all') return true
    return nozzle.status === selectedNozzleStatus.value
  })
})

// ==========================================
// Data Fetching
// ==========================================
const loadData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [chemData, nozData] = await Promise.all([
      useCases.getAllChemicals(),
      useCases.getAllNozzles()
    ])
    chemicals.value = chemData || []
    nozzles.value = nozData || []
  } catch (error) {
    errorMessage.value = error.message || 'Error al cargar los datos del inventario.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const showFeedback = (msg) => {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = ''
  }, 4000)
}

// ==========================================
// Chemical Handlers
// ==========================================
const openCreateChemical = () => {
  isEditing.value = false
  formErrors.value = {}
  chemicalForm.value = {
    id: null,
    name: '',
    type: 'herbicide',
    stockLiters: 50,
    minimumStockLiters: 20,
    expirationDate: new Date(Date.now() + 365 * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0]
  }
  showChemicalDialog.value = true
}

const openEditChemical = (chem) => {
  isEditing.value = true
  formErrors.value = {}
  chemicalForm.value = {
    id: chem.id,
    name: chem.name,
    type: chem.type,
    stockLiters: chem.stockLiters,
    minimumStockLiters: chem.minimumStockLiters,
    expirationDate: chem.expirationDate
  }
  showChemicalDialog.value = true
}

const saveChemical = async () => {
  saving.value = true
  formErrors.value = {}
  try {
    await useCases.saveChemical(chemicalForm.value)
    showChemicalDialog.value = false
    showFeedback(
      isEditing.value
        ? t('inventory.messages.chemicalUpdated')
        : t('inventory.messages.chemicalCreated')
    )
    await loadData()
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      formErrors.value = error.errors
    } else {
      errorMessage.value = error.message
    }
  } finally {
    saving.value = false
  }
}

const openRestock = (chem) => {
  restockTarget.value = chem
  restockAmount.value = chem.suggestedRestockLiters ? chem.suggestedRestockLiters() || 25 : 25
  showRestockDialog.value = true
}

const confirmRestock = async () => {
  if (!restockTarget.value) return
  saving.value = true
  try {
    await useCases.restockChemical(restockTarget.value.id, restockAmount.value)
    showRestockDialog.value = false
    showFeedback(t('inventory.messages.restockSuccess'))
    await loadData()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}

// ==========================================
// Nozzle Handlers
// ==========================================
const openCreateNozzle = () => {
  isEditing.value = false
  formErrors.value = {}
  nozzleForm.value = {
    id: null,
    type: 'flat-fan',
    diameterMm: 5,
    stockUnits: 10,
    status: 'good'
  }
  showNozzleDialog.value = true
}

const openEditNozzle = (nozzle) => {
  isEditing.value = true
  formErrors.value = {}
  nozzleForm.value = {
    id: nozzle.id,
    type: nozzle.type,
    diameterMm: nozzle.diameterMm,
    stockUnits: nozzle.stockUnits,
    status: nozzle.status
  }
  showNozzleDialog.value = true
}

const saveNozzle = async () => {
  saving.value = true
  formErrors.value = {}
  try {
    await useCases.saveNozzle(nozzleForm.value)
    showNozzleDialog.value = false
    showFeedback(
      isEditing.value
        ? t('inventory.messages.nozzleUpdated')
        : t('inventory.messages.nozzleCreated')
    )
    await loadData()
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      formErrors.value = error.errors
    } else {
      errorMessage.value = error.message
    }
  } finally {
    saving.value = false
  }
}

const toggleNozzleCondition = async (nozzle) => {
  try {
    await useCases.toggleNozzleStatus(nozzle.id)
    showFeedback(t('inventory.messages.nozzleStatusToggled'))
    await loadData()
  } catch (error) {
    errorMessage.value = error.message
  }
}

// ==========================================
// Delete Handlers
// ==========================================
const requestDelete = (type, item) => {
  deleteTarget.value = {
    type,
    id: item.id,
    name: item.name || `${item.type} (${item.diameterMm} mm)`
  }
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    if (deleteTarget.value.type === 'chemical') {
      await useCases.deleteChemical(deleteTarget.value.id)
      showFeedback(t('inventory.messages.chemicalDeleted'))
    } else {
      await useCases.deleteNozzle(deleteTarget.value.id)
      showFeedback(t('inventory.messages.nozzleDeleted'))
    }
    showDeleteDialog.value = false
    deleteTarget.value = null
    await loadData()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}

// Helper colors for chemical types
const getTypeBadgeSeverity = (type) => {
  switch (type) {
    case 'herbicide':
      return 'info'
    case 'insecticide':
      return 'warn'
    case 'fungicide':
      return 'help'
    case 'fertilizer':
      return 'success'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div class="inventory-view-container">
    <!-- Header -->
    <header class="view-header">
      <div class="header-text">
        <h1 class="view-title">{{ t('inventory.title') }}</h1>
        <p class="view-subtitle">{{ t('inventory.subtitle') }}</p>
      </div>

      <div class="header-actions">
        <pv-button
          v-if="activeTab === 'chemicals'"
          :label="t('inventory.buttons.newChemical')"
          icon="pi pi-plus"
          class="btn-primary"
          @click="openCreateChemical"
        />
        <pv-button
          v-else
          :label="t('inventory.buttons.newNozzle')"
          icon="pi pi-plus"
          class="btn-primary"
          @click="openCreateNozzle"
        />
      </div>
    </header>

    <!-- Feedback messages -->
    <pv-message v-if="successMessage" severity="success" class="mb-4" :closable="true">
      {{ successMessage }}
    </pv-message>
    <pv-message v-if="errorMessage" severity="error" class="mb-4" :closable="true">
      {{ errorMessage }}
    </pv-message>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="kpi-grid mb-4">
      <pv-skeleton height="100px" border-radius="12px" />
      <pv-skeleton height="100px" border-radius="12px" />
      <pv-skeleton height="100px" border-radius="12px" />
      <pv-skeleton height="100px" border-radius="12px" />
    </div>

    <!-- Top KPI Grid -->
    <div v-else class="kpi-grid mb-4">
      <div class="kpi-card bg-emerald">
        <div class="kpi-icon-box">
          <i class="pi pi-box"></i>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">{{ t('inventory.kpis.activeProducts') }}</span>
          <strong class="kpi-value">{{ totalChemicalsCount }}</strong>
        </div>
      </div>

      <div class="kpi-card" :class="lowStockChemicals.length > 0 ? 'bg-amber' : 'bg-slate'">
        <div class="kpi-icon-box">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">{{ t('inventory.kpis.lowStockAlerts') }}</span>
          <strong class="kpi-value">{{ lowStockChemicals.length }}</strong>
        </div>
      </div>

      <div class="kpi-card bg-blue">
        <div class="kpi-icon-box">
          <i class="pi pi-database"></i>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">{{ t('inventory.kpis.totalLiters') }}</span>
          <strong class="kpi-value">{{ totalLitersInStock.toLocaleString() }} L</strong>
        </div>
      </div>

      <div class="kpi-card" :class="wornNozzlesCount > 0 ? 'bg-rose' : 'bg-slate'">
        <div class="kpi-icon-box">
          <i class="pi pi-wrench"></i>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">{{ t('inventory.kpis.wornNozzles') }}</span>
          <strong class="kpi-value">{{ wornNozzlesCount }}</strong>
        </div>
      </div>
    </div>

    <!-- Main Card & Tabs -->
    <div class="main-card">
      <div class="tabs-header">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'chemicals' }"
          @click="activeTab = 'chemicals'"
        >
          <i class="pi pi-shield mr-2"></i>
          {{ t('inventory.tabs.chemicals') }}
          <span class="badge ml-2">{{ chemicals.length }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'nozzles' }"
          @click="activeTab = 'nozzles'"
        >
          <i class="pi pi-cog mr-2"></i>
          {{ t('inventory.tabs.nozzles') }}
          <span class="badge ml-2">{{ nozzles.length }}</span>
        </button>
      </div>

      <!-- TAB 1: Chemicals Content -->
      <div v-if="activeTab === 'chemicals'" class="tab-content">
        <!-- Controls & Filters -->
        <div class="filters-bar">
          <div class="search-box">
            <pv-icon-field icon-position="left">
              <pv-input-icon class="pi pi-search" />
              <pv-input-text
                v-model="searchQuery"
                :placeholder="t('inventory.filters.searchPlaceholder')"
                class="search-input"
              />
            </pv-icon-field>
          </div>

          <div class="filter-controls">
            <div class="filter-item">
              <label class="filter-caption">{{ t('inventory.filters.category') }}</label>
              <pv-select
                v-model="selectedType"
                :options="chemicalTypeOptions"
                option-label="label"
                option-value="value"
                class="filter-select"
              />
            </div>

            <div class="filter-item switch-filter">
              <label class="filter-caption">{{ t('inventory.filters.lowStockOnly') }}</label>
              <pv-toggle-switch v-model="onlyLowStock" />
            </div>
          </div>
        </div>

        <!-- Chemicals DataTable -->
        <div class="table-wrapper">
          <pv-datatable
            :value="filteredChemicals"
            :loading="loading"
            responsive-layout="scroll"
            paginator
            :rows="6"
            class="custom-table"
          >
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-inbox empty-icon"></i>
                <p>{{ t('inventory.empty.chemicals') }}</p>
              </div>
            </template>

            <!-- Product name -->
            <pv-column field="name" :header="t('inventory.columns.product')" sortable>
              <template #body="{ data }">
                <div class="product-cell">
                  <strong class="product-name">{{ data.name }}</strong>
                  <span class="product-id">ID: #{{ data.id }}</span>
                </div>
              </template>
            </pv-column>

            <!-- Category / Type -->
            <pv-column field="type" :header="t('inventory.columns.type')" sortable>
              <template #body="{ data }">
                <pv-tag
                  :value="t(`inventory.types.${data.type}`)"
                  :severity="getTypeBadgeSeverity(data.type)"
                />
              </template>
            </pv-column>

            <!-- Current Stock (with progress bar) -->
            <pv-column field="stockLiters" :header="t('inventory.columns.stock')" sortable>
              <template #body="{ data }">
                <div class="stock-cell">
                  <div class="stock-values">
                    <span class="current-stock">{{ data.stockLiters }} L</span>
                    <span class="min-threshold">/ min {{ data.minimumStockLiters }} L</span>
                  </div>
                  <pv-progressbar
                    :value="data.stockPercentage ? data.stockPercentage() : 50"
                    :show-value="false"
                    class="stock-bar"
                  />
                </div>
              </template>
            </pv-column>

            <!-- Expiration Date -->
            <pv-column field="expirationDate" :header="t('inventory.columns.expiration')" sortable>
              <template #body="{ data }">
                <div class="expiration-cell">
                  <span>{{ data.expirationDate || 'N/A' }}</span>
                  <pv-tag
                    v-if="data.isExpired && data.isExpired()"
                    value="Vencido"
                    severity="danger"
                    class="ml-2"
                  />
                  <pv-tag
                    v-else-if="data.isExpiringSoon && data.isExpiringSoon()"
                    value="Por vencer"
                    severity="warn"
                    class="ml-2"
                  />
                </div>
              </template>
            </pv-column>

            <!-- Stock Status -->
            <pv-column :header="t('inventory.columns.status')">
              <template #body="{ data }">
                <pv-tag
                  :value="data.isLowStock && data.isLowStock() ? t('inventory.status.low') : t('inventory.status.optimal')"
                  :severity="data.isLowStock && data.isLowStock() ? 'warn' : 'success'"
                />
              </template>
            </pv-column>

            <!-- Actions -->
            <pv-column :header="t('inventory.columns.actions')">
              <template #body="{ data }">
                <div class="actions-group">
                  <pv-button
                    icon="pi pi-plus-circle"
                    severity="success"
                    text
                    rounded
                    :title="t('inventory.buttons.restock')"
                    @click="openRestock(data)"
                  />
                  <pv-button
                    icon="pi pi-pencil"
                    severity="info"
                    text
                    rounded
                    :title="t('inventory.buttons.edit')"
                    @click="openEditChemical(data)"
                  />
                  <pv-button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    :title="t('inventory.buttons.delete')"
                    @click="requestDelete('chemical', data)"
                  />
                </div>
              </template>
            </pv-column>
          </pv-datatable>
        </div>
      </div>

      <!-- TAB 2: Nozzles Content -->
      <div v-else-if="activeTab === 'nozzles'" class="tab-content">
        <!-- Controls & Filters -->
        <div class="filters-bar">
          <div class="filter-controls">
            <div class="filter-item">
              <label class="filter-caption">{{ t('inventory.nozzles.filters.status') }}</label>
              <pv-select
                v-model="selectedNozzleStatus"
                :options="nozzleStatusFilterOptions"
                option-label="label"
                option-value="value"
                class="filter-select"
              />
            </div>
          </div>
        </div>

        <!-- Nozzles DataTable -->
        <div class="table-wrapper">
          <pv-datatable
            :value="filteredNozzles"
            :loading="loading"
            responsive-layout="scroll"
            paginator
            :rows="6"
            class="custom-table"
          >
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-cog empty-icon"></i>
                <p>{{ t('inventory.empty.nozzles') }}</p>
              </div>
            </template>

            <pv-column field="id" header="ID" sortable style="width: 80px;" />

            <pv-column field="type" :header="t('inventory.nozzles.columns.type')" sortable>
              <template #body="{ data }">
                <strong>{{ data.type === 'flat-fan' ? 'Abanico Plano (Flat-Fan)' : 'Cono Hueco (Hollow-Cone)' }}</strong>
              </template>
            </pv-column>

            <pv-column field="diameterMm" :header="t('inventory.nozzles.columns.diameter')" sortable>
              <template #body="{ data }">
                <span>{{ data.diameterMm }} mm</span>
              </template>
            </pv-column>

            <pv-column field="stockUnits" :header="t('inventory.nozzles.columns.units')" sortable>
              <template #body="{ data }">
                <span class="units-badge">{{ data.stockUnits }} und.</span>
              </template>
            </pv-column>

            <pv-column field="status" :header="t('inventory.nozzles.columns.condition')" sortable>
              <template #body="{ data }">
                <pv-tag
                  :value="data.status === 'good' ? t('inventory.nozzles.status.good') : t('inventory.nozzles.status.worn')"
                  :severity="data.status === 'good' ? 'success' : 'danger'"
                />
              </template>
            </pv-column>

            <pv-column :header="t('inventory.columns.actions')">
              <template #body="{ data }">
                <div class="actions-group">
                  <pv-button
                    icon="pi pi-sync"
                    :title="t('inventory.buttons.toggleStatus')"
                    severity="warn"
                    text
                    rounded
                    @click="toggleNozzleCondition(data)"
                  />
                  <pv-button
                    icon="pi pi-pencil"
                    severity="info"
                    text
                    rounded
                    :title="t('inventory.buttons.edit')"
                    @click="openEditNozzle(data)"
                  />
                  <pv-button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    :title="t('inventory.buttons.delete')"
                    @click="requestDelete('nozzle', data)"
                  />
                </div>
              </template>
            </pv-column>
          </pv-datatable>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- DIALOG: Create / Edit Chemical             -->
    <!-- ========================================== -->
    <pv-dialog
      v-model:visible="showChemicalDialog"
      :header="isEditing ? t('inventory.dialog.editChemical') : t('inventory.dialog.newChemical')"
      modal
      class="custom-dialog"
      :style="{ width: '520px' }"
    >
      <div class="dialog-form">
        <!-- Name -->
        <div class="form-field">
          <label class="form-label required">{{ t('inventory.form.name') }}</label>
          <pv-input-text
            v-model="chemicalForm.name"
            :placeholder="t('inventory.form.namePlaceholder')"
            class="w-full"
            :invalid="!!formErrors.name"
          />
          <small v-if="formErrors.name" class="p-error">{{ t(formErrors.name) }}</small>
        </div>

        <!-- Type -->
        <div class="form-field">
          <label class="form-label required">{{ t('inventory.form.type') }}</label>
          <pv-select
            v-model="chemicalForm.type"
            :options="chemicalFormTypeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            :invalid="!!formErrors.type"
          />
          <small v-if="formErrors.type" class="p-error">{{ t(formErrors.type) }}</small>
        </div>

        <!-- Stock Liters & Min Liters (2 cols) -->
        <div class="form-row">
          <div class="form-field col">
            <label class="form-label required">{{ t('inventory.form.stockLiters') }}</label>
            <input
              v-model.number="chemicalForm.stockLiters"
              type="number"
              min="0"
              step="1"
              class="custom-number-input"
            />
            <small v-if="formErrors.stockLiters" class="p-error">{{ t(formErrors.stockLiters) }}</small>
          </div>

          <div class="form-field col">
            <label class="form-label required">{{ t('inventory.form.minStockLiters') }}</label>
            <input
              v-model.number="chemicalForm.minimumStockLiters"
              type="number"
              min="0"
              step="1"
              class="custom-number-input"
            />
            <small v-if="formErrors.minimumStockLiters" class="p-error">{{ t(formErrors.minimumStockLiters) }}</small>
          </div>
        </div>

        <!-- Expiration Date -->
        <div class="form-field">
          <label class="form-label required">{{ t('inventory.form.expirationDate') }}</label>
          <input
            v-model="chemicalForm.expirationDate"
            type="date"
            class="custom-date-input"
          />
          <small v-if="formErrors.expirationDate" class="p-error">{{ t(formErrors.expirationDate) }}</small>
        </div>
      </div>

      <template #footer>
        <pv-button
          :label="t('inventory.buttons.cancel')"
          severity="secondary"
          text
          @click="showChemicalDialog = false"
        />
        <pv-button
          :label="t('inventory.buttons.save')"
          icon="pi pi-check"
          class="btn-primary"
          :loading="saving"
          @click="saveChemical"
        />
      </template>
    </pv-dialog>

    <!-- ========================================== -->
    <!-- DIALOG: Quick Restock                      -->
    <!-- ========================================== -->
    <pv-dialog
      v-model:visible="showRestockDialog"
      :header="t('inventory.dialog.restockTitle')"
      modal
      :style="{ width: '420px' }"
    >
      <div v-if="restockTarget" class="restock-box">
        <p class="restock-intro">
          {{ t('inventory.dialog.restockDescription', { name: restockTarget.name }) }}
        </p>

        <div class="current-stock-info">
          <span>{{ t('inventory.form.stockCurrent') }}: <strong>{{ restockTarget.stockLiters }} L</strong></span>
          <span>{{ t('inventory.form.minStockLiters') }}: <strong>{{ restockTarget.minimumStockLiters }} L</strong></span>
        </div>

        <div class="form-field mt-3">
          <label class="form-label required">{{ t('inventory.dialog.restockLitersLabel') }}</label>
          <input
            v-model.number="restockAmount"
            type="number"
            min="1"
            class="custom-number-input"
          />
        </div>

        <div class="quick-amounts">
          <button type="button" class="amount-pill" @click="restockAmount = 25">+25 L</button>
          <button type="button" class="amount-pill" @click="restockAmount = 50">+50 L</button>
          <button type="button" class="amount-pill" @click="restockAmount = 100">+100 L</button>
        </div>
      </div>

      <template #footer>
        <pv-button
          :label="t('inventory.buttons.cancel')"
          severity="secondary"
          text
          @click="showRestockDialog = false"
        />
        <pv-button
          :label="t('inventory.buttons.confirmRestock')"
          icon="pi pi-check-circle"
          severity="success"
          :loading="saving"
          @click="confirmRestock"
        />
      </template>
    </pv-dialog>

    <!-- ========================================== -->
    <!-- DIALOG: Create / Edit Nozzle               -->
    <!-- ========================================== -->
    <pv-dialog
      v-model:visible="showNozzleDialog"
      :header="isEditing ? t('inventory.dialog.editNozzle') : t('inventory.dialog.newNozzle')"
      modal
      :style="{ width: '480px' }"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label class="form-label required">{{ t('inventory.nozzles.columns.type') }}</label>
          <pv-select
            v-model="nozzleForm.type"
            :options="nozzleTypeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="form-row">
          <div class="form-field col">
            <label class="form-label required">{{ t('inventory.nozzles.form.diameter') }}</label>
            <input
              v-model.number="nozzleForm.diameterMm"
              type="number"
              min="1"
              step="1"
              class="custom-number-input"
            />
          </div>

          <div class="form-field col">
            <label class="form-label required">{{ t('inventory.nozzles.form.units') }}</label>
            <input
              v-model.number="nozzleForm.stockUnits"
              type="number"
              min="0"
              class="custom-number-input"
            />
          </div>
        </div>

        <div class="form-field">
          <label class="form-label required">{{ t('inventory.nozzles.form.status') }}</label>
          <pv-select
            v-model="nozzleForm.status"
            :options="[
              { label: t('inventory.nozzles.status.good'), value: 'good' },
              { label: t('inventory.nozzles.status.worn'), value: 'worn' }
            ]"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <pv-button
          :label="t('inventory.buttons.cancel')"
          severity="secondary"
          text
          @click="showNozzleDialog = false"
        />
        <pv-button
          :label="t('inventory.buttons.save')"
          icon="pi pi-check"
          class="btn-primary"
          :loading="saving"
          @click="saveNozzle"
        />
      </template>
    </pv-dialog>

    <!-- ========================================== -->
    <!-- DIALOG: Delete Confirmation                -->
    <!-- ========================================== -->
    <pv-dialog
      v-model:visible="showDeleteDialog"
      :header="t('inventory.dialog.deleteTitle')"
      modal
      :style="{ width: '420px' }"
    >
      <div v-if="deleteTarget" class="delete-confirmation">
        <i class="pi pi-exclamation-triangle text-amber-500 text-3xl mb-3"></i>
        <p>{{ t('inventory.dialog.deletePrompt', { name: deleteTarget.name }) }}</p>
      </div>

      <template #footer>
        <pv-button
          :label="t('inventory.buttons.cancel')"
          severity="secondary"
          text
          @click="showDeleteDialog = false"
        />
        <pv-button
          :label="t('inventory.buttons.confirmDelete')"
          icon="pi pi-trash"
          severity="danger"
          :loading="saving"
          @click="confirmDelete"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.inventory-view-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color, #1e293b);
  margin: 0 0 0.4rem 0;
}

.view-subtitle {
  font-size: 1rem;
  color: var(--p-text-muted-color, #64748b);
  margin: 0;
}

.btn-primary {
  background: #10b981 !important;
  border-color: #10b981 !important;
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 8px;
}

.btn-primary:hover {
  background: #059669 !important;
  border-color: #059669 !important;
}

/* Top KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kpi-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.bg-emerald .kpi-icon-box {
  background: #ecfdf5;
  color: #059669;
}

.bg-amber .kpi-icon-box {
  background: #fffbeb;
  color: #d97706;
}

.bg-blue .kpi-icon-box {
  background: #eff6ff;
  color: #2563eb;
}

.bg-rose .kpi-icon-box {
  background: #fff1f2;
  color: #e11d48;
}

.bg-slate .kpi-icon-box {
  background: #f1f5f9;
  color: #64748b;
}

.kpi-details {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-top: 0.2rem;
}

/* Main Card & Tabs */
.main-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0 1rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  color: #10b981;
  border-bottom-color: #10b981;
  background: #ffffff;
}

.tab-btn .badge {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-weight: 700;
}

.tab-btn.active .badge {
  background: #d1fae5;
  color: #047857;
}

.tab-content {
  padding: 1.5rem;
}

/* Filters bar */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  border-radius: 8px;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.25rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-caption {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

.filter-select {
  min-width: 11rem;
}

.switch-filter {
  flex-direction: row;
  align-items: center;
  padding-bottom: 0.4rem;
  gap: 0.75rem;
}

/* Table cells */
.table-wrapper {
  overflow-x: auto;
}

.product-cell {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 0.95rem;
  color: #0f172a;
}

.product-id {
  font-size: 0.75rem;
  color: #94a3b8;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.stock-values {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.current-stock {
  font-weight: 700;
  color: #0f172a;
}

.min-threshold {
  font-size: 0.78rem;
  color: #64748b;
}

.stock-bar {
  height: 6px;
  border-radius: 4px;
}

.expiration-cell {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.units-badge {
  font-weight: 700;
  color: #334155;
  background: #f1f5f9;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

/* Form inputs & Dialogs */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-top: 0.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .col {
  flex: 1;
}

.custom-number-input,
.custom-date-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.2s;
}

.custom-number-input:focus,
.custom-date-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.p-error {
  font-size: 0.78rem;
  color: #ef4444;
}

/* Restock Dialog styles */
.restock-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.restock-intro {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
}

.current-stock-info {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #334155;
}

.quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.amount-pill {
  flex: 1;
  padding: 0.5rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.amount-pill:hover {
  background: #10b981;
  color: #ffffff;
}

.delete-confirmation {
  text-align: center;
  padding: 1rem 0;
  color: #334155;
  font-size: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-select {
    width: 100%;
  }
  .form-row {
    flex-direction: column;
  }
}
</style>
