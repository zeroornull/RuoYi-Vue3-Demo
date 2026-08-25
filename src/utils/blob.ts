export function blobValidate(data: { type: string }): boolean {
  return data.type !== "application/json";
}
