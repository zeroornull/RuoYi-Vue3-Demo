declare module "vue-cropper" {
  import type { DefineComponent } from "vue";

  export const VueCropper: DefineComponent<Record<string, unknown>>;

  const plugin: {
    install: (app: unknown) => void;
    VueCropper: typeof VueCropper;
  };
  export default plugin;
}

declare module "vue-cropper/dist/index.css";
