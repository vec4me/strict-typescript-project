/**
 * Variable/function names must not exceed 2 words.
 * Usage: npx tsx scripts/rules/limit-name-length.ts
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"
import { extractAllWords } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isTypeAliasDeclaration(node)) {
			return true
		}

		let name: string | null = null
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
			name = node.name.text
		} else if (ts.isFunctionDeclaration(node) && node.name) {
			name = node.name.text
		} else if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
			name = node.name.text
		} else if (
			ts.isPropertySignature(node) &&
			node.name &&
			ts.isIdentifier(node.name)
		) {
			name = node.name.text
		} else if (
			ts.isMethodDeclaration(node) &&
			node.name &&
			ts.isIdentifier(node.name)
		) {
			name = node.name.text
		} else if (ts.isBindingElement(node) && ts.isIdentifier(node.name)) {
			name = node.name.text
		}

		if (name !== null && extractAllWords(name).length > 4) {
			fail(file, lineOf(sf, node), `"${name}" exceeds 4 words`)
		}
		return false
	},
})
