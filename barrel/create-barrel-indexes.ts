/**
 * Create index.ts barrel files inside boundary directories.
 * Overwrites the index.ts with `export * from "./sibling"`
 * for every .ts/.tsx sibling file.
 *
 * Usage: npx tsx scripts/barrel/create-barrel-indexes.ts
 */

import { readdirSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import { root, walkBoundarySubdirs } from "../lib"

const TS_EXT = /\.tsx?$/u

walkBoundarySubdirs((dir) => {
	const siblings = readdirSync(dir)
		.filter(
			(f) =>
				f !== "index.ts" &&
				!f.endsWith(".d.ts") &&
				(f.endsWith(".ts") || f.endsWith(".tsx")),
		)
		.sort()

	if (siblings.length === 0) {
		return
	}

	const lines: string[] = []
	for (const sibling of siblings) {
		const stem = sibling.replace(TS_EXT, "")
		lines.push(`export * from "./${stem}"`)
	}

	const indexPath = join(dir, "index.ts")
	writeFileSync(indexPath, `${lines.join("\n")}\n`)
	console.log(`${relative(root, dir)}/index.ts (${siblings.length} exports)`)
})
