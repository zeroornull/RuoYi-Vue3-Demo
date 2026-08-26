import { describe, expect, test } from "bun:test";
import {
  EDITOR_EMPTY_HTML,
  editorImageUrl,
  nextEditorIndex,
  normalizeEditorHtml,
  validateEditorImage,
} from "../../../../src/components/Editor/model";
import { resetForm, submitForm } from "../../../../src/components/form";
import { filterIconNames } from "../../../../src/components/IconSelect/model";
import {
  fullscreenIconName,
  isDocumentFullscreen,
  toggleDocumentFullscreen,
  type FullscreenDocument,
} from "../../../../src/components/Screenfull/model";

describe("Editor html and image boundaries", () => {
  test("normalizes empty HTML and validates image type/size", () => {
    expect(normalizeEditorHtml(undefined)).toBe(EDITOR_EMPTY_HTML);
    expect(normalizeEditorHtml("<p>hi</p>")).toBe("<p>hi</p>");
    expect(
      validateEditorImage({ type: "application/pdf", size: 10 }, 5)?.code,
    ).toBe("type");
    expect(
      validateEditorImage({ type: "image/png", size: 6 * 1024 * 1024 }, 5)?.code,
    ).toBe("size");
    expect(validateEditorImage({ type: "image/jpeg", size: 10 }, 5)).toBeNull();
    expect(editorImageUrl("/dev-api", "/profile.png")).toBe("/dev-api/profile.png");
    expect(nextEditorIndex(undefined)).toBe(0);
    expect(nextEditorIndex(4)).toBe(4);
  });
});

describe("typed form submit", () => {
  test("validates, rejects failure and resets without exposing internals", async () => {
    expect(await submitForm(undefined)).toBe(false);
    expect(
      await submitForm({
        validate: async () => undefined,
        resetFields: () => undefined,
      }),
    ).toBe(true);
    expect(
      await submitForm({
        validate: async () => {
          throw new Error("invalid");
        },
        resetFields: () => undefined,
      }),
    ).toBe(false);
    let reset = false;
    resetForm({
      validate: async () => undefined,
      resetFields: () => {
        reset = true;
      },
    });
    expect(reset).toBe(true);
  });
});

describe("IconSelect and Screenfull helpers", () => {
  test("filters icon names and toggles fullscreen state", async () => {
    expect(filterIconNames(["user", "system", "custom-user"], "user")).toEqual([
      "user",
      "custom-user",
    ]);
    expect(fullscreenIconName(true)).toBe("exit-fullscreen");
    const doc: FullscreenDocument = {
      fullscreenElement: null,
      documentElement: {
        requestFullscreen: async () => {
          doc.fullscreenElement = doc.documentElement as unknown as Element;
        },
      },
      exitFullscreen: async () => {
        doc.fullscreenElement = null;
      },
    };
    expect(isDocumentFullscreen(doc)).toBe(false);
    expect(await toggleDocumentFullscreen(doc)).toBe(true);
    expect(isDocumentFullscreen(doc)).toBe(true);
    expect(await toggleDocumentFullscreen(doc)).toBe(false);
  });
});
