export type FullscreenDocument = {
  fullscreenElement: Element | null;
  webkitFullscreenElement?: Element | null;
  documentElement: {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  };
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
};

export function isDocumentFullscreen(doc: FullscreenDocument): boolean {
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

export async function toggleDocumentFullscreen(
  doc: FullscreenDocument,
): Promise<boolean> {
  if (isDocumentFullscreen(doc)) {
    await (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.();
    return false;
  }
  await (
    doc.documentElement.requestFullscreen ??
    doc.documentElement.webkitRequestFullscreen
  )?.();
  return true;
}

export function fullscreenIconName(active: boolean): "exit-fullscreen" | "fullscreen" {
  return active ? "exit-fullscreen" : "fullscreen";
}
