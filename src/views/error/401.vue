<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import errImage from "../../assets/401_images/401.gif";
import { shouldHistoryBack, unauthorizedBackTarget } from "./model";

defineOptions({ name: "Unauthorized" });

const route = useRoute();
const router = useRouter();
const errGif = ref(`${errImage}?${Date.now()}`);

function back(): void {
  const target = unauthorizedBackTarget(route.query);
  if (shouldHistoryBack(target)) {
    router.go(-1);
    return;
  }
  void router.push(target);
}
</script>

<template>
  <div class="errPage-container">
    <el-button class="pan-back-btn" @click="back">返回</el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo">401错误!</h1>
        <h2>您没有访问权限！</h2>
        <h6>对不起，您没有访问权限，请不要进行非法操作！您可以返回主页面</h6>
        <ul class="list-unstyled">
          <li>
            <router-link to="/">回首页</router-link>
          </li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="没有访问权限" />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
}

.pan-back-btn {
  color: #fff;
  background: #008489;
  border: none !important;
}

.text-jumbo {
  color: #484848;
  font-size: 60px;
  font-weight: 700;
}

.list-unstyled {
  padding: 0;
  font-size: 14px;
  list-style: none;

  a {
    color: #008489;
    text-decoration: none;
  }
}
</style>
