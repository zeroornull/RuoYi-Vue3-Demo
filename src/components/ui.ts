import { ElLoading, ElMessage, ElMessageBox } from "element-plus";

export type LoadingHandle = {
  close: () => void;
};

export type ComponentUi = {
  error: (message: string) => void;
  loading: (text: string) => LoadingHandle;
  alertHtml: (html: string, title: string) => Promise<void>;
};

export const elementComponentUi: ComponentUi = {
  error(message) {
    ElMessage({ message, type: "error" });
  },
  loading(text) {
    return ElLoading.service({
      text,
      background: "rgba(0, 0, 0, 0.7)",
    });
  },
  alertHtml(html, title) {
    return ElMessageBox.alert(
      `<div style="overflow:auto;overflow-x:hidden;max-height:70vh;padding:10px 20px 0;">${html}</div>`,
      title,
      { dangerouslyUseHTMLString: true },
    ).then(
      () => undefined,
      () => undefined,
    );
  },
};
