/**
 * Prefer classList/className over setAttribute.
 *
 * Before: el.setAttribute("class", "active")
 * After:  el.classList.add("active")
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "setAttribute"
		) {
			fail(file, lineOf(sf, node), "setAttribute -- use CSS classes")
		}
	},
})
