/**
 * Prefer explicit key: value over shorthand properties.
 *
 * Before: return { name, age }
 * After:  return { name: name, age: age }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isShorthandPropertyAssignment(node)) {
			fail(
				file,
				lineOf(sf, node),
				`shorthand property "${node.name.text}" -- use { ${node.name.text}: ${node.name.text} }`,
			)
		}
	},
})
