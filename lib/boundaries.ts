/**
 * Boundary pattern detection.
 *
 * A directory follows the boundary pattern when:
 *   1. It has subdirectories containing .ts/.tsx files
 *   2. It has NO loose .ts/.tsx files directly under it (only subdirectories)
 *
 * This module detects which top-level directories follow the pattern
 * and exports the set for use by all boundary-related rules and scripts.
 */

import { lstatSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { root, skipDirs } from "./check"

/** Walk all subdirectories inside boundary dirs, calling fn for each. */
export function walkBoundarySubdirs(fn: (dir: string) => void): void {
	function recurse(dir: string): void {
		for (const entry of readdirSync(dir)) {
			if (skipDirs.has(entry)) {
				continue
			}
			const full = join(dir, entry)
			try {
				if (lstatSync(full).isSymbolicLink()) {
					continue
				}
				if (statSync(full).isDirectory()) {
					fn(full)
					recurse(full)
				}
			} catch {
				// skip inaccessible entries
			}
		}
	}
	for (const name of boundaryDirs) {
		recurse(join(root, name))
	}
}

function isBoundaryDir(dir: string): boolean {
	let hasSubdirWithCode = false
	let hasLooseFile = false

	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		try {
			if (lstatSync(full).isSymbolicLink()) {
				continue
			}
		} catch {
			continue
		}

		if (statSync(full).isDirectory()) {
			if (!hasSubdirWithCode) {
				for (const child of readdirSync(full)) {
					if (child.endsWith(".ts") || child.endsWith(".tsx")) {
						hasSubdirWithCode = true
						break
					}
				}
			}
		} else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
			hasLooseFile = true
		}
	}

	return hasSubdirWithCode && !hasLooseFile
}

/** Set of top-level directory names that follow the boundary pattern. */
export const boundaryDirs = new Set<string>()

for (const entry of readdirSync(root)) {
	if (skipDirs.has(entry)) {
		continue
	}
	const full = join(root, entry)
	try {
		if (lstatSync(full).isSymbolicLink()) {
			continue
		}
		if (statSync(full).isDirectory() && isBoundaryDir(full)) {
			boundaryDirs.add(entry)
		}
	} catch {
		// skip inaccessible entries
	}
}
