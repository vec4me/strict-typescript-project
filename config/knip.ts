import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"

// When this file runs from its source dir, scriptsDir is correct.
// When it runs as a copy at project root, derive from package.json postinstall.
const ownDir = relative(process.cwd(), import.meta.dirname)
const scriptsDir =
	ownDir ||
	dirname(
		JSON.parse(readFileSync("package.json", "utf-8")).scripts.postinstall.split(
			" ",
		)[1],
	)

const gitignored = new Set(
	readFileSync(join(process.cwd(), ".gitignore"), "utf-8")
		.split(/\n/u)
		.filter((l) => l.endsWith("/"))
		.map((l) => l.slice(0, -1)),
)

const coreDirs = new Set(["client/", "server/", "public/", `${scriptsDir}/`])

function hasTypeScriptFiles(dir: string): boolean {
	try {
		return readdirSync(dir).some((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
	} catch {
		return false
	}
}

const toolEntries = readdirSync(".", { withFileTypes: true })
	.filter(
		(d) =>
			d.isDirectory() &&
			!d.name.startsWith(".") &&
			!gitignored.has(d.name) &&
			!coreDirs.has(`${d.name}/`) &&
			hasTypeScriptFiles(d.name),
	)
	.map((d) => `${d.name}/**/*.{ts,tsx}`)

const knipConfig = {
	entry: [
		"client/main/entry.ts",
		"server/main/entry.ts",
		"server/main/drizzle.config.ts",
		`${scriptsDir}/**/*.ts`,
	].concat(toolEntries),
	project: ["**/*.ts", "**/*.tsx"],
	ignoreDependencies: [
		"@biomejs/biome",
		"@typescript-eslint/utils",
		"tailwindcss",
		"@capacitor/android",
		"@capacitor/ios",
		"@capacitor/assets",
	],
	ignore: ["scripts/rules-paused/**", "server/main/schema.ts"],
	rules: {
		files: "error",
		dependencies: "error",
		unlisted: "error",
		binaries: "error",
		unresolved: "error",
		exports: "error",
		types: "error",
		enumMembers: "error",
		duplicates: "error",
		classMembers: "error",
	},
}

export default knipConfig
