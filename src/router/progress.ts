import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export type NavigationProgress = {
  start: () => void;
  done: () => void;
};

export const navigationProgress: NavigationProgress = {
  start: () => NProgress.start(),
  done: () => NProgress.done(),
};
