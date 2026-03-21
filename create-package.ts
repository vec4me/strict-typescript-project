import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, relative } from "node:path";

const name = basename(process.cwd());
const scriptsDir = relative(process.cwd(), import.meta.dirname);
if (!/^[a-z0-9-]+$/u.test(name)) {
	console.error(
		`Invalid folder name: "${name}" (only lowercase letters, numbers, and hyphens allowed)`,
	);
	process.exit(1);
}

const template = {
	name: name,
	version: "1.0.0",
	type: "module",
	scripts: {
		postinstall: `bash ${scriptsDir}/create-configs-and-patch.sh`,
	},
	dependencies: {
		convex: "^1.33.1",
		"solid-js": "^1.9.11",
	},
	devDependencies: {
		"@biomejs/biome": "^2.4.8",
		"@types/node": "^25.5.0",
		vite: "^8.0.1",
		"vite-plugin-solid": "^2.11.11",
		"@tailwindcss/vite": "^4.2.2",
		tailwindcss: "^4.2.2",
		knip: "^5.88.1",
		tsx: "^4.21.0",
		typescript: "^5.9.3",
	},
};

const existing = existsSync("package.json")
	? JSON.parse(readFileSync("package.json", "utf-8"))
	: {};

Object.assign(template.dependencies, existing.dependencies);
Object.assign(template.devDependencies, existing.devDependencies);

writeFileSync("package.json", `${JSON.stringify(template, null, "\t")}\n`);
