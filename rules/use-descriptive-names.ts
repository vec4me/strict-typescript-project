/**
 * Variable names should be descriptive -- avoid ambiguous single letters.
 *
 * Before: const e = getEvent()
 * After:  const event = getEvent()
 *
 * Exempt: loop indices (i, j, k), catch variables, arrow parameters,
 * math/physics functions (where all locals are 1-2 chars), and common
 * coordinate variables (x, y, z).
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const SHORT_NAMES = new Set(["e", "n", "p", "q", "r", "s", "t", "u", "v"])

function isMathFunction(node: ts.Node): boolean {
	let fn: ts.Node | undefined = node.parent
	while (fn !== undefined) {
		if (
			ts.isFunctionDeclaration(fn) ||
			ts.isFunctionExpression(fn) ||
			ts.isArrowFunction(fn)
		) {
			break
		}
		fn = fn.parent
	}
	if (fn === undefined) {
		return false
	}
	let allShort = true
	ts.forEachChild(fn, function check(child) {
		if (
			ts.isVariableDeclaration(child) &&
			ts.isIdentifier(child.name) &&
			child.name.text.length > 2
		) {
			allShort = false
		}
		if (allShort) {
			ts.forEachChild(child, check)
		}
	})
	return allShort
}

function isExempt(node: ts.VariableDeclaration): boolean {
	let parent: ts.Node = node.parent
	while (parent !== undefined) {
		if (
			ts.isForStatement(parent) ||
			ts.isForInStatement(parent) ||
			ts.isForOfStatement(parent) ||
			ts.isCatchClause(parent) ||
			ts.isArrowFunction(parent) ||
			ts.isFunctionExpression(parent)
		) {
			return true
		}
		parent = parent.parent
	}
	return false
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			SHORT_NAMES.has(node.name.text) &&
			!isExempt(node) &&
			!isMathFunction(node)
		) {
			fail(file, lineOf(sf, node), "use a descriptive name")
		}
	},
})
