import type { Router } from "vue-router";
import { fallbackAfterClose, routeToTagView } from "../../layout/model";
import type { useRoute } from "vue-router";
import type { useTagsViewStore } from "../../stores/modules/tags-view";

export function closeCurrentPage(
  router: Router,
  route: ReturnType<typeof useRoute>,
  tagsStore: ReturnType<typeof useTagsViewStore>,
): void {
  const view = routeToTagView(route);
  if (view) {
    const remaining = tagsStore.delView(view).visitedViews;
    void router.push(
      fallbackAfterClose(remaining.map((item) => item.fullPath ?? item.path)),
    );
    return;
  }
  void router.push({ name: "Index" });
}
