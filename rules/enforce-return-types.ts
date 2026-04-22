/**
 * All functions must have an explicit return type annotation.
 *
 * Only exception: functions with no body (declarations, overloads, ambient).
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!(ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node))) {
			return false
		}

		if (node.body === undefined) {
			return false
		}

		if (node.type === undefined) {
			const name = node.name !== undefined && ts.isIdentifier(node.name) ? node.name.text : "(anonymous)"
			fail(
				file,
				lineOf(sf, node),
				`function "${name}" is missing a return type annotation`,
			)
		}

		return false
	},
})
