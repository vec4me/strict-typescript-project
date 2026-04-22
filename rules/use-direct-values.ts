/**
 * Prefer direct values over zero-param arrows that return a constant.
 *
 * Before: const MAX = () => 100
 * After:  const MAX = 100
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

function isLiteral(node: ts.Node): boolean {
	if (
		ts.isNumericLiteral(node) ||
		ts.isStringLiteral(node) ||
		ts.isNoSubstitutionTemplateLiteral(node) ||
		node.kind === ts.SyntaxKind.TrueKeyword ||
		node.kind === ts.SyntaxKind.FalseKeyword ||
		node.kind === ts.SyntaxKind.NullKeyword
	) {
		return true
	}
	if (
		ts.isPrefixUnaryExpression(node) &&
		(node.operator === ts.SyntaxKind.MinusToken ||
			node.operator === ts.SyntaxKind.PlusToken) &&
		ts.isNumericLiteral(node.operand)
	) {
		return true
	}
	return false
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isArrowFunction(node) &&
			node.parameters.length === 0 &&
			!ts.isBlock(node.body) &&
			isLiteral(node.body)
		) {
			fail(
				file,
				lineOf(sf, node),
				"constant arrow function -- use the value directly",
			)
		}
	},
})
