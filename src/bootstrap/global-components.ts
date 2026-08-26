import type { App } from "vue";
import DictTag from "../components/DictTag/index.vue";
import Editor from "../components/Editor/index.vue";
import FileUpload from "../components/FileUpload/index.vue";
import ImagePreview from "../components/ImagePreview/index.vue";
import ImageUpload from "../components/ImageUpload/index.vue";
import Pagination from "../components/Pagination/index.vue";
import RightToolbar from "../components/RightToolbar/index.vue";
import SvgIcon from "../components/SvgIcon.vue";

export { GLOBAL_SHARED_COMPONENT_NAMES } from "./global-component-names";

export const GLOBAL_SHARED_COMPONENTS = {
  SvgIcon,
  DictTag,
  Pagination,
  RightToolbar,
  ImagePreview,
  FileUpload,
  ImageUpload,
  Editor,
} as const;

export function installGlobalComponents(app: App): void {
  for (const [name, component] of Object.entries(GLOBAL_SHARED_COMPONENTS)) {
    app.component(name, component);
  }
}
