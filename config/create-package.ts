import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { basename, relative } from "node:path"
const TAB = "\t"

const name = basename(process.cwd())
const scriptsDir = relative(process.cwd(), import.meta.dirname)
if (!/^[a-z0-9-]+$/u.test(name)) {
	console.error(
		`Invalid folder name: "${name}" (only lowercase letters, numbers, and hyphens allowed)`,
	)
	process.exit(1)
}

// Default fields — only applied if missing from existing package.json
const defaults: Record<string, unknown> = {
	name: name,
	version: "1.0.0",
	type: "module",
	scripts: {
		postinstall: `bash ${scriptsDir}/create-configs.sh`,
	},
}

// Required dependencies — merged into existing, never removes
const requiredDeps: Record<string, string> = {
	"solid-js": "^1.9.11",
}

const requiredDevDeps: Record<string, string> = {
	"@biomejs/biome": "^2.4.8",
	"@types/node": "^25.5.0",
	vite: "^8.0.1",
	"vite-plugin-solid": "^2.11.11",
	"@tailwindcss/vite": "^4.2.2",
	tailwindcss: "^4.2.2",
	knip: "^5.88.1",
	tsx: "^4.21.0",
	typescript: "^5.9.3",
}

let existing: Record<string, unknown> = {}
if (existsSync("package.json")) {
	existing = JSON.parse(readFileSync("package.json", "utf-8")) as Record<
		string,
		unknown
	>
}

// Apply defaults only for missing top-level fields
for (const key of Object.keys(defaults)) {
	if (!(key in existing)) {
		existing[key] = defaults[key]
	}
}

// Merge dependencies — keep existing versions, add missing
const deps = (existing.dependencies || {}) as Record<string, string>
for (const key of Object.keys(requiredDeps)) {
	if (!(key in deps)) {
		const ver = requiredDeps[key]
		if (ver !== undefined) {
			deps[key] = ver
		}
	}
}
existing.dependencies = deps

const devDeps = (existing.devDependencies || {}) as Record<string, string>
for (const key of Object.keys(requiredDevDeps)) {
	if (!(key in devDeps)) {
		const ver = requiredDevDeps[key]
		if (ver !== undefined) {
			devDeps[key] = ver
		}
	}
}
existing.devDependencies = devDeps

writeFileSync(
	"package.json",
	`${JSON.stringify(existing, null, TAB)}
`,
)
