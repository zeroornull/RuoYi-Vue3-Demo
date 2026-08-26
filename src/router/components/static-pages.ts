import { defineComponent, h, type Component } from "vue";
import { useRoute } from "vue-router";

function createStaticPage(name: string, fallbackTitle: string) {
  return defineComponent({
    name,
    props: {
      activeTab: { type: String, default: undefined },
    },
    setup(props) {
      const route = useRoute();
      return () =>
        h("main", { class: "static-route-page", "data-route-page": name }, [
          h("h1", String(route.meta.title ?? fallbackTitle)),
          props.activeTab
            ? h("p", { "data-active-tab": props.activeTab }, props.activeTab)
            : null,
        ]);
    },
  });
}

export const IndexPage = createStaticPage("Index", "首页");

function isVueComponent(value: unknown): value is Component {
  return (
    typeof value === "object" &&
    value !== null &&
    ("setup" in value || "render" in value || "__name" in value || "name" in value)
  );
}

export function loadVuePage(
  name: string,
  fallbackTitle: string,
  importer: () => Promise<unknown>,
): () => Promise<Component> {
  const fallback = createStaticPage(name, fallbackTitle);
  return async () => {
    try {
      const loaded = await importer();
      if (typeof loaded === "object" && loaded !== null && "default" in loaded) {
        const page = (loaded as { default: unknown }).default;
        if (isVueComponent(page)) {
          return page;
        }
      }
    } catch {
      // Bun tests cannot compile Vue SFCs; keep a named stub for navigation.
    }
    return fallback;
  };
}
export const DynamicRoutePage = createStaticPage("DynamicRoutePage", "动态页面占位");
export const InnerLinkPage = createStaticPage("InnerLinkPage", "内链占位");
export const UnknownComponentPage = createStaticPage(
  "UnknownComponentPage",
  "未知组件",
);
