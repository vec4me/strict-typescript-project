/**
 * Function names must start with a verb (verbNoun pattern).
 * Applies to function declarations and arrow/function-expression variables.
 * PascalCase names (components) are skipped.
 */

import ts from "typescript"
import { done, fail, lineOf, parse, walk } from "../lib"
import { VERBS, extractFirstWord } from "../lib"

function isFunctionLiteral(node: ts.VariableDeclaration): boolean {
	const init = node.initializer
	if (init === undefined) {
		return false
	}
	return ts.isArrowFunction(init) || ts.isFunctionExpression(init)
}

/** Zero-parameter arrow functions are reactive accessors (SolidJS getters), not actions. */
function isAccessor(node: ts.VariableDeclaration): boolean {
	const init = node.initializer
	if (init === undefined) {
		return false
	}
	if (ts.isArrowFunction(init) && init.parameters.length === 0) {
		return true
	}
	return false
}

const files = walk(null)

for (const file of files) {
	const sf = parse(file)

	ts.forEachChild(sf, function v(node) {
		let name: string | null = null

		if (ts.isFunctionDeclaration(node) && node.name) {
			name = node.name.text
		} else if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			isFunctionLiteral(node) &&
			!isAccessor(node)
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

		if (name !== null) {
			const verb = extractFirstWord(name)
			if (verb !== null && !VERBS.has(verb)) {
				fail(
					file,
					lineOf(sf, node),
					`"${name}" does not start with a verb (got "${verb}")`,
				)
			}
		}

		ts.forEachChild(node, v)
	})
}

done()
