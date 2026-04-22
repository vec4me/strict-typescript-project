import { writeFileSync } from "node:fs"
import tseslint from "typescript-eslint"
const TAB = "\t"
const NEWLINE = "\n"

// Type-aware rules only -- Biome handles all syntax-level linting,
// and scripts/rules/ handles custom AST rules.
// These rules require the TypeScript type checker, which Biome cannot access.

const OFF = new Set([
	"consistent-type-exports",
	"naming-convention",
	"prefer-destructuring",
	"prefer-nullish-coalescing",
	"prefer-optional-chain",
	"prefer-readonly-parameter-types",
	"strict-void-return",
])

type RuleDocs = {
	requiresTypeChecking: boolean | null
}
type RuleMeta = {
	docs: RuleDocs | null
	deprecated: boolean | null
}
type RuleEntry = { meta: RuleMeta | null }

const pluginRules = (
	tseslint.plugin as unknown as { rules: Record<string, RuleEntry> | null }
).rules
if (pluginRules === null) {
	throw new Error("tseslint plugin has no rules")
}
const typeAwareRules = Object.entries(pluginRules)
	.filter(
		([_, rule]) =>
			rule.meta !== null &&
			rule.meta.docs !== null &&
			rule.meta.docs.requiresTypeChecking === true,
	)
	.filter(([_, rule]) => rule.meta === null || rule.meta.deprecated !== true)
	.map(([name]) => name)
	.sort()

const rules = Object.fromEntries(
	typeAwareRules.map((name) => [
		`@typescript-eslint/${name}`,
		OFF.has(name) ? "off" : "error",
	]),
)

const config = `import tseslint from "typescript-eslint"

export default tseslint.config({
${TAB}files: ["client/**/*.{ts,tsx}", "server/**/*.ts"],
${TAB}languageOptions: {
${TAB}${TAB}parser: tseslint.parser,
${TAB}${TAB}parserOptions: {
${TAB}${TAB}${TAB}projectService: true,
${TAB}${TAB}},
${TAB}},
${TAB}plugins: {
${TAB}${TAB}"@typescript-eslint": tseslint.plugin,
${TAB}},
${TAB}rules: {
${Object.entries(rules)
	.map(([key, value]) => `${TAB}${TAB}"${key}": "${value}",`)
	.join(NEWLINE)}
${TAB}},
})
`

writeFileSync("eslint.config.ts", config)
console.log("eslint.config.ts created from typescript-eslint plugin")
