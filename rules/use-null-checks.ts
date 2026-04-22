/**
 * Prefer explicit null checks over optional chaining (?.).
 *
 * Before: const name = user?.profile?.name
 * After:  const profile = user !== null ? user.profile : null
 *         const name = profile !== null ? profile.name : null
 */

import ts from "typescript"
import { checkAST, fail, lineOf, rel } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			(ts.isPropertyAccessExpression(node) ||
				ts.isElementAccessExpression(node) ||
				ts.isCallExpression(node)) &&
			node.questionDotToken !== undefined
		) {
			fail(
				rel(file),
				lineOf(sf, node),
				"optional chaining (?.) -- use explicit null checks instead",
			)
		}
	},
})
