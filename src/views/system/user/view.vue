<script setup lang="ts">
import { computed, ref, unref } from "vue";
import { getUser } from "../../../api/system/user";
import { useDict } from "../../../composables/useDict";
import { parseTime } from "../../../utils/parse-time";
import type { Post, Role } from "../../../types/api/system";
import { dictLabel, joinOptionNames, USER_VIEW_NAME, type UserDetail } from "./model";

defineOptions({ name: USER_VIEW_NAME });

const { sys_user_sex } = useDict("sys_user_sex");
const visible = ref(false);
const loading = ref(false);
const info = ref<UserDetail | null>(null);
const postOptions = ref<Post[]>([]);
const roleOptions = ref<Role[]>([]);

const sexLabel = computed(() =>
  dictLabel(unref(sys_user_sex), info.value?.sex, "-"),
);
const postNames = computed(() =>
  joinOptionNames(
    postOptions.value,
    info.value?.postIds,
    (item) => item.postId,
    (item) => item.postName,
    "无岗位",
  ),
);
const roleNames = computed(() =>
  joinOptionNames(
    roleOptions.value,
    info.value?.roleIds,
    (item) => item.roleId,
    (item) => item.roleName,
    "无角色",
  ),
);

async function open(userId: string): Promise<void> {
  visible.value = true;
  loading.value = true;
  try {
    const response = await getUser(userId);
    const data = (response.data ?? {
      userId,
      userName: "",
      nickName: "",
      status: "0" as const,
    }) as UserDetail;
    info.value = {
      ...data,
      postIds: response.postIds ?? data.postIds ?? [],
      roleIds: response.roleIds ?? data.roleIds ?? [],
    };
    postOptions.value = response.posts ?? [];
    roleOptions.value = response.roles ?? [];
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <el-drawer v-model="visible" title="用户信息详情" direction="rtl" size="68%" append-to-body>
    <div v-loading="loading" class="drawer-content">
      <h4 class="section-header">基本信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">用户名称：</span>{{ info?.nickName }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item"><span class="info-label">归属部门：</span>{{ info?.dept?.deptName }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">手机号码：</span>{{ info?.phonenumber }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item"><span class="info-label">邮箱：</span>{{ info?.email }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">登录账号：</span>{{ info?.userName }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">用户状态：</span>
            <el-tag size="small" :type="info?.status === '0' ? 'success' : 'danger'">
              {{ info?.status === "0" ? "正常" : "停用" }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">岗位：</span>{{ postNames }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item"><span class="info-label">用户性别：</span>{{ sexLabel }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="24">
          <div class="info-item"><span class="info-label">角色：</span>{{ roleNames }}</div>
        </el-col>
      </el-row>
      <h4 class="section-header">其他信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">创建者：</span>{{ info?.createBy }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item"><span class="info-label">创建时间：</span>{{ parseTime(info?.createTime) }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">更新者：</span>{{ info?.updateBy }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item"><span class="info-label">更新时间：</span>{{ parseTime(info?.updateTime) }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item"><span class="info-label">最后登录IP：</span>{{ info?.loginIp }}</div>
        </el-col>
        <el-col :span="12">
          <div class="info-item"><span class="info-label">最后登录时间：</span>{{ parseTime(info?.loginDate) }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="24">
          <div class="info-item"><span class="info-label">备注：</span>{{ info?.remark }}</div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<style scoped>
.section-header {
  padding-bottom: 8px;
  margin: 0 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item {
  display: flex;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

.info-label {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
