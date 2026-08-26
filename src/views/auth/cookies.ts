import Cookies from "js-cookie";
import type { CookieJar } from "./model";

export const browserCookieJar: CookieJar = {
  get(name) {
    return Cookies.get(name);
  },
  set(name, value, options) {
    Cookies.set(name, value, options);
  },
  remove(name) {
    Cookies.remove(name);
  },
};
