/**
 * Fix import paths to match renamed lowercase filenames.
 * Converts "./AuthState" to "./auth-state", "./hotPepper.ts" to "./hot-pepper.ts", etc.
 *
 * Usage:
 *   npx tsx scripts/lint/fix-import-casing.ts          (dry run)
 *   npx tsx scripts/lint/fix-import-casing.ts --apply   (write changes)
 */

import { readFileSync, writeFileSync } from "node:fs"
import { rel, walk } from "../lib"

const apply = process.argv.includes("--apply")

function toKebab(name: string): string {
	return name
		.replace(/(?<caps>[A-Z]+)(?<next>[A-Z][a-z])/gu, "$<caps>-$<next>")
		.replace(/(?<low>[a-z0-9])(?<up>[A-Z])/gu, "$<low>-$<up>")
		.toLowerCase()
}

const HAS_UPPERCASE = /[A-Z]/u
const IMPORT_RE = /from "(?<path>\.\.?\/[^"]+)"/gu

const files = walk(null)
let totalFixes = 0

for (const file of files) {
	const content = readFileSync(file, "utf-8")
	let changed = false

	const updated = content.replace(IMPORT_RE, (_match, importPath: string) => {
		const parts = importPath.split("/")
		const last = parts.at(-1)
		if (last === undefined || !HAS_UPPERCASE.test(last)) {
			return `from "${importPath}"`
		}
		// Check if it has a file extension
		const dotIdx = last.lastIndexOf(".")
		let stem = last
		let ext = ""
		if (dotIdx > 0) {
			stem = last.slice(0, dotIdx)
			ext = last.slice(dotIdx)
		}
		const kebabStem = toKebab(stem)
		if (kebabStem === stem) {
			return `from "${importPath}"`
		}
		parts[parts.length - 1] = kebabStem + ext
		changed = true
		return `from "${parts.join("/")}"`
	})

	if (changed) {
		const relPath = rel(file)
		totalFixes += 1
		if (apply) {
			writeFileSync(file, updated)
			console.log(`fixed: ${relPath}`)
		} else {
			console.log(`would fix: ${relPath}`)
		}
	}
}

if (!apply && totalFixes > 0) {
	console.log(`\n${totalFixes} files to update. Run with --apply to execute.`)
}
