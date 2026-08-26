declare module "sortablejs" {
  export type SortableEvent = {
    oldIndex?: number;
    newIndex?: number;
  };

  export type Options = {
    ghostClass?: string;
    onEnd?: (event: SortableEvent) => void;
  };

  export default class Sortable {
    constructor(element: HTMLElement, options?: Options);
    static create(element: HTMLElement, options?: Options): Sortable;
    destroy(): void;
  }
}
