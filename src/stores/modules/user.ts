import {
  getInfo as getInfoApi,
  login as loginApi,
  logout as logoutApi,
} from "../../api/login";
import { appEnv } from "../../config/env";
import { getToken, removeToken, setToken } from "../../http/token";
import { browserSessionStore } from "../persistence";
import {
  createUseUserStore,
  type UserStoreDeps,
} from "./user-core";
import { useLockStore } from "./lock";

const browserDeps: UserStoreDeps = {
  login: loginApi,
  getInfo: getInfoApi,
  logout: logoutApi,
  readToken: getToken,
  writeToken(token) {
    setToken(token);
  },
  clearToken: removeToken,
  unlockScreen: () => useLockStore().unlockScreen(),
  baseApi: appEnv.baseApi,
  sessionStorage: browserSessionStore,
};

export const useUserStore = createUseUserStore(browserDeps);
export default useUserStore;
export * from "./user-core";
