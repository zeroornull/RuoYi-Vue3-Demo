import { getRouters } from "../../api/menu";
import { protectedRoutes } from "../../router/protected-routes";
import { staticRoutes } from "../../router/routes";
import { createUsePermissionStore, type PermissionStoreDeps } from "./permission-core";

const browserDeps: PermissionStoreDeps = {
  constantRoutes: staticRoutes,
  protectedRoutes,
  loadBackendRoutes: async () => (await getRouters()).data,
  reportIssues: (issues) => {
    for (const issue of issues) {
      console.error(`[dynamic-route:${issue.code}] ${issue.routePath}: ${issue.detail}`);
    }
  },
};

export const usePermissionStore = createUsePermissionStore(browserDeps);
export default usePermissionStore;
export * from "./permission-core";
