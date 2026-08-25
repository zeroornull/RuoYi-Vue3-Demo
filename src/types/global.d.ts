export {};

declare module "vue" {
  interface ComponentCustomProperties {
    $appTitle: string;
  }
}
