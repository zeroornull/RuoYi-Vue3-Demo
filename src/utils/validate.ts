export function isPathMatch(pattern: string, path: string): boolean {
  const regexPattern = pattern
    .replace(/([.+^${}()|[\]\\])/g, "\\$1")
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*")
    .replace(/\?/g, "[^/]");
  return new RegExp(`^${regexPattern}$`).test(path);
}

export function isEmpty(value: unknown): boolean {
  return (
    value == null ||
    value === "" ||
    value === undefined ||
    value === "undefined"
  );
}

export function isHttp(url: string): boolean {
  return url.includes("http://") || url.includes("https://");
}

export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path);
}

export function validUsername(str: string): boolean {
  return ["admin", "editor"].includes(str.trim());
}

export function validURL(url: string): boolean {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
}

export function validLowerCase(str: string): boolean {
  return /^[a-z]+$/.test(str);
}

export function validUpperCase(str: string): boolean {
  return /^[A-Z]+$/.test(str);
}

export function validAlphabets(str: string): boolean {
  return /^[A-Za-z]+$/.test(str);
}

export function validEmail(email: string): boolean {
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
