/**
 * Prefer explicit conditionals over nullish coalescing (??).
 *
 * Before: const name = user.name ?? "anonymous"
 * After:  const name = user.name !== null ? user.name : "anonymous"
 */

import ts from "typescript"
import { checkAST, fail, lineOf, rel } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
		) {
			fail(
				rel(file),
				lineOf(sf, node),
				"nullish coalescing (??) -- use explicit conditionals instead",
			)
		}
	},
})
