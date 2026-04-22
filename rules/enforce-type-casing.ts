/**
 * Type alias names must be PascalCase.
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const PASCAL = /^[A-Z][a-zA-Z0-9]*$/u

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isTypeAliasDeclaration(node)) {
			if (!PASCAL.test(node.name.text)) {
				fail(
					file,
					lineOf(sf, node),
					`use PascalCase for type "${node.name.text}"`,
				)
			}
			return true
		}
		return false
	},
})
