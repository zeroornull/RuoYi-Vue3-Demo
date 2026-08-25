import { ElLoading, ElMessage, ElMessageBox, ElNotification } from "element-plus";
import type { HttpUi } from "./ui";

export const elementHttpUi: HttpUi = {
  error(message) {
    ElMessage({ message, type: "error", duration: 5 * 1000 });
  },
  warning(message) {
    ElMessage({ message, type: "warning" });
  },
  notifyError(title) {
    ElNotification.error({ title });
  },
  confirmRelogin() {
    return ElMessageBox.confirm(
      "登录状态已过期，您可以继续留在该页面，或者重新登录",
      "系统提示",
      {
        confirmButtonText: "重新登录",
        cancelButtonText: "取消",
        type: "warning",
      },
    ).then(
      () => true,
      () => false,
    );
  },
  showLoading(text) {
    return ElLoading.service({
      text,
      background: "rgba(0, 0, 0, 0.7)",
    });
  },
};
