import { getDarkColor, getLightColor, softenPrimaryForDark } from "../utils/theme-color";

export type ThemeVariables = Record<string, string>;

export function isHexTheme(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function buildThemeVariables(
  theme: string,
  isDark: boolean,
): ThemeVariables {
  const primary = isHexTheme(theme) ? theme : "#409EFF";
  const variables: ThemeVariables = {
    "--app-primary": primary,
    "--el-color-primary": isDark ? softenPrimaryForDark(primary) : primary,
    "--el-color-primary-dark-2": getDarkColor(primary, 0.2),
  };
  for (let level = 1; level <= 9; level += 1) {
    variables[`--el-color-primary-light-${level}`] = getLightColor(
      primary,
      level / 10,
    );
  }
  return variables;
}

export function applyThemeVariables(
  target: CSSStyleDeclaration,
  theme: string,
  isDark: boolean,
): void {
  for (const [name, value] of Object.entries(
    buildThemeVariables(theme, isDark),
  )) {
    target.setProperty(name, value);
  }
}
