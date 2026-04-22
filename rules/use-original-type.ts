/**
 * Use the original type directly instead of creating a one-to-one alias.
 *
 * Before: type UserId = string
 * After:  (use string directly, or use a branded type for distinction)
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isTypeAliasDeclaration(node) &&
			!node.typeParameters &&
			ts.isTypeReferenceNode(node.type) &&
			!node.type.typeArguments &&
			ts.isIdentifier(node.type.typeName)
		) {
			fail(
				file,
				lineOf(sf, node),
				`type alias "${node.name.text}" just renames "${node.type.typeName.text}" -- use the original type directly`,
			)
		}
	},
})
