import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig([
    globalIgnores(["public/**", "static/js/site.js", "static/js/demos/**"]),
    {
        files: ["src/**/*.ts"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { args: "all", argsIgnorePattern: "^_" },
            ],
        },
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ["src/**/*.js"],
        extends: [js.configs.recommended],
        rules: {
            "no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_" }],
        },
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ["static/js/**/*.js"],
        extends: [js.configs.recommended],
        rules: {
            "no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_" }],
        },
        languageOptions: {
            sourceType: "script",
            globals: globals.browser,
        },
    },
    {
        files: ["eslint.config.mjs", "scripts/**/*.mjs"],
        extends: [js.configs.recommended],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
