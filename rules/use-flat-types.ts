/**
 * Prefer explicit flat types over intersections.
 * Branded primitives (string & { __brand: "X" }) are allowed.
 *
 * Before: type Admin = User & { role: string }
 * After:  type Admin = { name: string; email: string; role: string }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const primitives = new Set([
	ts.SyntaxKind.StringKeyword,
	ts.SyntaxKind.NumberKeyword,
	ts.SyntaxKind.BigIntKeyword,
	ts.SyntaxKind.BooleanKeyword,
	ts.SyntaxKind.SymbolKeyword,
])

function containsPrimitive(node: ts.IntersectionTypeNode): boolean {
	return node.types.some((t) => primitives.has(t.kind))
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isIntersectionTypeNode(node) && !containsPrimitive(node)) {
			fail(
				file,
				lineOf(sf, node),
				"intersection type -- define an explicit type instead of using &",
			)
		}
	},
})
