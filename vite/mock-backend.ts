import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { dispatchMockRequest, tokenFromAuthorization } from "./mock/auth.ts";
import { parseMockQuery } from "./mock/query.ts";

function readBody(req: IncomingMessage): Promise<unknown> {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "DELETE") {
    return Promise.resolve(undefined);
  }
  if (req.readableEnded) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch {
        resolve(raw);
      }
    });
    req.on("error", reject);
  });
}

function mockPath(url: string): string | null {
  const path = url.split("?")[0] ?? "";
  if (!path.startsWith("/dev-api")) {
    return null;
  }
  const rest = path.slice("/dev-api".length);
  return rest.length > 0 ? rest : "/";
}

export function mockBackendPlugin(enabled: boolean): Plugin {
  return {
    name: "ruoyi-mock-backend",
    apply: "serve",
    configureServer(server) {
      if (!enabled) {
        return;
      }
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next);
      });
    },
  };
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
): Promise<void> {
  const path = mockPath(req.url ?? "");
  if (path === null) {
    next();
    return;
  }
  const body = await readBody(req);
  const token = tokenFromAuthorization(
    typeof req.headers.authorization === "string"
      ? req.headers.authorization
      : undefined,
  );
  const result = dispatchMockRequest({
    method: req.method ?? "GET",
    path,
    body,
    query: parseMockQuery(req.url ?? ""),
    ...(token === undefined ? {} : { token }),
  });
  res.statusCode = result.status;
  res.setHeader(
    "Content-Type",
    result.contentType ?? "application/json;charset=utf-8",
  );
  res.end(result.raw ?? JSON.stringify(result.body));
}
