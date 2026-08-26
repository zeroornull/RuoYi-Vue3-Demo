import { describe, expect, test } from "bun:test";
import type { AxiosAdapter } from "axios";
import { createHttpClient } from "../../../src/http/client";
import { createJsonCache, createMemoryStore } from "../../../src/http/cache";
import { downloadForm } from "../../../src/http/download";
import type { HttpUi } from "../../../src/http/ui";

describe("downloadForm", () => {
  test("closes loading on success, json error blob, and transport failure", async () => {
    let loading = 0;
    const errors: string[] = [];
    const saved: Array<{ name: string; size: number }> = [];
    const ui: HttpUi = {
      error: (message) => {
        errors.push(message);
      },
      warning: () => undefined,
      notifyError: () => undefined,
      confirmRelogin: async () => false,
      showLoading: () => {
        loading += 1;
        return {
          close: () => {
            loading -= 1;
          },
        };
      },
    };

    const scripted: Array<Blob | Error> = [
      new Blob(["file"], { type: "application/octet-stream" }),
      {
        type: "application/json",
        size: 24,
        text: async () => JSON.stringify({ code: 500, msg: "nope" }),
      } as Blob,
      new Error("boom"),
    ];
    let index = 0;
    const adapter: AxiosAdapter = async (config) => {
      const next = scripted[index] ?? new Error("empty");
      index += 1;
      if (next instanceof Error) {
        throw next;
      }
      return {
        data: next,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };
    const client = createHttpClient({
      baseURL: "/dev-api",
      getToken: () => "t",
      cache: createJsonCache(createMemoryStore()),
      ui,
      onSessionExpired: () => undefined,
      adapter,
    });

    await downloadForm(
      {
        client,
        ui,
        saveAs: (blob, name) => {
          saved.push({ name, size: blob.size });
        },
      },
      "/export",
      { id: 1 },
      "a.xlsx",
    );
    expect(saved).toEqual([{ name: "a.xlsx", size: 4 }]);
    expect(loading).toBe(0);

    await downloadForm({ client, ui, saveAs: () => undefined }, "/export-json", {}, "b.xlsx");
    expect(errors).toContain("nope");
    expect(loading).toBe(0);

    await downloadForm({ client, ui, saveAs: () => undefined }, "/export-fail", {}, "c.xlsx");
    expect(errors).toContain("下载文件出现错误，请联系管理员！");
    expect(loading).toBe(0);
  });
});
