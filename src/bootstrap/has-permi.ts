import type { Directive, DirectiveBinding } from "vue";
import { pinia } from "../stores";
import { useUserStore } from "../stores/modules/user";
import { checkPermi } from "../utils/permission";

function apply(el: HTMLElement, binding: DirectiveBinding<unknown>): void {
  const store = useUserStore(pinia);
  if (checkPermi(store.permissions, binding.value)) {
    return;
  }
  el.parentNode?.removeChild(el);
}

export const hasPermiDirective: Directive<HTMLElement, unknown> = {
  mounted: apply,
};
