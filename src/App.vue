<script setup lang="ts">
import { computed } from "vue";
import { RouterView } from "vue-router";
import { useRoute } from "vue-router";
import AdminLayout from "./layout/index.vue";
import { shouldUseAdminShell } from "./layout/model";

const route = useRoute();
const useShell = computed(() => shouldUseAdminShell({ name: route.name, meta: route.meta }));
</script>

<template>
  <AdminLayout v-if="useShell" />
  <RouterView v-else />
</template>
