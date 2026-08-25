export function firstTitle(titles: string[]): string {
  // @ts-expect-error noUncheckedIndexedAccess: titles[0] is string | undefined
  return titles[0];
}

export function firstTitleSafe(titles: string[]): string | undefined {
  return titles[0];
}
