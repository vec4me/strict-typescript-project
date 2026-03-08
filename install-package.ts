import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const name = basename(process.cwd());
if (!/^[a-z0-9-]+$/u.test(name)) {
	console.error(
		`Invalid folder name: "${name}" (only lowercase letters, numbers, and hyphens allowed)`,
	);
	process.exit(1);
}

const template = JSON.parse(readFileSync("scripts/package.json", "utf-8"));
const existing = existsSync("package.json")
	? JSON.parse(readFileSync("package.json", "utf-8"))
	: {};

template.name = name;
Object.assign(template.dependencies, existing.dependencies);
Object.assign(template.devDependencies, existing.devDependencies);

writeFileSync("package.json", `${JSON.stringify(template, null, "\t")}\n`);
