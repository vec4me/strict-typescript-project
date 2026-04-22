/**
 * Files must live inside encapsulation boundary subdirectories,
 * not directly under top-level folders.
 *
 * Allowed:  client/auth/authState.ts  (inside a boundary)
 * Forbidden: client/authState.ts      (loose file at top level)
 *
 * Only enforced for directories that follow the boundary pattern.
 */

import { boundaryDirs, done, fail, rel, walk } from "../lib"

const files = walk(null)

for (const file of files) {
	const relPath = rel(file)
	const parts = relPath.split("/")

	if (parts.length !== 2) {
		continue
	}

	const topDir = parts[0]
	if (topDir === undefined || !boundaryDirs.has(topDir)) {
		continue
	}

	fail(
		file,
		0,
		`file is directly under ${topDir}/ -- move it into a boundary subdirectory`,
	)
}

done()
