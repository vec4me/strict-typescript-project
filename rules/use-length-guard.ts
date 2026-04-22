/**
 * Prefer length guard over extract-then-undefined-check for array first/last element.
 *
 * Before: const first = arr[0]
 *         fn(first !== undefined ? first : fallback)
 *
 * After:  if (arr.length > 0) { fn(arr[0]) } else { fn(fallback) }
 *
 * Detects: a variable assigned from arr[0] (or arr[N]) that is only used
 * in a `x !== undefined ? x : fallback` ternary on the very next statement.
 */

import ts from "typescript"
import { done, fail, lineOf, parse, walk } from "../lib"

const files = walk(null)

for (const file of files) {
	const sf = parse(file)

	ts.forEachChild(sf, function visitBlock(node) {
		// Only check blocks / source files that contain statement lists
		const stmts = getStatements(node)
		if (stmts !== null) {
			for (let i = 0; i < stmts.length - 1; i += 1) {
				checkPair(
					stmts[i] as ts.Statement,
					stmts[i + 1] as ts.Statement,
					sf,
					file,
				)
			}
		}
		ts.forEachChild(node, visitBlock)
	})
}

done()

function getStatements(node: ts.Node): ts.NodeArray<ts.Statement> | null {
	if (ts.isSourceFile(node)) {
		return node.statements
	}
	if (ts.isBlock(node)) {
		return node.statements
	}
	return null
}

function checkPair(
	first: ts.Statement,
	second: ts.Statement,
	sf: ts.SourceFile,
	file: string,
): void {
	// First statement: const x = arr[N]
	if (!ts.isVariableStatement(first)) {
		return
	}
	const declList = first.declarationList
	if (declList.declarations.length !== 1) {
		return
	}
	const decl = declList.declarations[0] as ts.VariableDeclaration
	if (!ts.isIdentifier(decl.name)) {
		return
	}
	const varName = decl.name.text
	const init = decl.initializer
	if (init === undefined) {
		return
	}
	// Must be arr[index] where index is a numeric literal
	if (!ts.isElementAccessExpression(init)) {
		return
	}
	if (!ts.isNumericLiteral(init.argumentExpression)) {
		return
	}

	// Second statement: must contain `varName !== undefined ? varName : fallback`
	// Walk the second statement looking for that ternary pattern
	ts.forEachChild(second, function search(node) {
		if (
			ts.isConditionalExpression(node) &&
			isUndefinedCheck(node.condition, varName) &&
			isIdentifierNamed(node.whenTrue, varName)
		) {
			fail(
				file,
				lineOf(sf, first),
				`"${varName}" extracted then undefined-checked -- use a length guard instead`,
			)
		}
		ts.forEachChild(node, search)
	})
}

function isUndefinedCheck(node: ts.Node, name: string): boolean {
	if (!ts.isBinaryExpression(node)) {
		return false
	}
	const op = node.operatorToken.kind
	if (
		op !== ts.SyntaxKind.ExclamationEqualsEqualsToken &&
		op !== ts.SyntaxKind.ExclamationEqualsToken
	) {
		return false
	}
	const left =
		isIdentifierNamed(node.left, name) && isUndefinedKeyword(node.right)
	const right =
		isUndefinedKeyword(node.left) && isIdentifierNamed(node.right, name)
	return left || right
}

function isIdentifierNamed(node: ts.Node, name: string): boolean {
	return ts.isIdentifier(node) && node.text === name
}

function isUndefinedKeyword(node: ts.Node): boolean {
	return ts.isIdentifier(node) && node.text === "undefined"
}
