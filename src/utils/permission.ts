export const ALL_PERMISSION = "*:*:*";
export const SUPER_ADMIN = "admin";

export function checkPermi(
  owned: readonly string[],
  required: unknown,
): boolean {
  if (Array.isArray(required) && required.length > 0) {
    const needed = required.filter((item): item is string => typeof item === "string");
    return owned.some(
      (permission) =>
        permission === ALL_PERMISSION || needed.includes(permission),
    );
  }
  console.error(
    `need roles! Like checkPermi="['system:user:add','system:user:edit']"`,
  );
  return false;
}

export function checkRole(owned: readonly string[], required: unknown): boolean {
  if (Array.isArray(required) && required.length > 0) {
    const needed = required.filter((item): item is string => typeof item === "string");
    return owned.some(
      (role) => role === SUPER_ADMIN || needed.includes(role),
    );
  }
  console.error(`need roles! Like checkRole="['admin','editor']"`);
  return false;
}
