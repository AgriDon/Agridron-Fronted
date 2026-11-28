<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from './shared/presentation/components/layout.vue'

const route = useRoute()
const router = useRouter()
const isRouterReady = ref(false)

router.isReady().then(() => {
  isRouterReady.value = true
})

const hideNavigation = computed(() =>
  route.matched.some((record) => Boolean(record.meta?.hideNavigation))
)
</script>

<template>
  <pv-toast />
  <template v-if="isRouterReady">
    <router-view v-if="hideNavigation" />
    <Layout v-else />
  </template>
</template>
