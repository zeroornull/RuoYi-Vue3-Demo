import Sortable, { type Options, type SortableEvent } from "sortablejs";

export function bindSortableList(
  element: HTMLElement | null,
  onEnd: (from: number, to: number) => void,
  ghostClass?: string,
  handle?: string,
): { destroy: () => void } | null {
  if (!element) {
    return null;
  }
  const options: Options & { handle?: string } = {
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
  if (handle) {
    options.handle = handle;
  }
  const instance = Sortable.create(element, options);
  return { destroy: () => instance.destroy() };
}
