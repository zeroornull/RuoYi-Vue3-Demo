import { describe, expect, test } from "bun:test";
import { API_MIGRATION_MANIFEST } from "../../../src/api/migration-manifest";
import { encodeIdCollection, encodePathSegment } from "../../../src/api/shared";
import { swaggerUiUrl } from "../../../src/api/tool/swagger";

describe("API migration coverage", () => {
  test("maps all 19 legacy API files to typed targets", async () => {
    expect(API_MIGRATION_MANIFEST).toHaveLength(19);
    for (const record of API_MIGRATION_MANIFEST) {
      expect(record.status).toBe("migrated");
      expect(await Bun.file(record.source).exists()).toBe(true);
      expect(await Bun.file(record.target).exists()).toBe(true);
    }
  });

  test("classifies ordinary, page, empty and blob responses", () => {
    const kinds = new Set(
      API_MIGRATION_MANIFEST.flatMap((record) => record.responseKinds),
    );
    expect([...kinds].sort()).toEqual(["blob", "data", "empty", "page"]);
  });

  test("encodes dynamic path values without corrupting comma-separated IDs", () => {
    expect(encodePathSegment("a/b c")).toBe("a%2Fb%20c");
    expect(encodeIdCollection(["9007199254740993", "2/3"])).toBe(
      "9007199254740993,2%2F3",
    );
  });

  test("builds the Swagger UI boundary from the configured API prefix", () => {
    expect(swaggerUiUrl("/dev-api/")).toBe("/dev-api/swagger-ui/index.html");
  });
});
