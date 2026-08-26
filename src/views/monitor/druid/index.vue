<script setup lang="ts">
import { computed } from "vue";
import { appEnv } from "../../../config/env";
import { DRUID_PAGE_NAME, druidLoginUrl } from "./model";

defineOptions({ name: DRUID_PAGE_NAME });

const url = computed(() => druidLoginUrl(appEnv.baseApi));
</script>

<template>
  <div class="druid-frame">
    <iframe
      :src="url"
      title="Druid 监控"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
</template>

<style scoped>
.druid-frame,
.druid-frame iframe {
  width: 100%;
  height: calc(100vh - 90px);
  border: 0;
}
</style>
