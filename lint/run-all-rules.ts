/**
 * Batch runner -- executes every rule in a single process so the file walk,
 * content reads, and AST parses are cached and shared.
 *
 * Usage: npx tsx scripts/all-rules.ts
 */

import { readdirSync } from "node:fs"
import { join } from "node:path"
import { getErrorCount, setBatchMode } from "../lib"

setBatchMode()

const dir = join(import.meta.dirname, "../rules")

const scripts = readdirSync(dir)
	.filter((f) => f.endsWith(".ts"))
	.sort()

// Sequential import: rules share caches via setBatchMode()
for (const script of scripts) {
	// biome-ignore lint/performance/noAwaitInLoops: sequential by design
	await import(join(dir, script))
}

const errors = getErrorCount()
if (errors > 0) {
	console.log(`${errors} issue(s) found.`)
	process.exit(1)
}
