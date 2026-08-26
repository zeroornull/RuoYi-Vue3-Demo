import { describe, expect, test } from "vitest";
import Pagination from "../../src/components/Pagination/index.vue";
import { mountPage } from "./mount";

describe("Pagination component", () => {
  test("emits page and limit together when the pager changes", async () => {
    const wrapper = mountPage(Pagination, {
      props: { total: 100, page: 2, limit: 20, autoScroll: false },
    });
    await wrapper.getComponent({ name: "ElPagination" }).vm.$emit("current-change", 3);
    expect(wrapper.emitted("pagination")?.[0]).toEqual([{ page: 3, limit: 20 }]);
  });

  test("resets to page 1 when the new size would pass total", async () => {
    const wrapper = mountPage(Pagination, {
      props: { total: 100, page: 3, limit: 20, autoScroll: false },
    });
    await wrapper.getComponent({ name: "ElPagination" }).vm.$emit("size-change", 50);
    expect(wrapper.emitted("update:page")?.[0]).toEqual([1]);
    expect(wrapper.emitted("pagination")?.[0]).toEqual([{ page: 1, limit: 50 }]);
  });

  test("hides the pager when requested", () => {
    const wrapper = mountPage(Pagination, { props: { total: 100, hidden: true } });
    expect(wrapper.get(".pagination-container").classes()).toContain("hidden");
  });
});
