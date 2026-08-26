<script setup lang="ts">
import { reactive, ref } from "vue";
import { Minus, Plus, RefreshLeft, RefreshRight, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { UploadRawFile } from "element-plus";
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";
import { uploadAvatar } from "../../api/system/user";
import { elementComponentUi } from "../../components/ui";
import { useUserStore } from "../../stores/modules/user";
import fallbackAvatarUrl from "../../assets/images/profile.jpg";
import { avatarUploadFormData, validateAvatarFile } from "./model";

type CropperInstance = {
  rotateLeft: () => void;
  rotateRight: () => void;
  changeScale: (num: number) => void;
  getCropBlob: (callback: (data: Blob) => void) => void;
};

type CropPreview = {
  url?: string;
  img?: Record<string, string>;
};

const userStore = useUserStore();
const open = ref(false);
const visible = ref(false);
const cropper = ref<CropperInstance>();
const options = reactive({
  img: userStore.avatar || fallbackAvatarUrl,
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: "png",
  filename: "avatar",
  previews: {} as CropPreview,
});

function editCropper(): void {
  open.value = true;
}

function modalOpened(): void {
  visible.value = true;
}

function requestUpload(): void {
  return;
}

function rotateLeft(): void {
  cropper.value?.rotateLeft();
}

function rotateRight(): void {
  cropper.value?.rotateRight();
}

function changeScale(num: number): void {
  cropper.value?.changeScale(num);
}

function beforeUpload(file: UploadRawFile): boolean {
  const error = validateAvatarFile(file);
  if (error) {
    elementComponentUi.error(error.message);
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    if (typeof reader.result === "string") {
      options.img = reader.result;
      options.filename = file.name;
    }
  };
  return false;
}

function uploadImg(): void {
  cropper.value?.getCropBlob((data) => {
    const formData = avatarUploadFormData(data, options.filename);
    void uploadAvatar(formData)
      .then((response) => {
        open.value = false;
        visible.value = false;
        userStore.applyAvatar(response.imgUrl);
        options.img = userStore.avatar || fallbackAvatarUrl;
        ElMessage.success("修改成功");
      })
      .catch(() => {
        elementComponentUi.error("头像上传失败，请重试");
      });
  });
}

function realTime(data: CropPreview): void {
  options.previews = data;
}

function closeDialog(): void {
  options.img = userStore.avatar || fallbackAvatarUrl;
  visible.value = false;
}
</script>

<template>
  <div class="user-info-head" @click="editCropper">
    <img :src="options.img" title="点击上传头像" class="img-circle img-lg" alt="" />
    <el-dialog v-model="open" title="修改头像" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" class="avatar-pane">
          <VueCropper
            v-if="visible"
            ref="cropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            :output-type="options.outputType"
            @real-time="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" class="avatar-pane">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url" :style="options.previews.img" alt="" />
          </div>
        </el-col>
      </el-row>
      <el-row class="avatar-actions">
        <el-col :lg="2" :md="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button>
              选择
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button :icon="Plus" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="Minus" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshLeft" @click="rotateLeft" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshRight" @click="rotateRight" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
  cursor: pointer;
}

.img-circle {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
}

.user-info-head:hover::after {
  position: absolute;
  inset: 0;
  color: #eee;
  font-size: 24px;
  line-height: 110px;
  text-align: center;
  content: "+";
  background: rgb(0 0 0 / 50%);
  border-radius: 50%;
}

.avatar-pane {
  height: 350px;
}

.avatar-actions {
  margin-top: 16px;
}
</style>
