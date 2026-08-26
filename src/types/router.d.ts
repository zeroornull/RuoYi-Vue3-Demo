import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    icon?: string;
    noCache?: boolean;
    affix?: boolean;
    breadcrumb?: boolean;
    activeMenu?: string;
    link?: string | null;
    public?: boolean;
  }
}

export {};
