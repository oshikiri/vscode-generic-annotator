import globals from "globals";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules/**/*", "out/**/*"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 6,
      sourceType: "module",
    },

    rules: {
      "prefer-const": "error",
      semi: "error",
      "no-extra-semi": "warn",
      curly: "warn",
      eqeqeq: "error",
    },
  },
];
