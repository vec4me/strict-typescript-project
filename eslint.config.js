import tseslint from "typescript-eslint";

// Type-aware rules only — Biome handles all syntax-level linting.
// These rules require the TypeScript type checker, which Biome cannot access.
export default tseslint.config(
	{
		ignores: ["**/_*/**"],
	},
	{
		files: ["frontend/**/*.{ts,tsx}", "backend/**/*.ts"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
			},
		},
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
		rules: {
			// Unnecessary code (type-aware)
			"@typescript-eslint/no-unnecessary-type-assertion": "error",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"@typescript-eslint/no-unnecessary-type-arguments": "error",
			"@typescript-eslint/no-unnecessary-type-parameters": "error",
			"@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
			"@typescript-eslint/no-unnecessary-template-expression": "error",
			"@typescript-eslint/no-unnecessary-qualifier": "error",
			"@typescript-eslint/no-redundant-type-constituents": "error",

			// Type safety
			"@typescript-eslint/no-base-to-string": "error",
			"@typescript-eslint/no-for-in-array": "error",
			"@typescript-eslint/no-unsafe-argument": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-return": "error",
			"@typescript-eslint/no-unsafe-enum-comparison": "error",
			"@typescript-eslint/no-unsafe-unary-minus": "error",
			"@typescript-eslint/no-unsafe-type-assertion": "error",
			"@typescript-eslint/no-confusing-void-expression": "error",
			"@typescript-eslint/no-meaningless-void-operator": "error",
			"@typescript-eslint/no-mixed-enums": "error",
			"@typescript-eslint/no-deprecated": "error",
			"@typescript-eslint/restrict-plus-operands": "error",
			"@typescript-eslint/restrict-template-expressions": "error",
			"@typescript-eslint/related-getter-setter-pairs": "error",

			// Promise safety
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/require-await": "error",
			"@typescript-eslint/return-await": "error",
			"@typescript-eslint/promise-function-async": "error",
			"@typescript-eslint/prefer-promise-reject-errors": "error",

			// Strict expressions and conditions
			"@typescript-eslint/strict-boolean-expressions": "error",
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/unbound-method": "error",

			// Prefer stricter patterns (type-aware)
			"@typescript-eslint/prefer-includes": "error",
			"@typescript-eslint/prefer-find": "error",
			"@typescript-eslint/prefer-string-starts-ends-with": "error",
			"@typescript-eslint/prefer-regexp-exec": "error",
			"@typescript-eslint/prefer-return-this-type": "error",
			"@typescript-eslint/prefer-reduce-type-parameter": "error",
			"@typescript-eslint/prefer-readonly": "error",
			"@typescript-eslint/prefer-readonly-parameter-types": "off",
		},
	},
);
