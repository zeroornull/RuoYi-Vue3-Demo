<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { createTable } from "../../../api/tool/gen";

const emit = defineEmits<{
  ok: [];
}>();

const visible = ref(false);
const sql = ref("");

async function handleCreate(): Promise<void> {
  if (sql.value.trim() === "") {
    ElMessage.error("请输入建表语句");
    return;
  }
  const response = await createTable({
    sql: sql.value,
    tplWebType: "element-plus",
  });
  ElMessage.success(response.msg ?? "创建成功");
  visible.value = false;
  emit("ok");
}

function show(): void {
  sql.value = "";
  visible.value = true;
}

defineExpose({ show });
</script>

<template>
  <el-dialog v-model="visible" title="创建表" width="800px" top="5vh" append-to-body>
    <span>创建表语句(支持多个建表语句)：</span>
    <el-input v-model="sql" type="textarea" :rows="10" placeholder="请输入文本" />
    <template #footer>
      <el-button type="primary" @click="handleCreate">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>
