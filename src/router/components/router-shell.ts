import { defineComponent, h } from "vue";
import { RouterView } from "vue-router";

export const RouterShell = defineComponent({
  name: "RouterShell",
  setup: () => () => h(RouterView),
});
