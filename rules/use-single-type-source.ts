/**
 * Exported types should be defined in one file only.
 * If the same exported type name appears in multiple files, colocate it.
 *
 * Before: // types.ts: type User = { ... }
 *         // utils.ts: type User = { ... }
 * After:  // types.ts: type User = { ... }
 *         // utils.ts: import type { User } from "./types"
 */

import { done, fail, lineOf, parse, walk } from "../lib"
import ts from "typescript"

const files = walk(null)

type TypeDecl = {
	name: string
	file: string
	line: number
}

const allTypes: TypeDecl[] = []

for (const file of files) {
	const sf = parse(file)

	ts.forEachChild(sf, function visit(node) {
		if (ts.isTypeAliasDeclaration(node)) {
			const isPublic =
				node.modifiers !== undefined &&
				node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
			if (isPublic) {
				allTypes.push({
					name: node.name.text,
					file: file,
					line: lineOf(sf, node),
				})
			}
		}
		ts.forEachChild(node, visit)
	})
}

const byName = new Map<string, TypeDecl[]>()
for (const decl of allTypes) {
	const existing = byName.get(decl.name)
	if (existing === undefined) {
		byName.set(decl.name, [decl])
	} else {
		existing.push(decl)
	}
}

for (const [_, decls] of byName) {
	if (decls.length > 1) {
		for (const decl of decls) {
			fail(decl.file, decl.line, "colocate it")
		}
	}
}

done()
