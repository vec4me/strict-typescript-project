/**
 * Rename files with uppercase letters to kebab-case.
 * Dry run by default — pass --apply to actually rename.
 *
 * Usage:
 *   npx tsx scripts/lint/rename-to-lowercase.ts          (dry run)
 *   npx tsx scripts/lint/rename-to-lowercase.ts --apply   (rename files)
 */

import { renameSync } from "node:fs"
import { dirname, join } from "node:path"
import { rel, walk } from "../lib"

const HAS_UPPERCASE = /[A-Z]/u
const apply = process.argv.includes("--apply")

function toKebab(name: string): string {
	// Split on uppercase boundaries: "AuthState" → "Auth State" → "auth-state"
	// Handle consecutive caps: "ARView" → "ar-view", "HTMLParser" → "html-parser"
	return name
		.replace(/(?<caps>[A-Z]+)(?<next>[A-Z][a-z])/gu, "$<caps>-$<next>")
		.replace(/(?<low>[a-z0-9])(?<up>[A-Z])/gu, "$<low>-$<up>")
		.toLowerCase()
}

const files = walk(null)
let count = 0

for (const file of files) {
	const relPath = rel(file)
	const parts = relPath.split("/")
	const name = parts.at(-1)
	if (name === undefined || !HAS_UPPERCASE.test(name)) {
		continue
	}

	const newName = toKebab(name)
	const newPath = join(dirname(file), newName)
	const newRel = [...parts.slice(0, -1), newName].join("/")

	if (apply) {
		renameSync(file, newPath)
		console.log(`${relPath} → ${newRel}`)
	} else {
		console.log(`${relPath} → ${newRel}`)
	}
	count += 1
}

if (!apply && count > 0) {
	console.log(`\n${count} files to rename. Run with --apply to execute.`)
}
