import { describe, expect, test } from "bun:test";
import {
  previewSourceList,
  primaryPreviewSource,
  toCssSize,
} from "../../../../src/components/ImagePreview/model";

describe("ImagePreview sources", () => {
  test("prefixes relative paths and keeps external URLs", () => {
    expect(primaryPreviewSource("/profile.jpg", "/dev-api")).toBe(
      "/dev-api/profile.jpg",
    );
    expect(
      previewSourceList("https://cdn.example/a.png,/b.png", "/dev-api"),
    ).toEqual(["https://cdn.example/a.png", "/dev-api/b.png"]);
    expect(previewSourceList("", "/dev-api")).toEqual([]);
  });

  test("normalizes numeric sizes to px", () => {
    expect(toCssSize(80)).toBe("80px");
    expect(toCssSize("100%")).toBe("100%");
  });
});
