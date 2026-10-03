<script setup>
// View for Not Found 404
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1 class="view-title">Página no encontrada</h1>
      <p class="view-subtitle">La ruta que intentas acceder no existe.</p>
      <router-link to="/inicio" class="back-link">
        <pv-button label="Volver a Inicio" icon="pi pi-home" />
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}

.header-section {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.view-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.back-link {
  text-decoration: none;
}
</style>
