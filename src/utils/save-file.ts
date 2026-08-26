import { saveAs } from "file-saver";

/** Typed file-saver boundary. Views and HTTP download go through here, not the package. */
export function saveFile(data: Blob, filename: string): void {
  saveAs(data, filename);
}
