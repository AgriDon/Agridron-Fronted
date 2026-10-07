<script setup>
// View for 'Inicio' dashboard
</script>

<template>
  <div class="view-container">
    <div class="welcome-section">
      <h1 class="welcome-title">!Bienvenido, Juan¡</h1>
      <p class="welcome-subtitle">Aqui tienes un resumen de tus operaciones</p>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-text-color);
  opacity: 0.65;
  margin: 0;
}
</style>
