/**
 * Function names must be camelCase.
 * PascalCase names (components) are exempt.
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const CAMEL = /^[a-z][a-zA-Z0-9]*$/u
const PASCAL = /^[A-Z][a-zA-Z0-9]*$/u

function isFunctionLiteral(init: ts.Expression | undefined): boolean {
	if (init === undefined) {
		return false
	}
	return ts.isArrowFunction(init) || ts.isFunctionExpression(init)
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		let name: string | null = null

		if (ts.isFunctionDeclaration(node) && node.name) {
			name = node.name.text
		} else if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			isFunctionLiteral(node.initializer)
		) {
			name = node.name.text
		} else if (
			ts.isMethodDeclaration(node) &&
			node.name &&
			ts.isIdentifier(node.name)
		) {
			name = node.name.text
		} else if (
			ts.isPropertyAssignment(node) &&
			ts.isIdentifier(node.name) &&
			node.initializer &&
			(ts.isArrowFunction(node.initializer) ||
				ts.isFunctionExpression(node.initializer))
		) {
			name = node.name.text
		}

		if (name !== null && !PASCAL.test(name) && !CAMEL.test(name)) {
			fail(file, lineOf(sf, node), `use camelCase for function "${name}"`)
		}
	},
})
