/**
 * Prefer brand functions over `as` casts to complex types.
 * `as const` and simple identifiers (e.g. `as string`) are allowed.
 *
 * Before: const id = row.id as Id<"users">
 * After:  const id = asUserId(row.id)
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!ts.isAsExpression(node)) {
			return
		}
		const castType = node.type
		// Allow "as const"
		if (ts.isTypeReferenceNode(castType) && castType.getText(sf) === "const") {
			return
		}
		// Allow simple identifiers (e.g. "as string", "as Foo")
		if (
			ts.isTypeReferenceNode(castType) &&
			!castType.typeArguments &&
			ts.isIdentifier(castType.typeName)
		) {
			return
		}
		// Allow keyword types (string, number, boolean, etc.)
		if (
			castType.kind >= ts.SyntaxKind.FirstKeyword &&
			castType.kind <= ts.SyntaxKind.LastKeyword
		) {
			return
		}
		fail(
			file,
			lineOf(sf, node),
			"type assertion (as) -- fix types or extract to named function",
		)
	},
})
