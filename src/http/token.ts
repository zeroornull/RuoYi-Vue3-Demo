import Cookies from "js-cookie";

export const TOKEN_COOKIE_KEY = "Admin-Token";

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_KEY);
}

export function setToken(token: string): string | undefined {
  return Cookies.set(TOKEN_COOKIE_KEY, token);
}

export function removeToken(): void {
  Cookies.remove(TOKEN_COOKIE_KEY);
}
