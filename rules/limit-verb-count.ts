/**
 * Prefer at most one verb per identifier in declarations.
 *
 * Before: function handleSubmitFormData()
 * After:  function submitFormData()
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"
import { VERBS, extractAllWords } from "../lib"

function isDeclarationName(node: ts.Identifier): boolean {
	const parent = node.parent
	if (ts.isVariableDeclaration(parent) && parent.name === node) {
		return true
	}
	if (ts.isFunctionDeclaration(parent) && parent.name === node) {
		return true
	}
	if (ts.isParameter(parent) && parent.name === node) {
		return true
	}
	return false
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!ts.isIdentifier(node)) {
			return
		}
		if (!isDeclarationName(node)) {
			return
		}
		const words = extractAllWords(node.text)
		let verbCount = 0
		for (const word of words) {
			if (VERBS.has(word)) {
				verbCount += 1
			}
		}
		if (verbCount > 1) {
			fail(file, lineOf(sf, node), "prefer at most one verb per identifier")
		}
	},
})
