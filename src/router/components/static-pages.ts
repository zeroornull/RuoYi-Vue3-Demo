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

export const LoginPage = createStaticPage("LoginPage", "登录");
export const RegisterPage = createStaticPage("RegisterPage", "注册");
export const UnauthorizedPage = createStaticPage("UnauthorizedPage", "无权限");
export const NotFoundPage = createStaticPage("NotFoundPage", "页面不存在");
export const IndexPage = createStaticPage("IndexPage", "首页");
export const LockPage = createStaticPage("LockPage", "锁定屏幕");
export const ProfilePage = createStaticPage("ProfilePage", "个人中心");
