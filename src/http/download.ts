import type { RuoYiRequestConfig } from "../types/http";
import { blobValidate } from "../utils/blob";
import { isRecord, parseJsonUnknown } from "../utils/guard";
import { resolveErrorMessage } from "../utils/error-code";
import { tansParams } from "../utils/params";
import type { HttpClient } from "./client";
import type { HttpUi } from "./ui";

export type DownloadDeps = {
  client: HttpClient;
  ui: HttpUi;
  saveAs: (blob: Blob, filename: string) => void;
};

function messageFromBlobJson(text: string): string {
  const parsed = parseJsonUnknown(text);
  if (!isRecord(parsed)) {
    return resolveErrorMessage("default");
  }
  const code = parsed.code;
  const msg = typeof parsed.msg === "string" ? parsed.msg : undefined;
  return resolveErrorMessage(typeof code === "number" || typeof code === "string" ? code : "default", msg);
}

export async function downloadForm(
  deps: DownloadDeps,
  url: string,
  params: Record<string, unknown>,
  filename: string,
  config?: RuoYiRequestConfig,
): Promise<void> {
  const loading = deps.ui.showLoading("正在下载数据，请稍候");
  try {
    const data = await deps.client.requestBlob({
      url,
      method: "post",
      data: params,
      transformRequest: [(body: unknown) => tansParams(body as Record<string, unknown>)],
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      ...config,
    });
    if (blobValidate(data)) {
      deps.saveAs(new Blob([data]), filename);
      return;
    }
    deps.ui.error(messageFromBlobJson(await data.text()));
  } catch (error) {
    console.error(error);
    deps.ui.error("下载文件出现错误，请联系管理员！");
  } finally {
    loading.close();
  }
}
