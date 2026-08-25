declare module "*.svg?component" {
  import type { FunctionalComponent, SVGAttributes } from "vue";

  const SvgComponent: FunctionalComponent<SVGAttributes>;
  export default SvgComponent;
}
