/**
 * Prefer CSS classes over direct .style mutations.
 *
 * Before: el.style.display = "none"
 * After:  el.classList.add("hidden")
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isPropertyAccessExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "style"
		) {
			fail(file, lineOf(sf, node), ".style mutation -- use CSS classes")
		}
	},
})
