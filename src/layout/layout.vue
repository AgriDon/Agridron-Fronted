<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Navigation item interface for sidebar options
 */
interface NavItem {
  id: string
  label: string
  icon: string
  to: string
}

const route = useRoute()

// Navigation items matching the reference image with respective routes
const menuItems = ref<NavItem[]>([
  { id: 'inicio', label: 'inicio', icon: 'pi pi-home', to: '/inicio' },
  { id: 'fincas', label: 'Fincas', icon: 'pi pi-map', to: '/fincas' },
  { id: 'parcelas', label: 'Parcelas', icon: 'pi pi-th-large', to: '/parcelas' },
  { id: 'misiones', label: 'Misiones', icon: 'pi pi-bullseye', to: '/misiones' },
  { id: 'drones', label: 'Drones', icon: 'pi pi-send', to: '/drones' },
  { id: 'reportes', label: 'Reportes', icon: 'pi pi-clipboard', to: '/reportes' },
  { id: 'configuracion', label: 'Configuración', icon: 'pi pi-cog', to: '/configuracion' }
])

// Search input query
const searchQuery = ref<string>('')

/**
 * Helper to determine whether the route is currently active
 */
const isRouteActive = (targetPath: string): boolean => {
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
        <router-link to="/inicio" class="logo-link">
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
              icon="pi pi-user"
              shape="circle"
              class="user-avatar"
            />
            <div class="user-info">
              <span class="user-name">Juan Perez</span>
              <span class="user-role">Agricultor</span>
            </div>
          </div>
        </template>
      </pv-toolbar>
    </header>

    <!-- Fixed Left Sidebar -->
    <aside class="app-sidebar">
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
  background-color: #f8fafc;
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
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-bottom: 1px solid #e2e8f0;
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
  background-color: #0e876a !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 2.5rem !important;
  height: 100%;
}

/* Search Bar (Rounded pill with black search icon button) */
.search-container {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 9999px;
  padding: 3px 6px 3px 4px;
  width: 360px;
  max-width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-btn {
  background-color: #000000;
  color: #ffffff;
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
  color: #374151 !important;
  text-align: center;
}

.search-input::placeholder {
  color: #9ca3af;
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
  background-color: #3e8fa2 !important;
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
  background-color: #163e33;
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
  background-color: #0f8569;
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

/* Main Content Area */
.main-content {
  margin-left: 240px;
  margin-top: 76px;
  flex: 1;
  padding: 2.5rem 3rem;
  background-color: #ffffff;
  min-height: calc(100vh - 76px);
}
</style>
