<script setup lang="ts">
import { computed } from "vue";
import { appEnv } from "../../../config/env";
import { SWAGGER_PAGE_NAME, swaggerPageUrl } from "./model";

defineOptions({ name: SWAGGER_PAGE_NAME });

const url = computed(() => swaggerPageUrl(appEnv.baseApi));
</script>

<template>
  <div class="swagger-frame">
    <iframe
      :src="url"
      title="系统接口"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
</template>

<style scoped>
.swagger-frame,
.swagger-frame iframe {
  width: 100%;
  height: calc(100vh - 90px);
  border: 0;
}
</style>
