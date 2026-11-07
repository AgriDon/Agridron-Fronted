<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="view-container">
    <h1>{{ t('monitoring.title', 'Cabina de Monitoreo de Vuelo') }} #{{ route.params.id }}</h1>
    <pv-button icon="pi pi-arrow-left" label="Volver a Misiones" @click="router.push('/misiones')" />
  </div>
</template>

<style scoped>
.view-container {
  width: 100%;
}
</style>
