<script setup lang="ts">
import { ElButton, ElPagination } from "element-plus";
import { ref } from "vue";
import { useAppTitle } from "@/composables/useAppTitle";
import { appEnv } from "@/config/env";

const round = 6;
const title = useAppTitle();
const dark = ref(false);

function toggleDark(): void {
  dark.value = !dark.value;
  document.documentElement.classList.toggle("dark", dark.value);
}
</script>

<template>
  <main class="scaffold-shell">
    <h1>{{ title }}</h1>
    <p>Round {{ round }}: application bootstrap</p>
    <p>{{ appEnv.appEnv }} {{ appEnv.baseApi }}</p>
    <el-button type="primary">确定</el-button>
    <el-button @click="toggleDark">{{ dark ? "浅色" : "暗色" }}</el-button>
    <el-pagination :total="100" layout="total, prev, pager, next" />
  </main>
</template>
