<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UserProfileService } from '@/shared/application/user-profile-service.js'

const route = useRoute()
const userService = new UserProfileService()
const currentUser = ref({
  name: 'Juan Pérez',
  role: 'Agricultor',
  avatar: ''
})

const isMobileSidebarOpen = ref(false)

const toggleSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeSidebar = () => {
  isMobileSidebarOpen.value = false
}

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false
})

const loadProfile = async () => {
  try {
    const data = await userService.getCurrentUser(1)
    if (data) {
      currentUser.value = data
    }
  } catch (e) {
    // fallback defaults
  }
}

onMounted(() => {
  loadProfile()
  window.addEventListener('user-profile-updated', (e) => {
    if (e.detail) {
      currentUser.value = { ...currentUser.value, ...e.detail }
    }
  })
})

// Navigation items matching the reference image with respective routes
const menuItems = ref([
  { id: 'inicio', label: 'inicio', icon: 'pi pi-home', to: '/inicio' },
  { id: 'fincas', label: 'Fincas', icon: 'pi pi-map', to: '/fincas' },
  { id: 'parcelas', label: 'Parcelas', icon: 'pi pi-th-large', to: '/parcelas' },
  { id: 'cultivos', label: 'Cultivos', icon: 'pi pi-apple', to: '/cultivos' },
  { id: 'misiones', label: 'Misiones', icon: 'pi pi-bullseye', to: '/misiones' },
  { id: 'drones', label: 'Drones', icon: 'pi pi-send', to: '/drones' },
  { id: 'reportes', label: 'Reportes', icon: 'pi pi-clipboard', to: '/reportes' },
  { id: 'configuracion', label: 'Configuración', icon: 'pi pi-cog', to: '/configuracion' }
])

// Search input query
const searchQuery = ref('')

/**
 * Helper to determine whether the route is currently active
 */
const isRouteActive = (targetPath) => {
  if (targetPath === '/inicio') {
    return route.path === '/inicio' || route.path === '/'
  }
  return route.path.startsWith(targetPath)
}
</script>

<template>
  <div class="layout-container">
    <!-- Top Header Bar containing Logo box and PrimeVue Toolbar -->
    <header class="app-header">
      <!-- Fixed Logo Box on the top-left (matching sidebar width) -->
      <div class="logo-wrapper">
        <button
          type="button"
          class="mobile-toggle-btn"
          aria-label="Abrir o cerrar menú"
          @click="toggleSidebar"
        >
          <i :class="isMobileSidebarOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
        </button>

        <router-link to="/inicio" class="logo-link" @click="closeSidebar">
          <img
            src="/Agridron_Logo.png"
            alt="AgriDron Solutions"
            class="logo-image"
          />
        </router-link>
      </div>

      <!-- PrimeVue Toolbar with Search and User Profile -->
      <pv-toolbar class="header-toolbar">
        <template #start>
          <!-- Optional left slot if needed -->
        </template>

        <template #center>
          <!-- Search input with PrimeVue components -->
          <div class="search-container">
            <button class="search-btn" aria-label="Buscar">
              <i class="pi pi-search"></i>
            </button>
            <pv-input-text
              v-model="searchQuery"
              placeholder="¿Que buscas hoy?"
              class="search-input"
            />
          </div>
        </template>

        <template #end>
          <!-- User Profile Section with PrimeVue Avatar -->
          <div class="user-profile">
            <pv-avatar
              :image="currentUser.avatar || undefined"
              :icon="!currentUser.avatar ? 'pi pi-user' : undefined"
              shape="circle"
              class="user-avatar"
            />
            <div class="user-info">
              <span class="user-name">{{ currentUser.name }}</span>
              <span class="user-role">{{ currentUser.role }}</span>
            </div>
          </div>
        </template>
      </pv-toolbar>
    </header>

    <!-- Backdrop for mobile drawer -->
    <div
      v-if="isMobileSidebarOpen"
      class="sidebar-backdrop"
      @click="closeSidebar"
    ></div>

    <!-- Left Sidebar (fixed desktop, drawer overlay mobile) -->
    <aside
      class="app-sidebar"
      :class="{ 'sidebar-open': isMobileSidebarOpen }"
    >
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li
            v-for="item in menuItems"
            :key="item.id"
          >
            <router-link
              :to="item.to"
              class="nav-item"
              :class="{ active: isRouteActive(item.to) }"
              @click="closeSidebar"
            >
              <i :class="[item.icon, 'nav-icon']"></i>
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content Area with Router View -->
    <main class="main-content">
      <!-- The slot lets wrappers project extra content alongside the outlet.
           Both must stay siblings: any child inside <router-view> turns into
           a fallback and the routed component is dropped. -->
      <slot />
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* Main Layout Container */
.layout-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: var(--p-content-background, #f8fafc);
}

/* Header & Logo Container */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 76px;
  display: flex;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.logo-wrapper {
  width: 240px;
  min-width: 240px;
  height: 100%;
  background-color: var(--p-content-background, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-bottom: 1px solid var(--p-content-border-color, #e2e8f0);
}

.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  height: 100%;
}

.logo-image {
  max-width: 90%;
  max-height: 52px;
  object-fit: contain;
}

/* Toolbar Styling */
.header-toolbar {
  flex: 1;
  background-color: var(--agridron-brand) !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 2.5rem !important;
  height: 100%;
}

/* Search Bar (Rounded pill with a contrasting search icon button) */
.search-container {
  display: flex;
  align-items: center;
  background-color: var(--p-form-field-background, #ffffff);
  border-radius: 9999px;
  padding: 3px 6px 3px 4px;
  width: 360px;
  max-width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-btn {
  /* Inverts with the theme: dark pill on light, light pill on dark. */
  background-color: var(--p-text-color, #000000);
  color: var(--p-content-background, #ffffff);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.85;
}

.search-btn i {
  font-size: 0.95rem;
}

.search-input {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  flex: 1;
  padding: 0 12px !important;
  font-size: 0.95rem !important;
  color: var(--p-text-color, #374151) !important;
  text-align: center;
}

.search-input::placeholder {
  color: var(--p-text-color, #9ca3af);
  opacity: 0.5;
  font-weight: 400;
}

/* User Profile Section */
.user-profile {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

:deep(.user-avatar) {
  background-color: var(--agridron-avatar) !important;
  color: #ffffff !important;
  width: 46px !important;
  height: 46px !important;
  font-size: 1.4rem !important;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.user-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
}

.user-role {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Fixed Sidebar */
.app-sidebar {
  position: fixed;
  top: 76px;
  left: 0;
  bottom: 0;
  width: 240px;
  background-color: var(--agridron-brand-dark);
  padding: 1.5rem 0.85rem;
  overflow-y: auto;
  z-index: 900;
}

.sidebar-nav {
  width: 100%;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  border-radius: 6px;
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-item.active {
  background-color: var(--agridron-brand-active);
}

.nav-icon {
  font-size: 1.45rem;
  width: 26px;
  text-align: center;
}

.nav-label {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* Mobile Menu Toggle Button */
.mobile-toggle-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--p-text-color, #111827);
  font-size: 1.35rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  line-height: 1;
  align-items: center;
  justify-content: center;
}

.mobile-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Sidebar Backdrop for Mobile */
.sidebar-backdrop {
  display: none;
}

/* Main Content Area */
.main-content {
  margin-left: 240px;
  margin-top: 76px;
  flex: 1;
  padding: 2.5rem 3rem;
  background-color: var(--p-content-background, #ffffff);
  min-height: calc(100vh - 76px);
}

/* Responsive Media Queries */
@media (max-width: 992px) {
  .mobile-toggle-btn {
    display: inline-flex;
    margin-right: 0.5rem;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    top: 76px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 950;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .logo-wrapper {
    width: auto;
    min-width: unset;
    padding: 0 0.85rem;
  }

  .logo-image {
    max-height: 42px;
  }

  .header-toolbar {
    padding: 0 1rem !important;
  }

  .search-container {
    width: 100%;
    max-width: 280px;
  }

  .app-sidebar {
    top: 76px;
    width: 250px;
    max-width: 80vw;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    box-shadow: none;
  }

  .app-sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
  }

  .main-content {
    margin-left: 0;
    padding: 1.75rem 1.25rem;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }
}

@media (max-width: 640px) {
  .app-header {
    height: 70px;
  }

  .logo-wrapper {
    height: 70px;
    padding: 0 0.5rem;
  }

  .logo-image {
    max-height: 36px;
  }

  .header-toolbar {
    padding: 0 0.5rem !important;
  }

  .search-container {
    max-width: 190px;
    padding: 2px 4px;
  }

  .search-input {
    font-size: 0.85rem !important;
    padding: 0 6px !important;
  }

  .search-btn {
    width: 30px;
    height: 30px;
  }

  .search-btn i {
    font-size: 0.85rem;
  }

  .user-info {
    display: none;
  }

  :deep(.user-avatar) {
    width: 38px !important;
    height: 38px !important;
    font-size: 1.1rem !important;
  }

  .app-sidebar {
    top: 70px;
  }

  .sidebar-backdrop {
    top: 70px;
  }

  .main-content {
    margin-top: 70px;
    padding: 1.25rem 0.85rem;
    min-height: calc(100vh - 70px);
  }
}

@media (max-width: 420px) {
  .search-container {
    max-width: 140px;
  }

  .search-input::placeholder {
    font-size: 0.78rem;
  }
}
</style>
