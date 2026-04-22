/**
 * Files can only import from their own top-level directory.
 * Usage: npx tsx scripts/rules/enforce-module-boundary.ts
 */

import { dirname, join, relative } from "node:path"
import ts from "typescript"
import { done, fail, lineOf, parse, rel, root, walk } from "../lib"

function topDir(relPath: string): string | null {
	const slash = relPath.indexOf("/")
	if (slash === -1) {
		return null
	}
	return relPath.slice(0, slash + 1)
}

const files = walk(null)

for (const file of files) {
	const relPath = rel(file)
	const sourceDir = topDir(relPath)
	if (sourceDir === null) {
		continue
	}

	const sf = parse(file)

	ts.forEachChild(sf, function v(node) {
		function checkSpec(spec: ts.StringLiteral): void {
			if (!spec.text.startsWith(".")) {
				return
			}
			const resolved = relative(root, join(dirname(file), spec.text))
			const targetDir = topDir(resolved)
			if (
				targetDir !== null &&
				targetDir !== sourceDir &&
				targetDir !== "public/"
			) {
				fail(
					file,
					lineOf(sf, node),
					`cross-boundary import -- ${sourceDir} cannot import from ${targetDir}`,
				)
			}
		}

		if (
			ts.isImportDeclaration(node) &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			checkSpec(node.moduleSpecifier)
		}
		if (
			ts.isExportDeclaration(node) &&
			node.moduleSpecifier !== undefined &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			checkSpec(node.moduleSpecifier)
		}
		ts.forEachChild(node, v)
	})
}

done()
