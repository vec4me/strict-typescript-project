/**
 * Prefer regex literals over the RegExp constructor.
 *
 * Before: const re = new RegExp("\\d+", "g")
 * After:  const re = /\d+/gu
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "RegExp"
		) {
			fail(file, lineOf(sf, node), "new RegExp -- use a regex literal")
		}
	},
})
