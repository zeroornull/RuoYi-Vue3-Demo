import { describe, expect, test } from "bun:test";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { createHttpClient } from "../../../src/http/client";
import { createJsonCache, createMemoryStore } from "../../../src/http/cache";
import type { HttpUi } from "../../../src/http/ui";

type ScriptedResponse = {
  data: unknown;
  status?: number;
  headers?: Record<string, string>;
};

function createUi() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const notifications: string[] = [];
  let confirmCount = 0;
  let confirm: Promise<boolean> = Promise.resolve(true);
  const ui: HttpUi = {
    error: (message) => {
      errors.push(message);
    },
    warning: (message) => {
      warnings.push(message);
    },
    notifyError: (title) => {
      notifications.push(title);
    },
    confirmRelogin: () => {
      confirmCount += 1;
      return confirm;
    },
    showLoading: () => ({ close: () => undefined }),
  };
  return {
    ui,
    errors,
    warnings,
    notifications,
    confirmCount: () => confirmCount,
    setConfirm(promise: Promise<boolean>) {
      confirm = promise;
    },
  };
}

function jsonAdapter(
  calls: InternalAxiosRequestConfig[],
  script: (config: InternalAxiosRequestConfig) => ScriptedResponse | Error,
): AxiosAdapter {
  return async (config) => {
    calls.push(config);
    const result = script(config);
    if (result instanceof Error) {
      throw result;
    }
    return {
      data: result.data,
      status: result.status ?? 200,
      statusText: "OK",
      headers: result.headers ?? {},
      config,
    };
  };
}

function headerValue(config: InternalAxiosRequestConfig, name: string): unknown {
  const headers = config.headers as unknown as Record<string, unknown>;
  return headers[name] ?? headers[name.toLowerCase()];
}

describe("http client", () => {
  test("attaches a bearer token unless explicitly disabled", async () => {
    const calls: InternalAxiosRequestConfig[] = [];
    const { ui } = createUi();
    const withToken = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => "abc",
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      adapter: jsonAdapter(calls, () => ({
        data: { code: 200, data: true },
      })),
    });
    await withToken.get("/user");
    expect(headerValue(calls[0]!, "Authorization")).toBe("Bearer abc");

    calls.length = 0;
    await withToken.get("/anon", { ruoyi: { withToken: false } });
    expect(headerValue(calls[0]!, "Authorization")).toBeUndefined();

    calls.length = 0;
    await withToken.get("/ordinary-headers", {
      headers: { "X-Request-Source": "test" },
    });
    expect(headerValue(calls[0]!, "Authorization")).toBe("Bearer abc");
  });

  test("serializes GET params onto the url", async () => {
    const calls: InternalAxiosRequestConfig[] = [];
    const { ui } = createUi();
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => undefined,
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      adapter: jsonAdapter(calls, () => ({
        data: { code: 200, data: 1 },
      })),
    });
    const payload = await client.get<{ ok: boolean }>("/list", {
      params: { name: "a b", nested: { id: "1" } },
    });
    expect(payload).toEqual({ code: 200, data: 1 });
    expect(calls[0]?.url).toBe("/list?name=a%20b&nested%5Bid%5D=1");
    expect(calls[0]?.params).toEqual({});
  });

  test("rejects duplicate POST/PUT inside the interval and skips huge payloads", async () => {
    const calls: InternalAxiosRequestConfig[] = [];
    const { ui } = createUi();
    let now = 1000;
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => undefined,
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      now: () => now,
      repeatLimit: 64,
      adapter: jsonAdapter(calls, () => ({
        data: { code: 200, data: true },
      })),
    });
    await client.post("/save", { id: 1 });
    await expect(client.post("/save", { id: 1 })).rejects.toThrow("数据正在处理，请勿重复提交");
    expect(calls).toHaveLength(1);

    now += 2000;
    await client.post("/save", { id: 1 });
    expect(calls).toHaveLength(2);

    await client.post("/save", { id: 1 }, { ruoyi: { preventDuplicateSubmit: false } });
    expect(calls).toHaveLength(3);

    const huge = { blob: "x".repeat(200) };
    await client.post("/huge", huge);
    await client.post("/huge", huge);
    expect(calls).toHaveLength(5);
  });

  test("maps business codes and unwraps 200 payloads", async () => {
    const { ui, errors, warnings, notifications } = createUi();
    const script = (url: string | undefined) => {
      if (url === "/ok") return { data: { code: 200, data: { id: "1" } } };
      if (url === "/fail") return { data: { code: 500, msg: "boom" } };
      if (url === "/warn") return { data: { code: 601, msg: "careful" } };
      return { data: { code: 403, msg: "nope" } };
    };
    const calls: InternalAxiosRequestConfig[] = [];
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => undefined,
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      adapter: jsonAdapter(calls, (config) => script(config.url)),
    });
    await expect(client.get<{ id: string }>("/ok")).resolves.toEqual({
      code: 200,
      data: { id: "1" },
    });
    await expect(client.get("/fail")).rejects.toThrow("boom");
    await expect(client.get("/warn")).rejects.toThrow("careful");
    await expect(client.get("/other")).rejects.toBe("error");
    expect(errors).toEqual(["boom"]);
    expect(warnings).toEqual(["careful"]);
    expect(notifications).toEqual(["当前操作没有权限"]);
  });

  test("shows a single re-login confirm for concurrent 401s", async () => {
    const { ui, confirmCount, setConfirm } = createUi();
    let release: (value: boolean) => void = () => undefined;
    setConfirm(
      new Promise<boolean>((resolve) => {
        release = resolve;
      }),
    );
    let expired = 0;
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => "t",
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => {
        expired += 1;
      },
      adapter: jsonAdapter([], () => ({ data: { code: 401 } })),
    });
    const first = client.get("/a");
    const second = client.get("/b");
    await Promise.allSettled([first, second]);
    expect(confirmCount()).toBe(1);
    release(true);
    await Promise.resolve();
    expect(expired).toBe(1);
    await expect(first).rejects.toBe("无效的会话，或者会话已过期，请重新登录。");
  });

  test("returns blob/arraybuffer bodies without reading business codes", async () => {
    const blob = new Blob(["file"], { type: "text/plain" });
    const { ui, errors } = createUi();
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => undefined,
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      adapter: jsonAdapter([], (config) => {
        if (config.responseType === "blob") {
          return { data: blob };
        }
        return { data: new Uint8Array([1, 2]) };
      }),
    });
    await expect(client.requestBlob({ url: "/file" })).resolves.toBe(blob);
    const binary = await client.raw.request({
      url: "/bin",
      responseType: "arraybuffer",
    });
    expect(binary).toEqual(new Uint8Array([1, 2]));
    expect(errors).toEqual([]);
  });

  test("maps network, timeout and HTTP status errors", async () => {
    const { ui, errors } = createUi();
    const messages = ["Network Error", "timeout of 10000ms exceeded", "Request failed with status code 404"];
    let index = 0;
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => undefined,
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      adapter: async () => {
        const message = messages[index] ?? "other";
        index += 1;
        throw new Error(message);
      },
    });
    await expect(client.get("/n")).rejects.toBeTruthy();
    await expect(client.get("/t")).rejects.toBeTruthy();
    await expect(client.get("/s")).rejects.toBeTruthy();
    expect(errors).toEqual(["后端接口连接异常", "系统接口请求超时", "系统接口404异常"]);
  });
});
