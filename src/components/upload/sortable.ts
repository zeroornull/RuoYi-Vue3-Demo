import Sortable, { type Options, type SortableEvent } from "sortablejs";

export function bindSortableList(
  element: HTMLElement | null,
  onEnd: (from: number, to: number) => void,
  ghostClass?: string,
): { destroy: () => void } | null {
  if (!element) {
    return null;
  }
  const options: Options = {
    onEnd(event: SortableEvent) {
      if (event.oldIndex === undefined || event.newIndex === undefined) {
        return;
      }
      onEnd(event.oldIndex, event.newIndex);
    },
  };
  if (ghostClass) {
    options.ghostClass = ghostClass;
  }
  const instance = Sortable.create(element, options);
  return { destroy: () => instance.destroy() };
}
