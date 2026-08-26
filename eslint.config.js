import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "legacy/**",
      "coverage/**",
      "docs/visual-baselines/**",
      "tests/codegen/fixtures/**",
      ".bun-cache/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/components/Crontab/**/*.vue"],
    rules: {
      // Field radios clamp sibling refs while deriving the cron token.
      "vue/no-side-effects-in-computed-properties": "off",
    },
  },
  {
    files: ["src/views/tool/**/*.vue"],
    rules: {
      // Parent-owned form objects are edited in place (legacy RuoYi two-way props).
      "vue/no-mutating-props": "off",
    },
  },
  eslintConfigPrettier,
);
