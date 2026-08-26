<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { getUserProfile } from "../../api/system/user";
import SvgIcon from "../../components/SvgIcon.vue";
import { parseProfileActiveTab } from "../../router/params";
import type { SystemUser } from "../../types/api/system";
import ResetPwd from "./ResetPwd.vue";
import UserAvatar from "./UserAvatar.vue";
import UserInfo from "./UserInfo.vue";
import { PROFILE_COMPONENT_NAME, profileInfoFromUser, type ProfileInfoForm } from "./model";

defineOptions({ name: PROFILE_COMPONENT_NAME });

const route = useRoute();
const selectedTab = ref(parseProfileActiveTab(route.params.activeTab) ?? "userinfo");
const state = reactive({
  user: null as SystemUser | null,
  roleGroup: "",
  postGroup: "",
});

async function getUser(): Promise<void> {
  const response = await getUserProfile();
  state.user = response.data ?? null;
  state.roleGroup = response.roleGroup;
  state.postGroup = response.postGroup;
}

function onProfileUpdated(form: ProfileInfoForm): void {
  if (!state.user) {
    return;
  }
  Object.assign(state.user, profileInfoFromUser(form));
}

onMounted(() => {
  void getUser();
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card>
          <template #header>个人信息</template>
          <div class="text-center">
            <UserAvatar />
          </div>
          <ul class="list-group">
            <li class="list-group-item">
              <SvgIcon name="user" :size="14" /> 用户名称
              <div class="pull-right">{{ state.user?.userName }}</div>
            </li>
            <li class="list-group-item">
              <SvgIcon name="phone" :size="14" /> 手机号码
              <div class="pull-right">{{ state.user?.phonenumber }}</div>
            </li>
            <li class="list-group-item">
              <SvgIcon name="email" :size="14" /> 用户邮箱
              <div class="pull-right">{{ state.user?.email }}</div>
            </li>
            <li class="list-group-item">
              <SvgIcon name="tree" :size="14" /> 所属部门
              <div v-if="state.user?.dept" class="pull-right">
                {{ state.user.dept.deptName }} / {{ state.postGroup }}
              </div>
            </li>
            <li class="list-group-item">
              <SvgIcon name="peoples" :size="14" /> 所属角色
              <div class="pull-right">{{ state.roleGroup }}</div>
            </li>
            <li class="list-group-item">
              <SvgIcon name="date" :size="14" /> 创建日期
              <div class="pull-right">{{ state.user?.createTime }}</div>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>基本资料</template>
          <el-tabs v-model="selectedTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <UserInfo :user="state.user" @updated="onProfileUpdated" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <ResetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.app-container {
  padding: 8px;
}

.text-center {
  margin-bottom: 16px;
  text-align: center;
}

.list-group {
  padding: 0;
  margin: 0;
  list-style: none;
}

.list-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--app-border, #ebeef5);
}

.pull-right {
  color: var(--app-text-muted, #909399);
}
</style>
