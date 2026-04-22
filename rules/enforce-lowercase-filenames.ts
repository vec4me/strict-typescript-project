/**
 * File names must be lowercase.
 * Hyphens and dots are allowed, but no uppercase letters.
 *
 * Allowed:  auth-state.ts, bubbles.tsx, css.d.ts
 * Forbidden: AuthState.ts, BubbleViewer.tsx, README.md
 */

import { done, fail, rel, walk } from "../lib"

const HAS_UPPERCASE = /[A-Z]/u

const files = walk(null)

for (const file of files) {
	const relPath = rel(file)
	const name = relPath.split("/").pop()
	if (name === undefined) {
		continue
	}
	if (HAS_UPPERCASE.test(name)) {
		fail(
			file,
			0,
			`filename "${name}" contains uppercase -- use lowercase with hyphens`,
		)
	}
}

done()
