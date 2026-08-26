import { describe, expect, test } from "bun:test";
import {
  displayFileName,
  excelUploadUrl,
  isExcelFileName,
  isUploadSuccess,
  limitExceededMessage,
  moveUploadItem,
  parseUploadValue,
  stringifyUploadValue,
  uploadHeaders,
  validateUploadFile,
} from "../../../../src/components/upload/model";

const file = (name: string, size = 1024, type = "application/pdf") => ({
  name,
  size,
  type,
});

describe("upload validation", () => {
  test("rejects type, size, comma and reports the limit", () => {
    expect(
      validateUploadFile(file("a.exe"), {
        kind: "file",
        fileType: ["pdf"],
        fileSizeMb: 5,
      })?.code,
    ).toBe("type");
    expect(
      validateUploadFile(file("a.pdf", 6 * 1024 * 1024), {
        kind: "file",
        fileType: ["pdf"],
        fileSizeMb: 5,
      })?.code,
    ).toBe("size");
    expect(
      validateUploadFile(file("a,b.pdf"), {
        kind: "file",
        fileType: ["pdf"],
        fileSizeMb: 5,
      })?.code,
    ).toBe("comma");
    expect(
      validateUploadFile(file("photo.jpg", 1024, "image/jpeg"), {
        kind: "image",
        fileType: ["png", "jpg", "jpeg"],
        fileSizeMb: 5,
      }),
    ).toBeNull();
    expect(limitExceededMessage(5)).toContain("5");
  });

  test("parses, stringifies, reorders and recovers from a failed payload", () => {
    const parsed = parseUploadValue("a.pdf,b.pdf");
    expect(parsed.map((item) => item.url)).toEqual(["a.pdf", "b.pdf"]);
    expect(stringifyUploadValue(moveUploadItem(parsed, 0, 1))).toBe("b.pdf,a.pdf");
    expect(stringifyUploadValue(parsed, { stripBlob: true })).toBe("a.pdf,b.pdf");
    expect(
      stringifyUploadValue(
        [
          { name: "x", url: "blob:1", uid: 1 },
          { name: "y", url: "/y.png", uid: 2 },
        ],
        { stripBlob: true, baseUrl: "/dev-api" },
      ),
    ).toBe("/y.png");
    expect(isUploadSuccess({ code: 500, msg: "nope" })).toBe(false);
    expect(isUploadSuccess({ code: 200, fileName: "/profile.png" })).toBe(true);
    expect(displayFileName("/a/b.pdf")).toBe("b.pdf");
  });

  test("builds excel import URLs and token headers", () => {
    expect(isExcelFileName("users.XLSX")).toBe(true);
    expect(isExcelFileName("users.txt")).toBe(false);
    expect(excelUploadUrl("/dev-api", "/system/user/importData", true)).toBe(
      "/dev-api/system/user/importData?updateSupport=1",
    );
    expect(uploadHeaders("token-1")).toEqual({ Authorization: "Bearer token-1" });
    expect(uploadHeaders(undefined)).toEqual({});
  });
});
