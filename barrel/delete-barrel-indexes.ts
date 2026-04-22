/**
 * Delete all generated barrel index.ts files inside boundary directories.
 *
 * Usage: npx tsx scripts/barrel/delete-barrel-indexes.ts
 */

import { readFileSync, unlinkSync } from "node:fs"
import { join, relative } from "node:path"
import { root, walkBoundarySubdirs } from "../lib"

const BARREL_LINE = /^export \* from "/u

function isGeneratedBarrel(file: string): boolean {
	const content = readFileSync(file, "utf-8")
	const lines = content.split("\n").filter((l) => l.trim().length > 0)
	return lines.length > 0 && lines.every((l) => BARREL_LINE.test(l))
}

walkBoundarySubdirs((dir) => {
	const indexPath = join(dir, "index.ts")
	try {
		if (isGeneratedBarrel(indexPath)) {
			unlinkSync(indexPath)
			console.log(`deleted: ${relative(root, indexPath)}`)
		}
	} catch {
		// no index.ts
	}
})
