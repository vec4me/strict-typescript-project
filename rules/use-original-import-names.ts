/**
 * Prefer renaming the export over import aliases.
 *
 * Before: import { foo as bar } from "./mod"
 * After:  import { bar } from "./mod"  // rename the export itself
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

function isFromGenerated(node: ts.ImportSpecifier): boolean {
	const decl = node.parent.parent.parent
	if (
		ts.isImportDeclaration(decl) &&
		ts.isStringLiteral(decl.moduleSpecifier)
	) {
		const path = decl.moduleSpecifier.text
		if (path.includes("_generated") || !path.startsWith(".")) {
			return true
		}
	}
	return false
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isImportSpecifier(node) &&
			node.propertyName !== undefined &&
			!isFromGenerated(node)
		) {
			fail(
				file,
				lineOf(sf, node),
				`"${node.propertyName.text} as ${node.name.text}" -- rename the export instead`,
			)
		}
	},
})
