<template>
  <div class="app-container">
    <el-form ref="formRef" :model="formData" size="default" label-width="100px" label-position="right">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="mobile" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary">提交</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import {
  reactive
} from "vue";
const formData = reactive({
  mobile: "",
});

</script>
