import { defineComponent, h } from "vue";
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

export const LoginPage = createStaticPage("Login", "登录");
export const RegisterPage = createStaticPage("Register", "注册");
export const UnauthorizedPage = createStaticPage("Unauthorized", "无权限");
export const NotFoundPage = createStaticPage("NotFound", "页面不存在");
export const IndexPage = createStaticPage("Index", "首页");
export const LockPage = createStaticPage("Lock", "锁定屏幕");
export const ProfilePage = createStaticPage("Profile", "个人中心");
export const DynamicRoutePage = createStaticPage("DynamicRoutePage", "动态页面占位");
export const InnerLinkPage = createStaticPage("InnerLinkPage", "内链占位");
export const UnknownComponentPage = createStaticPage(
  "UnknownComponentPage",
  "未知组件",
);
