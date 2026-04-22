/**
 * Prefer const with a ternary over let + if reassignment.
 *
 * Case 1 (with initializer):
 *   let x = "default"
 *   if (condition) { x = "other" }
 *   → const x = condition ? "other" : "default"
 *
 * Case 2 (no initializer, nullable type):
 *   let x: T | null
 *   if (condition) { x = value }
 *   → const x = condition ? value : null
 */

import ts from "typescript"
import { checkAST, fail, hasFlag, lineOf, rel } from "../lib"

function lastAssignsTo(block: ts.Statement, varName: string): boolean {
	const inner = ts.isBlock(block) ? block.statements : null
	if (inner === null || inner.length === 0) {
		return false
	}
	const last = inner.at(-1) as ts.Statement | undefined
	if (last === undefined || !ts.isExpressionStatement(last)) {
		return false
	}
	const expr = last.expression
	return (
		ts.isBinaryExpression(expr) &&
		expr.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
		ts.isIdentifier(expr.left) &&
		expr.left.text === varName
	)
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!(ts.isBlock(node) || ts.isSourceFile(node))) {
			return
		}
		const stmts = node.statements
		for (let i = 0; i < stmts.length - 1; i += 1) {
			const decl = stmts[i] as ts.Statement
			const next = stmts[i + 1] as ts.Statement
			if (
				decl === null ||
				next === null ||
				!ts.isVariableStatement(decl) ||
				!ts.isIfStatement(next)
			) {
				continue
			}
			const declList = decl.declarationList
			if (
				declList.declarations.length !== 1 ||
				!hasFlag(declList.flags, ts.NodeFlags.Let)
			) {
				continue
			}
			const varDecl = declList.declarations[0] as ts.VariableDeclaration
			if (!ts.isIdentifier(varDecl.name)) {
				continue
			}
			const varName = varDecl.name.text

			// Skip if there is an else branch (more complex control flow)
			if (next.elseStatement !== null && next.elseStatement !== undefined) {
				continue
			}

			const hasInitializer = varDecl.initializer !== undefined

			if (!(hasInitializer || lastAssignsTo(next.thenStatement, varName))) {
				continue
			}

			if (hasInitializer) {
				// Case 1: single-statement body that reassigns the variable
				const body = next.thenStatement
				const inner = ts.isBlock(body) ? body.statements : null
				if (inner === null || inner.length !== 1) {
					continue
				}
				if (!lastAssignsTo(next.thenStatement, varName)) {
					continue
				}
			}

			fail(
				rel(file),
				lineOf(sf, decl),
				`let + if reassign of "${varName}" -- use a const with a ternary`,
			)
		}
		return true
	},
})
