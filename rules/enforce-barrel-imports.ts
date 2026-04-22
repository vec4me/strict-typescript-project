/**
 * Cross-folder imports inside boundary directories must go through index.ts.
 *
 * Within the same folder, direct file imports are fine:
 *   client/main/app.tsx -> ./useAppHandlers  (OK, same folder)
 *
 * Across folders, you must import from the folder (resolves to index.ts):
 *   client/main/app.tsx -> ../auth            (OK, barrel import)
 *   client/main/app.tsx -> ../auth/authState  (FORBIDDEN, reaches into internals)
 *
 * Only enforced for directories that follow the boundary pattern.
 */

import { dirname, join, relative } from "node:path"
import ts from "typescript"
import {
	boundaryDirs,
	done,
	fail,
	lineOf,
	parse,
	rel,
	root,
	walk,
} from "../lib"

function getScope(relPath: string): string | null {
	const parts = relPath.split("/")
	if (
		parts.length >= 2 &&
		parts[0] !== undefined &&
		boundaryDirs.has(parts[0])
	) {
		return `${parts[0]}/${parts[1]}`
	}
	return null
}

const files = walk(null)

for (const file of files) {
	const relPath = rel(file)
	const sourceScope = getScope(relPath)
	if (sourceScope === null) {
		continue
	}

	const sf = parse(file)

	ts.forEachChild(sf, function visit(node) {
		if (
			ts.isImportDeclaration(node) &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			const spec = node.moduleSpecifier.text
			if (!spec.startsWith(".")) {
				return
			}
			const resolved = relative(root, join(dirname(file), spec))

			const targetScope = getScope(resolved)
			if (targetScope === null) {
				return
			}

			// Same folder — direct imports are fine
			if (targetScope === sourceScope) {
				return
			}

			// Cross-folder: the import spec must end with the folder name, not a file inside it
			const targetParts = resolved.split("/")
			if (targetParts.length > 2) {
				fail(
					file,
					lineOf(sf, node),
					`import reaches into ${targetScope}/ internals -- import from the folder index instead`,
				)
			}
		}
		ts.forEachChild(node, visit)
	})
}

done()
