/**
 * Prefer functions over classes.
 *
 * Before: class Parser { parse() {} }
 * After:  function parse() {}
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
			fail(file, lineOf(sf, node), "class found -- use functions instead")
		}
	},
})
