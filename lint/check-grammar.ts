/**
 * Parses source files through the Simple JavaScript grammar (Ohm).
 * Only parses changed files by default. Pass --all for everything.
 *
 * Usage:
 *   npx tsx syntax/check.ts          # changed files only
 *   npx tsx syntax/check.ts --all    # entire codebase
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
// biome-ignore lint/performance/noNamespaceImport: ohm-js requires namespace import
import * as ohm from "ohm-js"
import { skipDirs } from "../lib"

const root = join(import.meta.dirname, "../..")
const grammarSource = readFileSync(
	join(import.meta.dirname, "../simple-javascript.ohm"),
	"utf-8",
)
const grammar = ohm.grammar(grammarSource)

function walkAll(): string[] {
	function walk(dir: string): string[] {
		const files: string[] = []
		for (const entry of readdirSync(dir)) {
			if (skipDirs.has(entry) || entry === "syntax") {
				continue
			}
			const full = join(dir, entry)
			if (statSync(full).isDirectory()) {
				for (const f of walk(full)) {
					files.push(f)
				}
			} else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
				files.push(full)
			}
		}
		return files
	}
	return walk(root)
}

const files = walkAll()

if (files.length === 0) {
	console.log("No files to check.")
	process.exit(0)
}

let totalErrors = 0
const t0 = performance.now()

for (const file of files) {
	const source = readFileSync(file, "utf-8")
	const rel = relative(root, file)
	const result = grammar.match(source)

	if (result.failed()) {
		console.log(`${rel} -- ${result.shortMessage}`)
		totalErrors += 1
	}
}

const elapsed = (performance.now() - t0).toFixed(0)

if (totalErrors > 0) {
	console.log(`\n${totalErrors}/${files.length} file(s) failed. (${elapsed}ms)`)
	process.exit(1)
} else {
	console.log(`${files.length} file(s) parsed. (${elapsed}ms)`)
}
