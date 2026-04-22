/**
 * Prefer writing out the type explicitly over utility types.
 *
 * Before: type CreateUser = Omit<User, "id" | "createdAt">
 * After:  type CreateUser = { name: string; email: string }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const BANNED = new Set(["Omit", "Pick", "Required"])

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isTypeReferenceNode(node) &&
			ts.isIdentifier(node.typeName) &&
			BANNED.has(node.typeName.text)
		) {
			fail(
				file,
				lineOf(sf, node),
				`"${node.typeName.text}" -- define an explicit type instead`,
			)
		}
	},
})
