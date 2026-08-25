export function readCookie(name: string): string | undefined {
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  const hit = parts.find((part) => part.startsWith(prefix));
  if (hit === undefined) {
    return undefined;
  }
  return decodeURIComponent(hit.slice(prefix.length));
}
