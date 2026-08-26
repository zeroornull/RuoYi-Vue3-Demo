import { beforeEach, describe, expect, test } from "bun:test";
import { swaggerUiUrl } from "../../src/api/tool/swagger";
import { resolveBackendComponent } from "../../src/router/component-resolver";
import { migratedViewLoaders } from "../../src/router/view-registry";
import { swaggerPageUrl } from "../../src/views/tool/swagger/model";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";
import { SWAGGER_UI_HTML } from "../../vite/mock/tool.ts";

beforeEach(() => {
  resetMockAuthState();
});

describe("swagger iframe", () => {
  test("joins the UI path onto the API prefix", () => {
    expect(swaggerUiUrl("/dev-api/")).toBe("/dev-api/swagger-ui/index.html");
    expect(swaggerPageUrl("/dev-api")).toBe("/dev-api/swagger-ui/index.html");
  });

  test("registers the typed swagger view instead of the dynamic placeholder", () => {
    const resolved = resolveBackendComponent({
      component: "tool/swagger/index",
      hasChildren: false,
      link: undefined,
      hasRedirect: false,
    });
    expect(resolved.issue).toBeUndefined();
    expect(resolved.component).toBe(migratedViewLoaders["tool/swagger/index"]);
  });

  test("serves the mock Swagger UI without a token", () => {
    const result = dispatchMockRequest({
      method: "GET",
      path: "/swagger-ui/index.html",
    });
    expect(result.status).toBe(200);
    expect(result.contentType).toContain("text/html");
    expect(result.raw).toBe(SWAGGER_UI_HTML);
    expect(result.raw).toContain("Swagger UI");
  });

  test("exposes swagger on the tool router tree", () => {
    const routers = dispatchMockRequest({
      method: "GET",
      path: "/getRouters",
      token: MOCK_TOKEN,
    });
    const data = routers.body.data as Array<{
      name: string;
      children?: Array<{ name: string; path: string; component: string }>;
    }>;
    const swagger = data.find((item) => item.name === "Tool")?.children?.find((item) => item.name === "Swagger");
    expect(swagger?.path).toBe("swagger");
    expect(swagger?.component).toBe("tool/swagger/index");
  });
});
