/**
 * Prefer null over empty string to represent absence.
 *
 * Before: const name: string = ""
 * After:  const name: string | null = null
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const ALLOWED_METHODS = new Set([
	"join",
	"replace",
	"split",
	"padStart",
	"toString",
])
const ALLOWED_JSX = new Set(["alt", "value", "label"])

function isAllowed(node: ts.StringLiteral): boolean {
	const parent = node.parent
	if (parent === undefined) {
		return false
	}

	// .join(""), .replace(...), .split(""), .padStart(...), .toString()
	if (
		ts.isCallExpression(parent) &&
		ts.isPropertyAccessExpression(parent.expression) &&
		ALLOWED_METHODS.has(parent.expression.name.text)
	) {
		return true
	}

	// JSX: alt="", value="", label="", data-*=""
	if (ts.isJsxAttribute(parent) && ts.isIdentifier(parent.name)) {
		const name = parent.name.text
		if (ALLOWED_JSX.has(name) || name.startsWith("data-")) {
			return true
		}
	}

	// === "" or !== ""
	if (
		ts.isBinaryExpression(parent) &&
		(parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
			parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken)
	) {
		return true
	}

	// ?? "" or || ""
	if (
		ts.isBinaryExpression(parent) &&
		(parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
			parent.operatorToken.kind === ts.SyntaxKind.BarBarToken) &&
		parent.right === node
	) {
		return true
	}

	// condition ? "" : x  or  condition ? x : ""
	if (ts.isConditionalExpression(parent)) {
		return true
	}

	// return ""
	if (ts.isReturnStatement(parent)) {
		return true
	}

	// x = ""
	if (
		ts.isBinaryExpression(parent) &&
		parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
		parent.right === node
	) {
		return true
	}

	// { key: "" }
	if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
		return true
	}

	// any function call: foo("")
	if (ts.isCallExpression(parent)) {
		return true
	}

	// const x = ""
	if (ts.isVariableDeclaration(parent) && parent.initializer === node) {
		return true
	}

	return false
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isStringLiteral(node) && node.text === "" && !isAllowed(node)) {
			fail(file, lineOf(sf, node), "empty string literal -- use null")
		}
	},
})
