/**
 * index.ts files must only re-export from sibling files,
 * and every sibling .ts/.tsx file must be re-exported.
 *
 * Like allcontexts.cpp in Simpsons Hit & Run — a flat list
 * that includes every file in the directory, nothing else.
 *
 * Only enforced inside directories that follow the boundary pattern.
 */

import { readdirSync } from "node:fs"
import { dirname } from "node:path"
import ts from "typescript"
import { boundaryDirs, done, fail, lineOf, parse, rel, walk } from "../lib"

const files = walk(null)

for (const file of files) {
	if (!file.endsWith("/index.ts")) {
		continue
	}
	const relPath = rel(file)
	const parts = relPath.split("/")

	// Need at least boundaryDir/subdir/index.ts
	if (parts.length < 3) {
		continue
	}

	const topDir = parts[0]
	if (topDir === undefined || !boundaryDirs.has(topDir)) {
		continue
	}

	const sf = parse(file)
	const dir = dirname(file)

	const exported = new Set<string>()
	const importedOnly = new Set<string>()

	ts.forEachChild(sf, (node) => {
		if (node.kind === ts.SyntaxKind.EndOfFileToken) {
			return
		}

		if (ts.isExportDeclaration(node)) {
			if (
				node.moduleSpecifier !== undefined &&
				ts.isStringLiteral(node.moduleSpecifier)
			) {
				exported.add(node.moduleSpecifier.text)
			}
			return
		}

		if (ts.isExportAssignment(node)) {
			return
		}

		if (ts.isImportDeclaration(node)) {
			if (ts.isStringLiteral(node.moduleSpecifier)) {
				importedOnly.add(node.moduleSpecifier.text)
			}
			return
		}

		fail(
			file,
			lineOf(sf, node),
			`index.ts must only re-export -- found ${ts.SyntaxKind[node.kind]}`,
		)
	})

	for (const spec of exported) {
		importedOnly.delete(spec)
	}

	for (const spec of importedOnly) {
		fail(file, 0, `"${spec}" is imported but not re-exported`)
	}

	const siblings = readdirSync(dir).filter((f) => {
		if (f === "index.ts") {
			return false
		}
		return f.endsWith(".ts") || f.endsWith(".tsx")
	})

	for (const sibling of siblings) {
		const stem = sibling.replace(/\.tsx?$/u, "")
		const spec = `./${stem}`
		if (!exported.has(spec)) {
			fail(file, 0, `sibling "${sibling}" is not re-exported from index.ts`)
		}
	}
}

done()
