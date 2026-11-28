<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './shared/presentation/components/layout.vue'

const route = useRoute()
const hideNavigation = computed(() => Boolean(route.meta?.hideNavigation))
</script>

<template>
  <pv-toast />
  <router-view v-if="hideNavigation" />
  <Layout v-else />
</template>
