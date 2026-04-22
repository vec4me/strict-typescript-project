/**
 * Directory strings must end with trailing /.
 * Usage: npx tsx scripts/rules/require-dir-trailing-slash.ts
 */

import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"
import { checkAST, fail, lineOf, root, skipDirs } from "../lib"

const SKIP = skipDirs

const dirs = new Set<string>()

function collectDirs(dir: string, rel: string): void {
	for (const entry of readdirSync(dir)) {
		if (SKIP.has(entry)) {
			continue
		}
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) {
			let relPath = `${rel}/${entry}`
			if (rel === "") {
				relPath = entry
			}
			dirs.add(relPath)
			collectDirs(full, relPath)
		}
	}
}

collectDirs(root, "")

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isStringLiteral(node) &&
			!node.text.endsWith("/") &&
			dirs.has(node.text) &&
			!ts.isImportDeclaration(node.parent) &&
			!ts.isExportDeclaration(node.parent) &&
			!ts.isLiteralTypeNode(node.parent) &&
			!ts.isCallExpression(node.parent) &&
			!ts.isBinaryExpression(node.parent)
		) {
			fail(file, lineOf(sf, node), `directory "${node.text}" -- use trailing /`)
		}
	},
})
