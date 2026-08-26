import { http } from "../http";
import type { CaptchaResponse, LoginRequest, LoginResponse, RegisterRequest, UserInfoResponse } from "../types/api";
import type { EmptyResponse } from "../types/http";
import { parseLoginResponse, parseUserInfoResponse } from "./contracts";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await http.post<unknown>("/login", data, {
    ruoyi: { withToken: false, preventDuplicateSubmit: false },
  });
  return parseLoginResponse(response);
}

export function register(data: RegisterRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/register", data, {
    ruoyi: { withToken: false },
  });
}

export async function getInfo(): Promise<UserInfoResponse> {
  return parseUserInfoResponse(await http.get<unknown>("/getInfo"));
}

export function unlockScreen(password: string): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/unlockscreen", { password });
}

export function logout(): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/logout");
}

export function getCodeImg(): Promise<CaptchaResponse> {
  return http.get<CaptchaResponse>("/captchaImage", {
    timeout: 20000,
    ruoyi: { withToken: false },
  });
}
