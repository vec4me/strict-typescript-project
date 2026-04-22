import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"
const TAB = "\t"
const NEWLINE = "\n"

const FIRST_CHAR_REGEX = /^./u

const version = execSync("npx @biomejs/biome --version", {
	encoding: "utf-8",
})
	.trim()
	.replace("Version: ", "")
const schemaUrl = `https://biomejs.dev/schemas/${version}/schema.json`

const OFF = new Set([
	"a11y/noNoninteractiveElementInteractions",
	"a11y/noStaticElementInteractions",
	"a11y/useFocusableInteractive",
	"a11y/useSemanticElements",
	"a11y/useKeyWithClickEvents",
	"complexity/noExcessiveCognitiveComplexity",
	"complexity/useOptionalChain",
	"complexity/noExcessiveLinesPerFunction",
	"complexity/noVoid",
	"complexity/useMaxParams",
	"correctness/noNodejsModules",
	"correctness/noProcessGlobal",
	"correctness/useImportExtensions",
	"correctness/useImageSize",
	"performance/noBarrelFile",
	"performance/noImgElement",
	"style/noDefaultExport",
	"style/noExportedImports",
	"style/noMagicNumbers",
	"style/noProcessEnv",
	"security/noSecrets",
	"style/useNamingConvention",
	"style/useConsistentObjectDefinitions",
	"style/useConsistentTypeDefinitions",
	"style/useExportsLast",
	"suspicious/noConsole",
	"suspicious/noBitwiseOperators",
	"suspicious/noImportCycles",
	"nursery/useNullishCoalescing",
	"nursery/useDestructuring",
	"nursery/noContinue",
	"nursery/noExcessiveClassesPerFile",
	"nursery/noExcessiveLinesPerFile",
	"nursery/noJsxLiterals",
	"style/noJsxLiterals",
	"nursery/noJsxPropsBind",
	"nursery/noTernary",
	"style/noNestedTernary",
	"nursery/noUnknownAttribute",
	"correctness/noUnresolvedImports",
	"nursery/useAwaitThenable",
	"nursery/useExplicitType",
	"nursery/useMaxParams",
	"nursery/useSpread",
	"style/useObjectSpread",
	"nursery/useSortedClasses",
	"suspicious/noExplicitAny",
	"style/noRestrictedTypes",
	"complexity/useRegexLiterals",
	"correctness/noRestrictedElements",
	"complexity/noStaticOnlyClass",
	"complexity/noThisInStatic",
	"complexity/noUselessConstructor",
	"style/noParameterProperties",
	"style/useReadonlyClassProperties",
	"suspicious/noEmptyInterface",
	"performance/noAccumulatingSpread",
	"nursery/noDuplicatedSpreadProps",
	"suspicious/noNonNullAssertedOptionalChain",
	"suspicious/noBiomeFirstException",
	"suspicious/noQuickfixBiome",
])

type SchemaCategory = {
	properties: Record<string, object>
}

type Schema = {
	$defs: Record<string, SchemaCategory>
}

const response = await fetch(schemaUrl)
if (!response.ok) {
	throw new Error(
		`Failed to fetch biome schema: ${response.status} ${response.statusText}`,
	)
}
const schema: Schema = await response.json()

const RULE_CATEGORIES = [
	"a11y",
	"complexity",
	"correctness",
	"nursery",
	"performance",
	"security",
	"style",
	"suspicious",
]

const FRAMEWORK_PATTERNS = ["Vue", "Qwik", "React", "Next", "Playwright"]

function extractRules(
	schemaData: Schema,
): Record<string, Record<string, string>> {
	const rules: Record<string, Record<string, string>> = {}
	for (const category of RULE_CATEGORIES) {
		const categoryDef =
			schemaData.$defs[
				category.replace(FIRST_CHAR_REGEX, (c) => c.toUpperCase())
			]
		if (categoryDef && categoryDef.properties) {
			rules[category] = {}
			for (const rule of Object.keys(categoryDef.properties)) {
				if (rule === "recommended" || rule === "all") {
					continue
				}
				const isFrameworkSpecific = FRAMEWORK_PATTERNS.some((pattern) =>
					rule.includes(pattern),
				)
				const key = `${category}/${rule}`
				const isOff = OFF.has(key) || isFrameworkSpecific
				rules[category][rule] = isOff ? "off" : "error"
			}
		}
	}
	return rules
}

const rules = extractRules(schema)

const config = {
	$schema: schemaUrl,
	vcs: {
		enabled: true,
		clientKind: "git",
		useIgnoreFile: true,
	},
	files: {
		includes: ["**"],
	},
	formatter: {
		enabled: true,
		indentStyle: "tab",
	},
	linter: {
		enabled: true,
		domains: {
			solid: "all",
			test: "all",
		},
		rules: Object.assign({ recommended: false }, rules),
	},
	javascript: {
		formatter: {
			quoteStyle: "double",
			semicolons: "asNeeded",
		},
		linter: {
			enabled: true,
		},
	},
	json: {
		formatter: {
			enabled: true,
		},
		linter: {
			enabled: true,
		},
		assist: {
			enabled: true,
		},
	},
	css: {
		parser: {
			tailwindDirectives: true,
		},
		formatter: {
			enabled: true,
		},
		linter: {
			enabled: true,
		},
	},
	overrides: [
		{
			includes: ["**/index.ts"],
			linter: {
				rules: {
					performance: {
						noReExportAll: "off",
					},
				},
			},
		},
	],
	assist: {
		enabled: true,
		actions: {
			source: {
				organizeImports: "off",
			},
		},
	},
}

type JsonValue = string | number | boolean | null | object

function formatJson(node: JsonValue, indent: number): string {
	const tab = TAB.repeat(indent)
	const nextTab = TAB.repeat(indent + 1)

	if (node === null) {
		return "null"
	}
	if (typeof node === "string") {
		return JSON.stringify(node)
	}
	if (typeof node === "number" || typeof node === "boolean") {
		return String(node)
	}
	if (Array.isArray(node)) {
		if (node.length === 0) {
			return "[]"
		}
		const simple = node.every(
			(element) => typeof element === "string" || typeof element === "number",
		)
		if (simple) {
			return `[${node.map((element) => JSON.stringify(element)).join(", ")}]`
		}
		const items = node.map(
			(element) => `${nextTab}${formatJson(element, indent + 1)}`,
		)
		return `[${NEWLINE}${items.join(`,${NEWLINE}`)}${NEWLINE}${tab}]`
	}
	const entries = Object.entries(node)
	if (entries.length === 0) {
		return "{}"
	}
	const items = entries.map(
		([key, entry]) =>
			`${nextTab}${JSON.stringify(key)}: ${formatJson(entry, indent + 1)}`,
	)
	return `{${NEWLINE}${items.join(`,${NEWLINE}`)}${NEWLINE}${tab}}`
}

writeFileSync("biome.json", `${formatJson(config, 0)}${NEWLINE}`)
console.log("biome.json created from schema")
