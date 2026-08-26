export {};

declare module "vue" {
  interface GlobalDirectives {
    hasPermi: import("vue").Directive<HTMLElement, readonly string[] | unknown>;
  }
  interface GlobalComponents {
    SvgIcon: typeof import("../components/SvgIcon.vue")["default"];
    DictTag: typeof import("../components/DictTag/index.vue")["default"];
    Pagination: typeof import("../components/Pagination/index.vue")["default"];
    RightToolbar: typeof import("../components/RightToolbar/index.vue")["default"];
    ImagePreview: typeof import("../components/ImagePreview/index.vue")["default"];
    FileUpload: typeof import("../components/FileUpload/index.vue")["default"];
    ImageUpload: typeof import("../components/ImageUpload/index.vue")["default"];
    Editor: typeof import("../components/Editor/index.vue")["default"];
  }
}
