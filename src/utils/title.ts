export function buildPageTitle(options: { dynamicTitle: boolean; pageTitle?: string; appTitle: string }): string {
  if (options.dynamicTitle && options.pageTitle) {
    return `${options.pageTitle} - ${options.appTitle}`;
  }
  return options.appTitle;
}
