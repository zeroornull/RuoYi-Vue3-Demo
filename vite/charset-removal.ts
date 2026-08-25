import type { PluginCreator } from "postcss";

export const charsetRemoval: PluginCreator<void> = () => ({
  postcssPlugin: "internal:charset-removal",
  AtRule: {
    charset: (atRule) => {
      if (atRule.name === "charset") {
        atRule.remove();
      }
    },
  },
});

charsetRemoval.postcss = true;
