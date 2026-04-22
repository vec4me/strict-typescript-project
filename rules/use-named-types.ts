/**
 * Extract inline object types to named type aliases.
 *
 * Before: function save(opts: { name: string; age: number }): void
 * After:  type SaveOpts = { name: string; age: number }
 *         function save(opts: SaveOpts): void
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

function containsObjectType(node: ts.Node): boolean {
	if (ts.isTypeLiteralNode(node)) {
		return true
	}
	return ts.forEachChild(node, containsObjectType) === true
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		// Property signature with inline object type
		if (
			ts.isPropertySignature(node) &&
			node.type &&
			containsObjectType(node.type)
		) {
			fail(
				file,
				lineOf(sf, node),
				"inline object type -- extract to a named type",
			)
			return true
		}
		// Function parameter with inline object type
		if (ts.isParameter(node) && node.type && containsObjectType(node.type)) {
			fail(
				file,
				lineOf(sf, node),
				"inline object type in parameter -- extract to a named type",
			)
			return true
		}
		// Return type with inline object type
		if (
			(ts.isFunctionDeclaration(node) ||
				ts.isMethodDeclaration(node) ||
				ts.isArrowFunction(node) ||
				ts.isFunctionExpression(node)) &&
			node.type &&
			containsObjectType(node.type)
		) {
			fail(
				file,
				lineOf(sf, node),
				"inline object type in return type -- extract to a named type",
			)
			return true
		}
		return false
	},
})
