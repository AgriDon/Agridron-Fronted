<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UserProfileService } from '@/shared/application/user-profile-service.js'

const { t } = useI18n()
const userService = new UserProfileService()

// Active tab
const activeTab = ref('perfil')

const tabs = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'integraciones', label: 'Integraciones' }
]

// User data
const loading = ref(true)
const saving = ref(false)
const user = ref({
  id: 1,
  name: 'Juan Pérez',
  email: 'juan.perez@gmail.com',
  role: 'Agricultor',
  avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400',
  preferences: {
    emailNotifications: true,
    appNotifications: true,
    weatherAlerts: true
  }
})

// Edit profile dialog
const showEditDialog = ref(false)
const editForm = ref({
  name: '',
  email: '',
  avatar: ''
})
const feedbackMessage = ref('')

const loadUser = async () => {
  loading.value = true
  try {
    const data = await userService.getCurrentUser(1)
    if (data) {
      user.value = {
        ...user.value,
        ...data,
        preferences: {
          ...user.value.preferences,
          ...(data.preferences || {})
        }
      }
    }
  } catch (err) {
    console.error('Error cargando perfil:', err)
  } finally {
    loading.value = false
  }
}

const openEditModal = () => {
  editForm.value = {
    name: user.value.name,
    email: user.value.email,
    avatar: user.value.avatar
  }
  feedbackMessage.value = ''
  showEditDialog.value = true
}

const handleSaveProfile = async () => {
  saving.value = true
  try {
    await userService.updateProfile(user.value.id, {
      name: editForm.value.name,
      email: editForm.value.email,
      avatar: editForm.value.avatar
    })
    user.value.name = editForm.value.name
    user.value.email = editForm.value.email
    user.value.avatar = editForm.value.avatar
    showEditDialog.value = false
  } catch (err) {
    feedbackMessage.value = 'No se pudo actualizar el perfil.'
  } finally {
    saving.value = false
  }
}

const handlePreferenceChange = async () => {
  try {
    await userService.updatePreferences(user.value.id, user.value.preferences)
  } catch (err) {
    console.error('Error guardando preferencias:', err)
  }
}

onMounted(loadUser)
</script>

<template>
  <div class="settings-view">
    <h1 class="settings-page-title">Configuración</h1>

    <div class="settings-card-wrapper">
      <!-- Left Vertical Navigation Tabs -->
      <aside class="settings-sidebar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ 'tab-button--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </aside>

      <!-- Right Main Content Panel -->
      <main class="settings-content-panel">
        <!-- Tab: Perfil -->
        <section v-if="activeTab === 'perfil'" class="tab-content">
          <div class="section-block">
            <h2 class="section-title">Información del usuario</h2>

            <div class="user-info-grid">
              <!-- Avatar -->
              <div class="avatar-container">
                <img
                  :src="user.avatar || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400'"
                  :alt="user.name"
                  class="user-avatar-img"
                />
              </div>

              <!-- Details -->
              <div class="user-details">
                <div class="detail-field">
                  <span class="field-label">Nombre</span>
                  <span class="field-value">{{ user.name }}</span>
                </div>

                <div class="detail-field">
                  <span class="field-label">Correo</span>
                  <span class="field-value">{{ user.email }}</span>
                </div>

                <div class="detail-field">
                  <span class="field-label">Rol</span>
                  <span class="field-value">{{ user.role }}</span>
                </div>
              </div>
            </div>

            <!-- Edit Button Row -->
            <div class="edit-action-row">
              <pv-button
                label="Editar Perfil"
                class="edit-profile-btn"
                @click="openEditModal"
              />
            </div>
          </div>

          <!-- Preferences Section -->
          <div class="section-block preferences-block">
            <h2 class="section-title">Preferencias</h2>

            <div class="preference-list">
              <!-- Item 1: Email -->
              <div class="preference-item">
                <div class="preference-info">
                  <i class="pi pi-envelope preference-icon"></i>
                  <span class="preference-text">Notificaciones por correo</span>
                </div>
                <pv-toggle-switch
                  v-model="user.preferences.emailNotifications"
                  @change="handlePreferenceChange"
                  class="preference-switch"
                />
              </div>

              <!-- Item 2: App Notifications -->
              <div class="preference-item">
                <div class="preference-info">
                  <i class="pi pi-bell preference-icon"></i>
                  <span class="preference-text">Notificaciones en la app</span>
                </div>
                <pv-toggle-switch
                  v-model="user.preferences.appNotifications"
                  @change="handlePreferenceChange"
                  class="preference-switch"
                />
              </div>

              <!-- Item 3: Weather Alerts -->
              <div class="preference-item">
                <div class="preference-info">
                  <i class="pi pi-cloud preference-icon"></i>
                  <span class="preference-text">Alertas meteorológicas</span>
                </div>
                <pv-toggle-switch
                  v-model="user.preferences.weatherAlerts"
                  @change="handlePreferenceChange"
                  class="preference-switch"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Tab: Notificaciones -->
        <section v-else-if="activeTab === 'notificaciones'" class="tab-content">
          <h2 class="section-title">Canales de Notificación</h2>
          <p class="tab-placeholder-desc">
            Configura la frecuencia de los resúmenes semanales y avisos de telemetría de vuelo.
          </p>
          <div class="preference-list">
            <div class="preference-item">
              <div class="preference-info">
                <i class="pi pi-envelope preference-icon"></i>
                <span class="preference-text">Resumen semanal de labores fitosanitarias</span>
              </div>
              <pv-toggle-switch v-model="user.preferences.emailNotifications" @change="handlePreferenceChange" />
            </div>
          </div>
        </section>

        <!-- Tab: Seguridad -->
        <section v-else-if="activeTab === 'seguridad'" class="tab-content">
          <h2 class="section-title">Seguridad y Credenciales</h2>
          <p class="tab-placeholder-desc">
            Administra tus credenciales de acceso y permisos de operador.
          </p>
          <div class="security-box">
            <p><strong>Contraseña:</strong> ••••••••••••</p>
            <pv-button label="Cambiar contraseña" severity="secondary" outlined size="small" />
          </div>
        </section>

        <!-- Tab: Integraciones -->
        <section v-else-if="activeTab === 'integraciones'" class="tab-content">
          <h2 class="section-title">Integraciones Externas</h2>
          <p class="tab-placeholder-desc">
            Conexión con estaciones meteorológicas locales y APIs satelitales.
          </p>
          <div class="integration-item">
            <div>
              <strong>OpenWeatherMap API:</strong> Conectado activamente.
            </div>
            <pv-tag severity="success" value="En línea" />
          </div>
        </section>
      </main>
    </div>

    <!-- Edit Profile Dialog (HU AU-005) -->
    <pv-dialog
      v-model:visible="showEditDialog"
      modal
      header="Editar Perfil de Usuario"
      :style="{ width: '28rem' }"
    >
      <form class="edit-profile-form" @submit.prevent="handleSaveProfile">
        <pv-message v-if="feedbackMessage" severity="error" :closable="false">
          {{ feedbackMessage }}
        </pv-message>

        <div class="form-group">
          <label for="edit-name">Nombre completo</label>
          <pv-input-text id="edit-name" v-model="editForm.name" required class="w-full" />
        </div>

        <div class="form-group">
          <label for="edit-email">Correo electrónico</label>
          <pv-input-text id="edit-email" v-model="editForm.email" type="email" required class="w-full" />
        </div>

        <div class="form-group">
          <label for="edit-avatar">URL de Avatar</label>
          <pv-input-text id="edit-avatar" v-model="editForm.avatar" class="w-full" />
        </div>

        <div class="dialog-actions">
          <pv-button label="Cancelar" text severity="secondary" @click="showEditDialog = false" />
          <pv-button label="Guardar cambios" type="submit" :loading="saving" />
        </div>
      </form>
    </pv-dialog>
  </div>
</template>

<style scoped>
.settings-view {
  width: 100%;
}

.settings-page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* Outer layout matching mockup */
.settings-card-wrapper {
  display: grid;
  grid-template-columns: 220px 1fr;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Left vertical tabs sidebar */
.settings-sidebar {
  padding: 1.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tab-button {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 0.85rem 1.25rem;
  text-align: left;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.5);
}

.tab-button--active {
  background: #86efac;
  color: #064e3b;
  font-weight: 700;
}

/* Right content panel */
.settings-content-panel {
  background: #ffffff;
  padding: 2.25rem 2.5rem;
  min-height: 480px;
}

.section-block {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* User Info Layout */
.user-info-grid {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin-bottom: 1.5rem;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.detail-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
}

.field-value {
  font-size: 1.05rem;
  color: #4b5563;
  font-weight: 500;
}

/* Action button */
.edit-action-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

:deep(.edit-profile-btn) {
  background: #19906d !important;
  border-color: #19906d !important;
  color: #ffffff !important;
  padding: 0.65rem 1.75rem !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
}

:deep(.edit-profile-btn:hover) {
  background: #15803d !important;
  border-color: #15803d !important;
}

/* Preferences block */
.preferences-block {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.75rem;
}

.preference-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 550px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preference-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preference-icon {
  font-size: 1.35rem;
  color: #19906d;
}

.preference-text {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
}

/* Custom styling for switch matching mock */
:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: #19906d !important;
}

/* Form in edit dialog */
.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1f2937;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.tab-placeholder-desc {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.security-box,
.integration-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-width: 550px;
}

/* Responsiveness */
@media (max-width: 768px) {
  .settings-card-wrapper {
    grid-template-columns: 1fr;
  }
  .settings-content-panel {
    padding: 1.5rem;
  }
}
</style>
