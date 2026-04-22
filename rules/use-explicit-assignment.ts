/**
 * Prefer explicit if-checks over nullish assignment (??=).
 *
 * Before: x ??= fallback
 * After:  if (x === null) { x = fallback }
 */

import ts from "typescript"
import { checkAST, fail, lineOf, rel } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionEqualsToken
		) {
			fail(
				rel(file),
				lineOf(sf, node),
				"nullish assignment (??=) -- use explicit conditionals instead",
			)
		}
	},
})
