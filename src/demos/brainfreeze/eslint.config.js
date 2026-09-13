import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**", ".playwright-mcp/**"],
  },
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
