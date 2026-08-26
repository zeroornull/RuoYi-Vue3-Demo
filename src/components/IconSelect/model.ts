export function filterIconNames(
  icons: readonly string[],
  keyword: string,
): string[] {
  if (keyword.length === 0) {
    return [...icons];
  }
  return icons.filter((name) => name.includes(keyword));
}
