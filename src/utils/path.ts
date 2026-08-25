export function getNormalPath(path: string): string {
  if (path.length === 0 || !path || path === "undefined") {
    return path;
  }
  const res = path.replace("//", "/");
  if (res.endsWith("/")) {
    return res.slice(0, -1);
  }
  return res;
}
